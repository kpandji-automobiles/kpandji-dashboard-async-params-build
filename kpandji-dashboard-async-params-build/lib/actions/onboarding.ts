"use server";

import { clerkClient, auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

async function persistOnboardedUser(
  clerkId: string,
  department?: string,
  telephone?: string,
) {
  const user = await (await clerkClient()).users.getUser(clerkId);

  if (!user || !user.firstName || !user.lastName) {
    throw new Error("User not found");
  }

  const email = user.emailAddresses[0]?.emailAddress ?? `${user.id}@clerk.temp`;

  if (user.publicMetadata.onboardingCompleted === true) {
    throw new Error("L'inscription est déjà terminé");
  }

  const userData = {
    email,
    firstName: user.firstName,
    lastName: user.lastName,

    department,
    telephone,
  };

  const existingByClerkId = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (existingByClerkId) {
    await prisma.user.update({
      where: { clerkId: user.id },
      data: userData,
    });
  } else {
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      throw new Error("Cette adresse e-mail est déjà liée à un autre compte.");
    }
    await prisma.user.create({
      data: {
        clerkId: user.id,
        ...userData,
      },
    });
  }

  await (
    await clerkClient()
  ).users.updateUserMetadata(user.id, {
    publicMetadata: {
      applicationSubmitted: true,
      onboardingCompleted: false,

      ...(department !== undefined && { department }),
      ...(telephone !== undefined && { telephone }),
    },
  });

  return;
}

export async function completeUserOnboarding(
  department: string | undefined,
  telephone?: string,

  //ClerkId retirer remplacé par userId, le navigateur ne fournit plus son identité
) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Utilisateur non connecté" };
  }

  try {
    await persistOnboardedUser(userId, department, telephone);
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to complete onboarding",
    };
  }
}
