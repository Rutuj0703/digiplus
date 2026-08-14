import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://resolveai:password@127.0.0.1:5432/resolveai_db?schema=public'
});
