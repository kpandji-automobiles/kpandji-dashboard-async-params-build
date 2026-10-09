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

  if (roleValidate.data === user.role) {
    return { success: true, unchanged: true };
  }

  //MAJ Clerk
  try {
    await client.users.updateUserMetadata(targetUser.id, {
      publicMetadata: {
        role: roleValidate.data,
      },
    });
  } catch (error) {
    return { success: false, error: "La MAJ Clerk à échoué" };
  }

  try {
    //MAJ Prisma
    await prisma.user.update({
      where: {
        clerkId: targetUser.id,
      },
      data: {
        role: roleValidate.data,
      },
    });
  } catch (error) {
    try {
      await client.users.updateUserMetadata(targetUser.id, {
        publicMetadata: {
          role: oldRole,
        },
      });
    } catch {
      return {
        success: false,
        error: "Prisma a échoué et le rollback Clerk a également échoué.",
      };
    }
    return {
      success: false,
      error: "La mise à jour Prisma a échoué.",
    };
  }

  const sessionIds: string[] = [];
  const limit = 100;
  let offset = 0;

  try {
    while (true) {
      const { data: sessions, totalCount } =
        await client.sessions.getSessionList({
          userId: targetUser.id,
          status: "active",
          limit,
          offset,
        });

      //1. Si sessions est vide -> arrêter
      if (sessions.length === 0) {
        break;
      }
      sessionIds.push(...sessions.map((session) => session.id));

      offset += sessions.length;

      if (offset >= totalCount) {
        break;
      }
    }

    const results = await Promise.allSettled(
      sessionIds.map((sessionId) => client.sessions.revokeSession(sessionId)),
    );
    const failed = results.filter((result) => result.status === "rejected");
    failed.forEach((result) => {
      if (result.status === "rejected") {
        console.error(result.reason);
      }
    });
    if (failed.length > 0) {
      return {
        success: false,
        error: "le rôle à été modifié mais les sessions doivent être vérifié",
        roleChanged: true,
      };
    }
  } catch (error) {
    console.error("Au moins une révocation à échoué");
    return {
      success: false,
      error: "le rôle à été modifié mais les sessions doivent être vérifié",
      roleChanged: true,
    };
  }
  return { success: true };
}
