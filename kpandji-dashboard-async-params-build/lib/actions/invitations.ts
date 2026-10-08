"use server";

import { requireAdminUser } from "../require-admin";
import z from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "../user-role-constants";

const emailSchema = z.string().email("Email Invalide");

export default async function Invitation(
  emailUser: string,
  chosenRole: string,
) {
  try {
    await requireAdminUser();
  } catch (error) {
    return { success: false, error: "He isn't an Admin" };
  }

  try {
    const result = emailSchema.safeParse(emailUser);

    if (!result.success) {
      return { success: false, error: "Email invalide" };
    }

    const validEmail = result.data;

    if (!Object.values(UserRole).includes(chosenRole as UserRole)) {
      return { success: false, error: "Role Invalide" };
    }

    if (chosenRole === UserRole.ADMIN || chosenRole === UserRole.EMPLOYEE) {
      return {
        success: false,
        error: "Ce rôle ne peut pas être attribué lors de l'invitation",
      };
    }

    const roleValable = chosenRole as UserRole;

    const client = await clerkClient();
    const url = new URL("https://heroic-fish-1647.accounts.dev/sign-up");

    url.searchParams.set("redirect_url", "http://localhost:3000/");

    await client.invitations.createInvitation({
      emailAddress: validEmail,
      publicMetadata: {
        role: roleValable,
      },
      redirectUrl: url.toString(),
    });
    return { success: true };
  } catch {
    return { success: false, error: "Invitation failed" };
  }
}
