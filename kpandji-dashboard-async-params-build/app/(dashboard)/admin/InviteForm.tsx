"use client";

import Invitation from "@/lib/actions/invitations";
import { UserRole } from "@/lib/user-role-constants";
import { useState } from "react";

export default function InviteForm() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectableRoles = Object.values(UserRole).filter(
    (role) => role !== UserRole.ADMIN && role !== UserRole.EMPLOYEE,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email");
    const role = formData.get("role");

    if (
      typeof email !== "string" ||
      email.trim() === "" ||
      typeof role !== "string" ||
      role.trim() === ""
    ) {
      return;
    }

    setMessage("");
    setIsSubmitting(true);

    let result;

    try {
      result = await Invitation(email.trim(), role);

      if (result.success === false){
        setMessage(result.error ?? "Erreur");
        return;
      }
    } catch {
      setMessage("Impossible d'envoyer l'invitation.");
      return;
    } finally {
      setIsSubmitting(false);
     
    } 
    setMessage("Invitation envoyée.");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
      <label className="block min-w-0 text-sm font-medium text-slate-700">
        Adresse email
        <input type="email" name="email" autoComplete="email" placeholder="nom@entreprise.com" required className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200" />
      </label>
      <label className="block min-w-0 text-sm font-medium text-slate-700">
        Rôle attribué
        <select name="role" defaultValue="" required className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200">
          <option value="" disabled>Choisir un rôle</option>
          {selectableRoles.map((role) => (
            <option key={role} value={role}>{role.replaceAll("_", " ")}</option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={isSubmitting} className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? "Envoi en cours…" : "Envoyer l’invitation"}
      </button>
      {message && <p role="status" aria-live="polite" className="text-sm text-slate-700 lg:col-span-3">{message}</p>}
    </form>
  );
}
