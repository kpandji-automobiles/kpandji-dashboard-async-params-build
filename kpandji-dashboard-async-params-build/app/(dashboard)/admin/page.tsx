import { requireAdminUser } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import InviteForm from "./InviteForm";
import RoleEditor from "./RoleEditor";
import DeactivateButton from "./DeactivateButton";
import { UserRole } from "@/lib/user-role-constants";
import UserProfileEditor from "./UserProfileEditor";
import { UserProfile } from "@clerk/nextjs";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  try {
    const adminUser = await requireAdminUser();
  } catch {
    notFound();
  }

  const params = await searchParams;
  const page = Number(params.page ?? "1");

  if (!Number.isSafeInteger(page) || page < 1) {
    redirect("/admin?page=1");
  }

  const limit = 50;
  const offset = (page - 1) * limit;
  const clerk = await clerkClient();

  const { data: users, totalCount } = await clerk.users.getUserList({
    limit,
    offset,
  });

  const clerkIds = users.map((user) => user.id);

  const dbUsers = await prisma.user.findMany({
    where: {
      clerkId: { in: clerkIds },
    },
    select: {
      clerkId: true,
      role: true,
    },
  });

  const roleByClerkId = new Map(
    dbUsers.map((dbUser) => [dbUser.clerkId, dbUser.role]),
  );

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <h1>Page Administrateur {page}</h1>

      <InviteForm />

      {users.map((user) => {
        const currentRole = roleByClerkId.get(user.id);
        return (
          <div key={user.id}>
            <UserProfileEditor{
              
            }/>
            <div>
              {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                "Nom non renseigné"}
            </div>
            <div>
              {user.primaryEmailAddress?.emailAddress ?? "Email absent"}
            </div>
            <div>{user.id}</div>
            <div>Rôle : {currentRole ?? "Inscription non terminée"}</div>
            <div>
              {currentRole !== undefined && currentRole !== UserRole.ADMIN && (
            
                  <div>
                    Modifier :
                    <RoleEditor clerkId={user.id} currentRole={currentRole} />
                  </div>

                 
              
              )}
              {currentRole !== UserRole.ADMIN && user.publicMetadata.role !== UserRole.ADMIN && (
                 <div>
                    <DeactivateButton clerkId={user.id} banned={user.banned} />
                  </div>
              )}
            </div>

            <br />
          </div>
        );
      })}

      <div className="flex justify-between m-8 p-5">
        {page > 1 && <Link href={`/admin?page=${page - 1}`}>Précédent</Link>}
        {page < totalPages && (
          <Link href={`/admin?page=${page + 1}`}>Suivant</Link>
        )}
      </div>
    </div>
  );
}
