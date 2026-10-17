import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateClient, deleteClient } from "@/lib/actions/client";
import { revalidatePath } from "next/cache";
import { getApprouvedUser } from "@/lib/require-approved-user";
import { clientSchema } from "@/lib/validation/client";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getApprouvedUser();
  } catch {
    return NextResponse.json(
      { success: false, error: "Utilisateur non approuvé" },
      { status: 403 },
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "JSON illisible" },
      { status: 400 },
    );
  }

  const validation = clientSchema.partial().safeParse(body);

  if (validation.success === false) {
    return NextResponse.json(
      { success: false, error: "Données invalides" },
      { status: 400 },
    );
  }

  try {
    const { id } = await params;
    const result = await updateClient(id, {
      nom: validation.data.nom,
      email: validation.data.email,
      telephone: validation.data.telephone,
      entreprise: validation.data.entreprise,
      secteur_activite: validation.data.secteur_activite,
      localisation: validation.data.localisation,
      commercial: validation.data.commercial,
      status_client: validation.data.status_client,
    });

    if (!result.success) {
      if ("reason" in result && result.reason === "NOT_FOUND") {
        return NextResponse.json(result, { status: 404 });
      }

      if ("reason" in result && result.reason === "FORBIDDEN") {
        return NextResponse.json(result, { status: 403 });
      }

      return NextResponse.json(
        { success: false, error: "Modification impossible" },
        { status: 500 },
      );
    }

    revalidatePath("/commercial/prospects");
    return NextResponse.json(result);
  } catch (error) {
    console.error("API updateClient error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getApprouvedUser();
  } catch {
    return NextResponse.json(
      { success: false, error: "Utilisateur non approuvé" },
      { status: 403 },
    );
  }
  try {
    const { id } = await params;
    const result = await deleteClient(id);

    if (result.success === false && "reason" in result && result.reason === "NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Echec" },
        { status: 404 },
      )}else if(result.success === false){
         return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la suppression",
      },
      { status: 500 },
    );

    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API deleteClient error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la suppression",
      },
      { status: 500 },
    );
  }
}
