"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { requireAdminUser } from "../require-admin";
import { UserRole } from "@prisma/client";

export default async function approvePendingUser(
  role: string,
  targetClerkId: string,
) {
  const adminUser = await requireAdminUser();

  if (adminUser.clerkId === targetClerkId) {
    throw new Error(
      "L'identifiant est le même, l'admin ne peux approuver son compte",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: targetClerkId,
    },
  });

  if (user === null) {
    throw new Error("Error");
  }

  const targetClerkUser = await (
    await clerkClient()
  ).users.getUser(targetClerkId);

  if (targetClerkUser.publicMetadata.applicationSubmitted !== true) {
    throw new Error("Cet utilisateur n’a pas soumis de demande.");
  }
  if (targetClerkUser.publicMetadata.onboardingCompleted === true) {
    throw new Error("Cet utilisateur est déjà approuvé.");
  }

  if (!Object.values(UserRole).includes(role as UserRole)) {
    throw new Error("Rôle invalide");
  }

  if (role === UserRole.ADMIN || role === UserRole.EMPLOYEE) {
    throw new Error("Ce rôle ne peut pas être attribué lors de l’approbation");
  }

  const roleValable = role as UserRole;

  const oldRole = user.role;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: roleValable,
    },
  });

  try {
    await (
      await clerkClient()
    ).users.updateUserMetadata(targetClerkId, {
      publicMetadata: {
        role: roleValable,
        onboardingCompleted: true,
      },
    });
    return { success: true };
  } catch (clerkError) {
    console.error("Erreur lors de la mise à jour Clerk :", clerkError);

    let currentClerkUser;
    try {
      currentClerkUser = await (
        await clerkClient()
      ).users.getUser(targetClerkId);
    } catch (verificationError) {
      console.error("Impossible de vérifier l’état Clerk :", verificationError);
      return {
        success: false,
        error: "État incertain : une vérification manuelle est nécessaire.",
      };
    }

    const metadata = currentClerkUser.publicMetadata;

    if (
      metadata.onboardingCompleted === true &&
      metadata.role === roleValable
    ) {
      return { success: true };
    }

    if (
      metadata.onboardingCompleted === true ||
      metadata.role !== targetClerkUser.publicMetadata.role
    ) {
      console.error("État Clerk contradictoire après l’approbation.");
      return {
        success: false,
        error: "État incohérent : une vérification manuelle est nécessaire.",
      };
    }

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: oldRole },
      });
      return {
        success: false,
        error:
          "L’approbation dans Clerk a échoué ; l’ancien rôle a été rétabli.",
      };
    } catch (rollbackError) {
      console.error("Impossible de restaurer le rôle Prisma :", rollbackError);
      return {
        success: false,
        error:
          "La restauration a échoué : une vérification manuelle est nécessaire.",
      };
    }
  }
}
