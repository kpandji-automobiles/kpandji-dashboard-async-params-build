"use client";

import reassignUserRole from "@/lib/actions/admin-user-roles";
import { UserRole } from "@/lib/user-role-constants";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function RoleEditor(props: {
  clerkId: string;
  currentRole: string;
}) {
  const selectableRoles = Object.values(UserRole).filter(
    (role) => role !== UserRole.ADMIN && role !== UserRole.EMPLOYEE,
  );
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const role = new FormData(event.currentTarget).get("role");

    if (typeof role !== "string" || role.trim() === "") {
      return;
    }

     setIsSubmitting(true);

     let result;

     try{
        result = await reassignUserRole(props.clerkId, role);
        
        if (result.success === false){
          setMessage(result.error ?? "Erreur");
          if ("roleChanged" in result && result.roleChanged) router.refresh();
          return;
        }

        
     }catch{
      setMessage("Impossible de modifier le role");
      return;
     }finally{
      setIsSubmitting(false)
     }

     setMessage("Rôle mis à jour. Les sessions de cet utilisateur peuvent être interrompues.");
     router.refresh();
    
    
    
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <select
        name="role"
        defaultValue={
          props.currentRole === UserRole.EMPLOYEE ? "" : props.currentRole
        }
        required
        onChange={() => setMessage("")}
        aria-label="Nouveau rôle"
        className="min-h-10 min-w-48 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
      >
        <option value="" disabled>
          Choisir un rôle
        </option>
        {selectableRoles.map((role) => (
          <option key={role} value={role}>{role.replaceAll("_", " ")}</option>
        ))}
      </select>
      <button type="submit" disabled={isSubmitting} className="min-h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-60">Enregistrer</button>

      {message && <p role="status" aria-live="polite" className="w-full text-sm text-slate-600">{message}</p>}
    </form>
  );
}
