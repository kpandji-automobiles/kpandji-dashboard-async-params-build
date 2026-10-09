import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  user: {
    firstName: string;
    lastName: string;
    department: string;
    telephone: string;
  };
};

export default function UserProfileEditor({ user }: Props) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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

    let result;

    
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" defaultValue={user.firstName} />

      <input name="lastName" defaultValue={user.lastName} />

      <input name="department" defaultValue={user.department} />

      <input name="telephone" defaultValue={user.telephone} />

      <button type="submit">Modifier</button>
    </form>
  );
}
