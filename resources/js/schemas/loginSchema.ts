import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
