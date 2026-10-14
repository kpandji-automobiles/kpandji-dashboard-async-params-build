"use client";

import confirmUserEmailChange from "@/lib/actions/admin-email-user-change";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConfirmEmailButton(props: {
  targetClerkId: string;
  targetVerifiedId: string;
}) {
    const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    setIsSubmitting(true);
    try {
      const result = await confirmUserEmailChange(
        props.targetClerkId,
        props.targetVerifiedId,
      );
      if (result.success) {
        setMessage("Adresse principale modifiée");
        router.refresh();
      } else {
        setMessage(result.error ?? "Impossible de modifier l’adresse");
      }
    } catch {
      setMessage("Impossible de modifier l'adresse");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={isSubmitting} className="min-h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-60">
        Définir comme principale
      </button>
      {message && <p role="status" aria-live="polite" className="mt-2 text-xs text-slate-600">{message}</p>}
    </div>
  );
}
