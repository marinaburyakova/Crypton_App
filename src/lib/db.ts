import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../db/schema';

const connectionPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'finflow_user',
  password: process.env.DB_PASSWORD || 'finflow_secure_pass',
  database: process.env.DB_NAME || 'finflow_db',
  waitForConnections: true,
  connectionLimit: 10,
});

export const db = drizzle(connectionPool, { 
  schema, 
  mode: 'default' 
});
