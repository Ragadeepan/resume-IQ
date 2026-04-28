import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "..", ".env")
});

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  SERVER_URL: z.string().url().default("http://localhost:5000"),
  ALLOWED_ORIGINS: z.string().optional().default(""),
  DATABASE_URL: z.string().optional().default(""),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().int().positive().default(7),
  EMAIL_VERIFICATION_EXPIRES_HOURS: z.coerce.number().int().positive().default(24),
  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().int().positive().default(30),
  USE_MEMORY_DB: z.preprocess((value) => parseBoolean(value, false), z.boolean()).default(false),
  REQUIRE_EMAIL_VERIFICATION: z
    .preprocess((value) => parseBoolean(value, false), z.boolean())
    .default(false),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
  RAPIDAPI_KEY: z.string().optional().default(""),
  RAPIDAPI_HOST: z.string().default("jsearch.p.rapidapi.com"),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.preprocess((value) => parseBoolean(value, false), z.boolean()).default(false),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().default("ResumeIQ <no-reply@resumeiq.local>")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid server environment variables:", parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

if (!parsedEnv.data.USE_MEMORY_DB && !parsedEnv.data.DATABASE_URL) {
  console.error("Invalid server environment variables:", {
    DATABASE_URL: ["DATABASE_URL is required unless USE_MEMORY_DB=true"]
  });
  process.exit(1);
}

export const env = parsedEnv.data;
