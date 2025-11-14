import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

// Load .env.local explicitly first
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
// Also load .env if exists
dotenv.config({ path: path.join(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl) {
  console.warn("⚠️  DATABASE_URL not found in environment variables");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
