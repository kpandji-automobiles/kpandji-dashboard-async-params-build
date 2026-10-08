"use client";

import Invitation from "@/lib/actions/invitations";
import { UserRole } from "@/lib/user-role-constants";
import { useState } from "react";

export default function InviteForm() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmittig] = useState(false);

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

    setIsSubmittig(true);

    let result;

    try {
      result = await Invitation(email.trim(), role);

      if (result.success === false){
        setMessage(result.error ?? "Erreur");
        return;
      }
    } catch (error) {
      setMessage("Impossible d'envoyer l'invitation.");
      return;
    } finally {
      setIsSubmittig(false);
     
    } 
    setMessage("Invitation est envoyé!");
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email :
        <input type="email" name="email" placeholder=" Adresse email" required />
      </label>
      <select name="role" defaultValue="" required>
        <option value="" disabled>
          Choisir un rôle
        </option>
        {selectableRoles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <button type="submit" disabled={isSubmitting}>Envoyé l'invitation</button>

      {message && <p>{message}</p>}
    </form>
  );
}
