import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  updateClientEntreprise,
  deleteClientEntreprise,
} from "@/lib/actions/client_entreprise";
import { revalidatePath } from "next/cache";
import { getApprouvedUser } from "@/lib/require-approved-user";
import { clientEntrepriseSchema } from "@/lib/validation/client-entreprise";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

     const validation = clientEntrepriseSchema.partial().safeParse(body)
    
       if(validation.success === false ){
        return NextResponse.json(
          {success:false, error : "Données invalides"},
          {status : 400},
        )
       }
    

    try{

    const { id } = await params;
    const result = await updateClientEntreprise(id, {
      nom_entreprise: validation.data.nom_entreprise,
      sigle: validation.data.sigle,
      email: validation.data.email,
      telephone: validation.data.telephone,
      nom_personne_contact: validation.data.nom_personne_contact,
      fonction_personne_contact: validation.data.fonction_personne_contact,
      email_personne_contact: validation.data.email_personne_contact,
      telephone_personne_contact: validation.data.telephone_personne_contact,
      localisation: validation.data.localisation,
      secteur_activite: validation.data.secteur_activite,
      flotte_vehicules: validation.data.flotte_vehicules,
      flotte_vehicules_description: validation.data.flotte_vehicules_description,
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
    console.error("API updateClientEntreprise error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await auth()).userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Non authentifié. Reconnectez-vous." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = await deleteClientEntreprise(id);

    revalidatePath("/commercial/prospects");
    return NextResponse.json(result);
  } catch (error) {
    console.error("API deleteClientEntreprise error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Erreur lors de la suppression",
      },
      { status: 500 }
    );
  }
}
