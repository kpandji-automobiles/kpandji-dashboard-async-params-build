import z from "zod";


export const emailSchema = z.object({
     email: z.string().trim().pipe(z.email("Email invalide"))
})