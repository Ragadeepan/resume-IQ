import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { memoryDb } from "./memoryDb.js";

const globalForPrisma = globalThis;
const createDatabaseClient = () =>
  env.USE_MEMORY_DB
    ? memoryDb
    : new PrismaClient({
        log: ["warn", "error"]
      });

export const prisma =
  globalForPrisma.prisma ||
  createDatabaseClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
