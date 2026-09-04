"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.getDbPool = getDbPool;
exports.isDbConnected = isDbConnected;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
let pool = null;
let isConnected = false;
async function initDatabase() {
    try {
        // 1. Try to connect to MySQL server without DB first to ensure DB exists
        const adminConnection = await promise_1.default.createConnection({
            host: env_1.ENV.DB.HOST,
            port: env_1.ENV.DB.PORT,
            user: env_1.ENV.DB.USER,
            password: env_1.ENV.DB.PASSWORD,
            connectTimeout: 3000,
        });
        await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${env_1.ENV.DB.NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await adminConnection.end();
        // 2. Create pool connected to the database
        pool = promise_1.default.createPool({
            host: env_1.ENV.DB.HOST,
            port: env_1.ENV.DB.PORT,
            user: env_1.ENV.DB.USER,
            password: env_1.ENV.DB.PASSWORD,
            database: env_1.ENV.DB.NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        });
        // 3. Create tables if not exist
        await createTables(pool);
        isConnected = true;
        console.log(`[Database] Successfully connected to MySQL database: ${env_1.ENV.DB.NAME}`);
        return true;
    }
    catch (error) {
        console.warn(`[Database] MySQL connection failed (${error.message}). Running with in-memory fallback store.`);
        isConnected = false;
        return false;
    }
}
async function createTables(pool) {
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
function getDbPool() {
    return pool;
}
function isDbConnected() {
    return isConnected;
}
