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
      } catch (error) {
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
      } catch (error) {
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
      <button type="submit" disabled={isSubmitting}>
        {props.banned ? "Réactiver" : "Désactiver"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
