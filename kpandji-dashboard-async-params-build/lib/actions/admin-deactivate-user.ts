"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { requireAdminUser } from "../require-admin";
import { UserRole } from "../user-role-constants";

export default async function deactivateUser(targetClerkId: string) {
      
  const adminUser = await requireAdminUser();

  if (adminUser.clerkId === targetClerkId) {
    throw new Error(
      "L'identifiant est le même, l'admin ne peux pas se desactivé lui-même",
    );
  }

  //test prisma

  const user = await prisma.user.findUnique({
    where: {
      clerkId: targetClerkId,
    },
  });

  if (user && user.role === "ADMIN") {
    throw new Error("Erreur Utilisateur");
  }

  //test clerk

  const client = await clerkClient();

  const targetUser = await client.users.getUser(targetClerkId);

  if (
    targetUser.publicMetadata.role === UserRole.ADMIN
  ) {
    return { success: false, error: "Erreur concernant le compte ciblé" };
  }

  if(targetUser.banned === true){
    return{ success:false, error : "le compte est déjà désactivé"};

  }

  try{

    await client.users.banUser(targetClerkId)
    return {success: true}
  }catch (error){
    console.error(error)
return { success: false, error: "la désactivation n'a pas fonctionnée "}
  }


}
