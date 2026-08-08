import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Создаем пул подключений к MySQL внутри Docker
const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
});

// Экспортируем db. Теперь импорт `import { db } from '@/db'` заработает!
export const db = drizzle(poolConnection, { schema, mode: 'default' });
