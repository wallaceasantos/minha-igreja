/**
 * Configuração do Banco de Dados
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'mysql.railway.internal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'KHeFBsXXwJzxdWFBOJfeMAbmLEoeUFWq',
  database: process.env.DB_NAME || 'igreja_connect',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Criar pool de conexões
let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function query(sql, params = []) {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

export async function testConnection() {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default { getPool, query, testConnection };
