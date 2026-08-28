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

    const sqlPath = path.join(__dirname, 'scripts', 'seed-games.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing seed script...");
    await client.query(sql);
    console.log("Seed successful!");

    // Also set BGMI as the active game if not set
    console.log("Setting BGMI as active game...");
    await client.query(`
      WITH bgmi_game AS (SELECT id FROM games WHERE slug = 'bgmi' LIMIT 1)
      UPDATE active_game_config 
      SET active_game_id = (SELECT id FROM bgmi_game), updated_at = NOW() 
      WHERE id = 1;
      
      UPDATE games SET is_active = false;
      UPDATE games SET is_active = true WHERE slug = 'bgmi';
    `);
    console.log("Active game set successfully!");

  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

run();
