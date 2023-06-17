import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config();

export default {
  schema: "./src/schema/*",
  out: "./drizzle",
  connectionString: process.env["DRIZZLE_CONNECTION_STRING"],
} satisfies Config;
