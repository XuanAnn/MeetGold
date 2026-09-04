import mysql from 'mysql2/promise';
import { ENV } from './env';

let pool: mysql.Pool | null = null;
let isConnected = false;

export async function initDatabase(): Promise<boolean> {
  try {
    // 1. Try to connect to MySQL server without DB first to ensure DB exists
    const adminConnection = await mysql.createConnection({
      host: ENV.DB.HOST,
      port: ENV.DB.PORT,
      user: ENV.DB.USER,
      password: ENV.DB.PASSWORD,
      connectTimeout: 3000,
    });

    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${ENV.DB.NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await adminConnection.end();

    // 2. Create pool connected to the database
    pool = mysql.createPool({
      host: ENV.DB.HOST,
      port: ENV.DB.PORT,
      user: ENV.DB.USER,
      password: ENV.DB.PASSWORD,
      database: ENV.DB.NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // 3. Create tables if not exist
    await createTables(pool);

    isConnected = true;
    console.log(`[Database] Successfully connected to MySQL database: ${ENV.DB.NAME}`);
    return true;
  } catch (error: any) {
    console.warn(`[Database] MySQL connection failed (${error.message}). Running with in-memory fallback store.`);
    isConnected = false;
    return false;
  }
}

async function createTables(pool: mysql.Pool): Promise<void> {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS rooms (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      owner_id VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS room_members (
      id VARCHAR(36) PRIMARY KEY,
      room_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_room_user (room_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS whiteboard_snapshots (
      id VARCHAR(36) PRIMARY KEY,
      room_id VARCHAR(36) NOT NULL,
      data LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ];

  for (const q of queries) {
    await pool.query(q);
  }
}

export function getDbPool(): mysql.Pool | null {
  return pool;
}

export function isDbConnected(): boolean {
  return isConnected;
}
