import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { getApprouvedUser } from "@/lib/require-approved-user";
import { notFound, redirect } from "next/navigation";

export default async function ParametresPage() {
  let clerkId: string;

  try {
    clerkId = await getApprouvedUser();
  } catch {
    redirect("/onboarding");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      telephone: true,
      department: true,
      role: true,
    },
  });

  if (!user) {
    notFound();
  }

  const informations = [
    { label: "Prénom", value: user.firstName },
    { label: "Nom", value: user.lastName },
    { label: "Adresse email", value: user.email },
    { label: "Téléphone", value: user.telephone?.trim() || "Non renseigné" },
    { label: "Service", value: user.department?.trim() || "Non renseigné" },
    { label: "Rôle", value: user.role.replaceAll("_", " ") },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">


        <section
          aria-labelledby="compte-title"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2
            id="compte-title"
            className="text-lg font-semibold text-slate-900"
          >
            Mon compte
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pour modifier ces informations, contactez un administrateur.
          </p>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            {informations.map(({ label, value }) => (
              <div
                key={label}
                className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <dt className="text-sm font-medium text-slate-500">
                  {label}
                </dt>
                <dd className="mt-1 break-words font-semibold text-slate-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}