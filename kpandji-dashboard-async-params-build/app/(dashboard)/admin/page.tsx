import { requireAdminUser } from "@/lib/require-admin";
import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  try {
    await requireAdminUser();
  } catch {
    return notFound();
  }

  const params = await searchParams;
  const page = Number(params.page ?? "1");

  if (!Number.isSafeInteger(page) || page < 1) {
    redirect("/admin?page=1");
  }

  const client = await clerkClient();

  const limit = 50;
  const offset = (page - 1) * limit;

  const { data: users, totalCount } = await client.users.getUserList({
    limit,
    offset,
  });

  const totalPages = Math.ceil(totalCount/limit)

  const pendingUsers = users.filter((user) => {
    return (
      user.publicMetadata?.applicationSubmitted === true &&
      user.publicMetadata?.onboardingCompleted !== true
    );
  });

  return (
    <div>
      <h1>Page Administrateur {page}</h1>

      {pendingUsers.map((user) => (
        <div key={user.id}>
          <div>{user.firstName}</div>
          <div>{user?.primaryEmailAddress?.emailAddress}</div>
          <div>{user?.id}</div>
        </div>
      ))}
      <div className="flex justify-between m-8 p-5">
        {page > 1 && (
            <Link href={`/admin?page=${page-1}`}>Précédent</Link>
        )}
        {page < totalPages && (

           <Link href={`/admin?page=${page+1}`}>Suivant</Link>
        )}
    
      </div>
    </div>
  );
}
