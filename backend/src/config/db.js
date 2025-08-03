const { Pool } = require('pg');

const dbUser = 'postgres';
const dbHost = 'localhost';
const dbDatabase = 'projectninjas';
const dbPassword = 'Vishnu@1007';
const dbPort = 5432;

const pool = new Pool({
  user: dbUser,
  host: dbHost,
  database: dbDatabase,
  password: dbPassword,
  port: dbPort,
});

module.exports = pool;
