
import z from "zod";

export const clientEntrepriseSchema = z.object({
  nom_entreprise: z.string().min(2, 'Le nom de l&apos;entreprise doit contenir au moins 2 caractères'),
  sigle: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().min(8, 'Le téléphone doit contenir au moins 8 caractères'),
  nom_personne_contact: z.string().optional(),
  fonction_personne_contact: z.string().optional(),
  email_personne_contact: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone_personne_contact: z.string().optional(),
  localisation: z.string().optional(),
  secteur_activite: z.string().optional(),
  flotte_vehicules: z.boolean(),
  flotte_vehicules_description: z.string().optional(),
  commercial: z.string().optional(),
  status_client: z.enum(['CLIENT', 'PROSPECT', 'FAVORABLE', 'A_SUIVRE', 'ABANDONNE']),
});