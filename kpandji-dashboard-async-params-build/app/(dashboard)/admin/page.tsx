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
import ConfirmEmailButton from "./ConfirmEmailButton";
import { ChevronDown, MailPlus, ShieldCheck, UserCheck, UserRoundX, Users } from "lucide-react";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  try {
    await requireAdminUser();
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
  const activeOnPage = users.filter((user) => !user.banned && user.publicMetadata.onboardingCompleted === true).length;
  const inactiveOnPage = users.filter((user) => user.banned).length;
  const pendingOnPage = users.filter((user) => !user.banned && user.publicMetadata.onboardingCompleted !== true).length;

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-8 text-white shadow-lg sm:px-8">
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Espace sécurisé
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Administration</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Invitez des collaborateurs et gérez leurs accès depuis un seul endroit.
              </p>
            </div>
            <a href="#invitations" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
              <MailPlus className="h-4 w-4" aria-hidden="true" />
              Inviter un utilisateur
            </a>
          </div>
        </header>

        <section aria-label="Vue d’ensemble des comptes" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Utilisateurs", value: totalCount, hint: "Total dans Clerk", icon: Users, color: "bg-sky-50 text-sky-700" },
            { label: "Actifs", value: activeOnPage, hint: "Sur cette page", icon: UserCheck, color: "bg-emerald-50 text-emerald-700" },
            { label: "À finaliser", value: pendingOnPage, hint: "Sur cette page", icon: MailPlus, color: "bg-amber-50 text-amber-700" },
            { label: "Désactivés", value: inactiveOnPage, hint: "Sur cette page", icon: UserRoundX, color: "bg-rose-50 text-rose-700" },
          ].map(({ label, value, hint, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
                <p className="text-xs text-slate-400">{hint}</p>
              </div>
            </div>
          ))}
        </section>

        <section id="invitations" aria-labelledby="invitations-title" className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 id="invitations-title" className="text-lg font-semibold text-slate-900">Inviter un collaborateur</h2>
            <p className="mt-1 text-sm text-slate-500">Le lien est envoyé à une adresse précise avec le rôle choisi.</p>
          </div>
          <InviteForm />
        </section>

        <section id="utilisateurs" aria-labelledby="users-title" className="scroll-mt-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 id="users-title" className="text-lg font-semibold text-slate-900">Utilisateurs</h2>
              <p className="mt-1 text-sm text-slate-500">Ouvrez un compte pour modifier son profil, son rôle ou son accès.</p>
            </div>
            <p className="text-sm tabular-nums text-slate-500">Page {page} sur {Math.max(totalPages, 1)}</p>
          </div>

          {users.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" aria-hidden="true" />
              <p className="mt-3 font-medium text-slate-900">Aucun utilisateur sur cette page</p>
              <p className="mt-1 text-sm text-slate-500">Envoyez une invitation ou revenez à la page précédente.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((user) => {
                const currentRole = roleByClerkId.get(user.id);
                const verifiedSecondaryEmails = user.emailAddresses.filter(
                  (email) => email.id !== user.primaryEmailAddressId && email.verification?.status === "verified",
                );
                const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Nom non renseigné";
                const status = user.banned ? "Désactivé" : user.publicMetadata.onboardingCompleted === true ? "Actif" : "À finaliser";

                return (
                  <details key={user.id} className="group">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 sm:px-6 [&::-webkit-details-marker]:hidden">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700" aria-hidden="true">
                        {(user.firstName?.[0] ?? user.lastName?.[0] ?? "?").toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-slate-900">{name}</span>
                        <span className="block truncate text-sm text-slate-500">{user.primaryEmailAddress?.emailAddress ?? "Adresse absente"}</span>
                      </span>
                      <span className="hidden max-w-48 truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 md:inline-block">
                        {currentRole?.replaceAll("_", " ") ?? "Sans rôle"}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.banned ? "bg-rose-50 text-rose-700" : status === "Actif" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {status}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>

                    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
                      <div className="mb-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <div><span className="block text-xs font-medium text-slate-500">Rôle actuel</span><span className="font-medium text-slate-900">{currentRole?.replaceAll("_", " ") ?? "Inscription non terminée"}</span></div>
                        <div><span className="block text-xs font-medium text-slate-500">Adresse principale</span><span className="break-all font-medium text-slate-900">{user.primaryEmailAddress?.emailAddress ?? "Adresse absente"}</span></div>
                        <div><span className="block text-xs font-medium text-slate-500">Identifiant Clerk</span><span className="break-all font-mono text-xs text-slate-700">{user.id}</span></div>
                      </div>

                      <div className="grid gap-4 xl:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                          <h3 className="mb-4 font-semibold text-slate-900">Coordonnées</h3>
                          <UserProfileEditor user={{
                            clerkId: user.id,
                            firstName: user.firstName ?? "",
                            lastName: user.lastName ?? "",
                            department: typeof user.publicMetadata.department === "string" ? user.publicMetadata.department : "",
                            telephone: typeof user.publicMetadata.telephone === "string" ? user.publicMetadata.telephone : "",
                          }} />
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                            <h3 className="mb-4 font-semibold text-slate-900">Rôle et accès</h3>
                            {currentRole !== undefined && currentRole !== UserRole.ADMIN && (
                              <div className="mb-4"><p className="mb-2 text-sm font-medium text-slate-700">Modifier le rôle</p><RoleEditor clerkId={user.id} currentRole={currentRole} /></div>
                            )}
                            {currentRole !== UserRole.ADMIN && user.publicMetadata.role !== UserRole.ADMIN && (
                              <div><p className="mb-2 text-sm font-medium text-slate-700">État du compte</p><DeactivateButton clerkId={user.id} banned={user.banned} /></div>
                            )}
                            {currentRole === UserRole.ADMIN && <p className="text-sm text-slate-500">Le rôle administrateur est protégé.</p>}
                          </div>
                          {verifiedSecondaryEmails.length > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                              <h3 className="mb-3 font-semibold text-slate-900">Adresses vérifiées</h3>
                              <div className="space-y-3">
                                {verifiedSecondaryEmails.map((email) => (
                                  <div key={email.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-3">
                                    <span className="break-all text-sm text-slate-700">{email.emailAddress}</span>
                                    <ConfirmEmailButton targetClerkId={user.id} targetVerifiedId={email.id} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm sm:px-6">
            {page > 1 ? <Link className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" href={`/admin?page=${page - 1}#utilisateurs`}>Précédent</Link> : <span />}
            {page < totalPages ? <Link className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" href={`/admin?page=${page + 1}#utilisateurs`}>Suivant</Link> : <span />}
          </div>
        </section>
      </div>
    </div>
  );
}
