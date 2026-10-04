import * as z from 'zod';

export const clientSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().min(8, 'Le téléphone doit contenir au moins 8 caractères'),
  entreprise: z.string().optional(),
  secteur_activite: z.string().optional(),
  localisation: z.string().optional(),
  commercial: z.string().optional(),
  status_client: z.enum(['CLIENT', 'PROSPECT', 'FAVORABLE', 'A_SUIVRE', 'ABANDONNE']),
});

export type ClientFormData = z.infer<typeof clientSchema>;