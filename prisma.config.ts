import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres.aggwzqrboinhmzaofkwy:dvBP2jk!J/+bG6s@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true",
  },
});
