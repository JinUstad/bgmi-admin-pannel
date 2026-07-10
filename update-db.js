const { Client } = require('pg');
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

    await client.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS live_stream_url TEXT;`);
    console.log("Added live_stream_url column");

    await client.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS is_live_stream_enabled BOOLEAN DEFAULT FALSE;`);
    console.log("Added is_live_stream_enabled column");

    const res = await client.query(`SELECT * FROM settings LIMIT 1;`);
    console.log("Settings row:", res.rows[0]);

  } catch (err) {
    console.error("Error executing query", err.stack);
  } finally {
    await client.end();
  }
}

run();
