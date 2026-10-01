import { auth, currentUser } from '@clerk/nextjs/server'



export async function getApprouvedUser(){

    //Test si l'utilisateur est valide sinon refuse la session

     const { userId } = await auth.protect()


     //Test après misa a jour de l'Etat de Clerk

     const user = await currentUser();

     if(user?.publicMetadata.onboardingCompleted !== true){
        throw new Error("Utilisateur non approuvé");
     }

     return userId;


}