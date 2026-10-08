"use server";

import { requireAdminUser } from "../require-admin";
import { prisma } from "../prisma";
import { UserRole } from "../user-role-constants";
import z from "zod";
import { clerkClient } from "@clerk/nextjs/server";

export default async function reassignUserRole(
  clerkId: string,
  newRole: string,
) {
  const adminUser = await requireAdminUser();

  console.log(adminUser.role);

  if (adminUser.clerkId === clerkId) {
    throw new Error(
      "L'identifiant est le même, l'admin ne peux approuver son compte",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: clerkId,
    },
  });

  if (!user || user.role === UserRole.ADMIN) {
    throw new Error("Erreur utilisateur");
  }

  const roleSchema = z
    .enum(UserRole)
    .refine((role) => role !== UserRole.ADMIN && role !== UserRole.EMPLOYEE, {
      message: "Ce n'est pas aurotisé",
    });

  const roleValidate = roleSchema.safeParse(newRole);

  if (roleValidate.success === false) {
    return { success: false, error: "Le role n'est pas valide" };
  }

  const client = await clerkClient();

  const targetUser = await client.users.getUser(clerkId);

  if (
    targetUser.publicMetadata.onboardingCompleted !== true ||
    targetUser.publicMetadata.role === UserRole.ADMIN ||
    targetUser.publicMetadata.role !== user.role
  ) {
    return { success: false, error: "Erreur concernant le compte ciblé" };
  }

  const oldRole = user.role;

  await prisma.user.update({
    where: {
        clerkId: targetUser.id,
    },
    data: {
        role: user.role,
    }
  })

  return { success: true, role: user.role, newRole: roleValidate.data };
}
