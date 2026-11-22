import { Pool } from "pg";

// اتصال واحد بقاعدة البيانات يستخدمه كل المشروع
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
