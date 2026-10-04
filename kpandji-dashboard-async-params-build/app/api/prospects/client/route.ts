import { NextResponse } from "next/server";
import { createClient } from "@/lib/actions/client";
import { getApprouvedUser } from "@/lib/require-approved-user";
import { clientSchema } from "@/lib/validation/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let userId;
  try {
    userId = await getApprouvedUser();
  } catch (error) {
    console.error("Error user not approuved", error);
    return NextResponse.json({ error: "User not approuved" }, { status: 403 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const result = clientSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const client = await createClient({
      nom: result.data.nom,
      email: result.data.email || undefined,
      telephone: result.data.telephone,
      entreprise: result.data.entreprise || undefined,
      secteur_activite: result.data.secteur_activite || undefined,
      localisation: result.data.localisation || undefined,
      commercial: result.data.commercial || undefined,
      status_client: result.data.status_client || "PROSPECT",
      userId,
    });

    if(client.success === false){
        return NextResponse.json({error:'Client creation failed'})
    }

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("API createClient error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Erreur lors de la création",
      },
      { status: 500 },
    );
  }
}
