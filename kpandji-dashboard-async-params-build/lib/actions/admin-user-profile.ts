"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { requireAdminUser } from "../require-admin";
import { schemaUser } from "../validation/admin-user-profile";
import { prisma } from "../prisma";

export default async function updateUserProfile(
  targetClerkId: string,
  input: unknown,
) {
  await requireAdminUser();

  const result = schemaUser.safeParse(input);

  if (!result.success) {
    return { success: false, error: "Données Invalides" };
  }

  const client = await clerkClient();

  const targetUser = await client.users.getUser(targetClerkId);

  const oldUser = await prisma.user.findUnique({
    //ancienne état prisma
    where: {
      clerkId: targetClerkId,
    },
  });

  const oldClerkProfile = {
    //ancienne état clerk
    firstName: targetUser.firstName,
    lastName: targetUser.lastName,
    department: targetUser.publicMetadata.department,
    telephone: targetUser.publicMetadata.telephone,
  };

  try {
    const updateUser = await client.users.updateUser(targetUser.id, {
      firstName: result.data.firstName,
      lastName: result.data.lastName,
    });

    await client.users.updateUserMetadata(targetUser.id, {
      publicMetadata: {
        department: result.data.department,
        telephone: result.data.telephone,
      },
    });
    if (oldUser) {
       await prisma.user.update({
        where: {
          clerkId: targetClerkId,
        },
        data: {
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          department: result.data.department,
          telephone: result.data.telephone,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Échec de la mise à jour du profil :", error);

    try {
      await client.users.updateUser(targetUser.id, {
        firstName: oldClerkProfile.firstName ?? "",
        lastName: oldClerkProfile.lastName ?? "",
      });
      

      await client.users.updateUserMetadata(targetUser.id, {
        publicMetadata: {
          department: oldClerkProfile.department ?? null,
          telephone: oldClerkProfile.telephone ?? null,
        },
      });

      return {
        success: false,
        error: "Modification échouée ; vérification manuelle nécessaire.",
      };
    } catch (rollbackError) {
      console.error("Échec de la restauration Clerk :", rollbackError);

      return {
        success: false,
        error:
          "Modification échouée et restauration Clerk incomplète : vérification manuelle nécessaire.",
      };
    }
  }
}
