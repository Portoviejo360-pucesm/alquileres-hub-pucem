import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL no definida");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // 🔥 CLAVE
  },
});

// test real de conexión
(async () => {
  try {
    const res = await pool.query("select now()");
    console.log("✅ Conectado a Supabase Postgres:", res.rows[0]);
  } catch (err: any) {
    console.error("❌ Error Supabase:", err.message);
  }
})();
