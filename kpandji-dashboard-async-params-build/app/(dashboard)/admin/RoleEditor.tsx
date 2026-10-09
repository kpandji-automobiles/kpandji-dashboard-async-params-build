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
        
         router.refresh();

        if (result.success === false){
          setMessage(result.error ?? "Erreur");
          return;
        }

        
     }catch(error){
      setMessage("Impossible de modifier le role");
      return;
     }finally{
      setIsSubmitting(false)
     }

     setMessage("Le rôle à été attribué ");
    
    
    
  }

  return (
    <form onSubmit={handleSubmit}>
      <select
        name="role"
        defaultValue={
          props.currentRole === UserRole.EMPLOYEE ? "" : props.currentRole
        }
        required
        onChange={() => setMessage("")}
      >
        <option value="" disabled>
          Choisir un rôle
        </option>
        {selectableRoles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <button type="submit" disabled={isSubmitting}>Submit</button>

      {message && <p>{message}</p>}
    </form>
  );
}
