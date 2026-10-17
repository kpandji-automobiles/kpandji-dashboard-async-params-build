import { NextResponse } from "next/server";
import { createClientEntreprise } from "@/lib/actions/client_entreprise";
import { getApprouvedUser } from "@/lib/require-approved-user";
import { clientEntrepriseSchema } from "@/lib/validation/client-entreprise";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {


  try {
     await getApprouvedUser();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "L'utilisateur n'a pas été approuvé" },
      { status: 403 },
    );
  }

  let body;

  try{

    body = await request.json();
   
  }catch{

     return NextResponse.json(
      { success: false, error: "JSON illisible" },
      { status: 400 },
    );

  }

   const validation = clientEntrepriseSchema.safeParse(body)

   if(validation.success === false ){
    return NextResponse.json(
      {success:false, error : "Données invalides"},
      {status : 400},
    )
   }


  try {
    

    const result = await createClientEntreprise({
      nom_entreprise: validation.data.nom_entreprise,
      sigle: validation.data.sigle || undefined,
      email: validation.data.email || undefined,
      telephone: validation.data.telephone,
      nom_personne_contact: validation.data.nom_personne_contact || undefined,
      fonction_personne_contact: validation.data.fonction_personne_contact || undefined,
      email_personne_contact: validation.data.email_personne_contact || undefined,
      telephone_personne_contact: validation.data.telephone_personne_contact || undefined,
      localisation: validation.data.localisation || undefined,
      secteur_activite: validation.data.secteur_activite || undefined,
      flotte_vehicules: validation.data.flotte_vehicules || false,
      flotte_vehicules_description:
        validation.data.flotte_vehicules_description || undefined,
      commercial: validation.data.commercial || undefined,
      status_client: validation.data.status_client || "PROSPECT",
    });

    if(result.success === false){
      return NextResponse.json({success : false, error : "Echec"}, {status : 500})
    }

    return NextResponse.json(result , {status : 201});
  } catch (error) {
    console.error("API createClientEntreprise error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création"
      },
      { status: 500 },
    );
  }
}
