import { auth, currentUser } from '@clerk/nextjs/server'



export async function getApprouvedUser(){

    //Test si l'utilisateur est valide sinon refuse la session

     const { userId } = await auth.protect() //si l'utilisateur n'a pas l'autorisation BLOQUE

     //Ici utilisateur connecté


     //Mise a jour l'utilisateur courant de Clerk

     const user = await currentUser();

     if(user?.publicMetadata.onboardingCompleted !== true){
        throw new Error("Utilisateur non approuvé");
     }

     return userId; //retourne un string / pas un objet


}