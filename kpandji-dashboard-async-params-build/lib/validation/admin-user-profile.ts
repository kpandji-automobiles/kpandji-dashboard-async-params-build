import z from "zod";

export const schemaUser = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  department: z.string().optional(),
  telephone: z.string().optional(),
});