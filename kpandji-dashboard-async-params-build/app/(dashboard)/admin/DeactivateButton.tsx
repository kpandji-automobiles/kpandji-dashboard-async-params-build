"use client";

import deactivateUser from "@/lib/actions/admin-deactivate-user";
import reactivateUser from "@/lib/actions/admin-reactivate-user";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeactivateButton(props: {
  clerkId: string;
  banned: boolean;
}) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);

    let result;

    if (props.banned === false) {
      try {
        result = await deactivateUser(props.clerkId);

        router.refresh();

        if (result.success === false) {
          setMessage(result.error ?? "Erreur");
          return;
        }
      } catch {
        setMessage("Impossible de désactiver le compte");
        return;
      } finally {
        setIsSubmitting(false);
      }

      setMessage("Le compte à été désactivée ");
    } else {
      try {
        result = await reactivateUser(props.clerkId);

        router.refresh();

        if (result.success === false) {
          setMessage(result.error ?? "Erreur");
          return;
        }
      } catch {
        setMessage("Impossible de réactiver le compte");
        return;
      } finally {
        setIsSubmitting(false);
      }

      setMessage("Le compte à été réactivé ");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isSubmitting} className={`min-h-10 rounded-lg border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-60 ${props.banned ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"}`}>
        {props.banned ? "Réactiver" : "Désactiver"}
      </button>
      {message && <p role="status" aria-live="polite" className="mt-2 text-sm text-slate-600">{message}</p>}
    </form>
  );
}
