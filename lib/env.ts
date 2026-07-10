import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().url().or(z.string().startsWith("mongodb://")),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
});

export const env = envSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
});
