import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3001"),
  JWT_ACCESS_SECRET: z.string().min(30),
  JWT_REFRESH_SECRET: z.string().min(30),
  ACCESS_TOKEN_TTL: z
    .string()
    .transform((v) => Number(v))
    .default("900"),
  REFRESH_TOKEN_TTL: z
    .string()
    .transform((v) => Number(v))
    .default("2592000"),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => (v ? v.toLowerCase() === "true" : false)),
  COOKIE_DOMAIN: z.string().optional().default(""),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().optional().default("5000"),
  RAPIDAPI_KEY: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.log(process.env);
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const config = {
  databaseUrl: parsed.data.DATABASE_URL,
  frontendOrigin: parsed.data.FRONTEND_ORIGIN,
  jwtAccessSecret: parsed.data.JWT_ACCESS_SECRET,
  jwtRefreshSecret: parsed.data.JWT_REFRESH_SECRET,
  accessTokenTtlSeconds: parsed.data.ACCESS_TOKEN_TTL,
  refreshTokenTtlSeconds: parsed.data.REFRESH_TOKEN_TTL,
  cookieSecure:
    parsed.data.COOKIE_SECURE ?? parsed.data.NODE_ENV === "production",
  cookieDomain: parsed.data.COOKIE_DOMAIN || undefined,
  nodeEnv: parsed.data.NODE_ENV,
  port: Number(parsed.data.PORT ?? 5000),
  rapidApiKey: parsed.data.RAPIDAPI_KEY,
};

export type AppConfig = typeof config;
