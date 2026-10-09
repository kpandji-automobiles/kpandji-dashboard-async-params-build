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
    } catch (error) {
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
    } catch (error) {
      setMessage("Catch : Echec de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          name="firstName"
          defaultValue={user.firstName}
          placeholder="Prénom"
        />

        <input name="lastName" defaultValue={user.lastName} placeholder="Nom" />

        <input
          name="department"
          defaultValue={user.department}
          placeholder="Departement"
        />

        <input
          name="telephone"
          defaultValue={user.telephone}
          placeholder="Telephone"
        />

        <button type="submit" disabled={isSubmitting}>
          Modifier
        </button>

        {message && <p>{message}</p>}
      </form>
      <form onSubmit={handleEmailSubmit}>
        <input name="emailAddress" type="email" placeholder="Email?" required/>

        <button type="submit" disabled={isSubmitting}>
          Demander le changement d'email
        </button>

        {emailMessage && <p>{emailMessage}</p>}

      </form>
    </div>
  );
}
