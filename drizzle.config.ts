import { defineConfig } from 'drizzle-kit';
import 'dotenv/config'; // Гарантирует, что переменные из .env файла будут прочитаны локально

export default defineConfig({
  schema: './src/db/schema.ts', 
  out: './drizzle',             
  dialect: 'mysql',             
  dbCredentials: {
    // Больше никаких дефолтных паролей в коде. 
    // Если переменной нет в .env, скрипт просто выбросит понятную ошибку.
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: Number(process.env.DB_PORT) || 3306,
  },
});
