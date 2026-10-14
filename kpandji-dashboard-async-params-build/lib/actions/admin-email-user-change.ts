"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { requireAdminUser } from "../require-admin";
import { prisma } from "../prisma";

export default async function confirmUserEmailChange(
  targetClerkId: string,
  emailAddressId: string,
) {
  await requireAdminUser();

  const client = await clerkClient();
  const targetUser = await client.users.getUser(targetClerkId);

  const emailToPromote = targetUser.emailAddresses.find(
    (email) => email.id === emailAddressId,
  );

  if (!emailToPromote || emailToPromote.verification?.status !== "verified") {
    return { success: false, error: "L'email rechercher n'existe pas " };
  }

  const oldPrimaryEmailId = targetUser.primaryEmailAddressId;

  const targetUserInDb = await prisma.user.findUnique({
    where: {
      clerkId: targetClerkId,
    },
  });

  if (!targetUserInDb) {
    return { success: false, error:"pas de targetInDb"};
  }

  if (!oldPrimaryEmailId) {
    return {
      success: false,
      error: "Erreur rollback : ancienne information absente.",
    };
  }

  try {
    await client.users.updateUser(targetClerkId, {
      primaryEmailAddressID: emailToPromote.id,
    });
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: "Erreur : La modification du mail n'a pas pu être effectué",
    };
  }
  try {
    await prisma.user.update({
      where: {
        clerkId: targetClerkId,
      },
      data: {
        email: emailToPromote.emailAddress,
      },
    });

    return { success: true, message: "Adresse principale modifiée" };
  } catch (error) {
    console.error(error)
    try {
      await client.users.updateUser(targetClerkId, {
        primaryEmailAddressID: oldPrimaryEmailId,
      });

      return {
        
        success: false,
        error: "Ancienne adresse principale à été restaurée",
      };
    } catch (error) {
        console.error(error)
      return {
        success: false,
        error:
          "Restauration échoué : une verification manuelle est nécessaire.",
      };
    }
  }
}
