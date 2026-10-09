"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { requireAdminUser } from "../require-admin";
import { emailSchema } from "../validation/admin-user-email-profile";
import { prisma } from "../prisma";

export default async function requestUserEmailChange(
  targetClerkId: string,
  input: unknown,
) {
  await requireAdminUser();

  const result = emailSchema.safeParse(input);

  if (result.success === false) {
    return { success: false, error: "Données Invalide" };
  }

  const client = await clerkClient();

  const targetUser = await client.users.getUser(targetClerkId);

  try {
    const emailAddress = await client.emailAddresses.createEmailAddress({
      userId: targetUser.id,
      emailAddress: result.data.email,
      verified: false,
      primary: false,
    });

//     await emailAddressId.prepareVerification({
//         strategy: "email_code"
//   })

    return {
      emailAddress : emailAddress.id,
      success: true,
      message: "Adresse ajoutée, vérification en attente",
    };
  } catch (error) {
    if(error && typeof error === "object" && "errors" in error){
        console.error("Details Clerk : ", error.errors); 
    }
   
    return {
      success: false,
      error: "Erreur, l'adresse n'a pas pu être ajoutée",
    };
  }

  


  
}
