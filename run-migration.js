const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const connString = process.env.POSTGRES_URL_NON_POOLING.split('?')[0];
  const client = new Client({
    connectionString: connString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database");

    const sqlPath = path.join(__dirname, 'scripts', 'migration-game-categories.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing migration script...");
    await client.query(sql);
    console.log("Migration successful!");

  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

run();
