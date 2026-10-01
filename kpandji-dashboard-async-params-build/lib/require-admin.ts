import { prisma } from './prisma';
import { getApprouvedUser } from './require-approved-user';


export async function requireAdminUser(){

    const clerkId = await getApprouvedUser();

    const user = await prisma.user.findUnique({
        where: {
            clerkId,
        },
    });


    if(user?.role !== "ADMIN"){
        throw new Error ("Utilisateur n'est pas qualifié");
    }

    return user;

}
