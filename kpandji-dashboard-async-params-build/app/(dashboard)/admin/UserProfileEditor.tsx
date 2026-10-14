"use client";

import requestUserEmailChange from "@/lib/actions/admin-user-email-profile";
import updateUserProfile from "@/lib/actions/admin-user-profile";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  user: {
    clerkId: string;
    firstName: string;
    lastName: string;
    department: string;
    telephone: string;
  };
};

export default function UserProfileEditor({ user }: Props) {
  const [message, setMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  
  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get("emailAddress");

    if (typeof emailValue !== "string" || emailValue.trim() === "") {
      setEmailMessage("Saisis une adresse mail.");
      return;
    }

    const input = { email: emailValue.trim() };
    setIsSubmitting(true);

    try {
      const result = await requestUserEmailChange(user.clerkId, input);

      if (result.success) {
        setEmailMessage("Adresse ajoutée, vérification en attente");
        router.refresh();
      } else {
        setEmailMessage(result.error || "Try : Echec de la mise à jour du profil ");
      }
    } catch {
      setEmailMessage("Catch : Echec de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const input = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      department: formData.get("department"),
      telephone: formData.get("telephone"),
    };

    setIsSubmitting(true);

    try {
      const result = await updateUserProfile(user.clerkId, input);

      if (result.success) {
        setMessage("Profil mis à jour");
        router.refresh();
      } else {
        setMessage(result.error || "Try : Echec de la mise à jour du profil ");
      }
    } catch {
      setMessage("Catch : Echec de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: "firstName", label: "Prénom", value: user.firstName },
            { name: "lastName", label: "Nom", value: user.lastName },
            { name: "department", label: "Service", value: user.department },
            { name: "telephone", label: "Téléphone", value: user.telephone },
          ].map(({ name, label, value }) => (
            <label key={name} className="block text-sm font-medium text-slate-700">
              {label}
              <input
                name={name}
                type={name === "telephone" ? "tel" : "text"}
                defaultValue={value}
                required={name === "firstName" || name === "lastName"}
                className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
              />
            </label>
          ))}
        </div>
        <button type="submit" disabled={isSubmitting} className="min-h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-60">
          Enregistrer le profil
        </button>
        {message && <p role="status" aria-live="polite" className="text-sm text-slate-600">{message}</p>}
      </form>
      <form onSubmit={handleEmailSubmit} className="space-y-3 border-t border-slate-100 pt-5">
        <label className="block text-sm font-medium text-slate-700">
          Nouvelle adresse email
          <input name="emailAddress" type="email" placeholder="nouveau@entreprise.com" required className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200" />
        </label>
        <p className="text-xs text-slate-500">L’adresse doit être vérifiée avant de devenir principale.</p>
        <button type="submit" disabled={isSubmitting} className="min-h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-60">
          Demander le changement d’email
        </button>
        {emailMessage && <p role="status" aria-live="polite" className="text-sm text-slate-600">{emailMessage}</p>}
      </form>
    </div>
  );
}
