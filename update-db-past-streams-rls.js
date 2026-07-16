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

    // Grant SELECT to anon and authenticated roles
    await client.query(`GRANT SELECT ON past_streams TO anon;`);
    await client.query(`GRANT SELECT ON past_streams TO authenticated;`);
    console.log("Granted SELECT to anon and authenticated");

    // Enable RLS and add policy for public select
    await client.query(`ALTER TABLE past_streams ENABLE ROW LEVEL SECURITY;`);
    
    // Drop policy if exists so we can recreate it
    await client.query(`DROP POLICY IF EXISTS "Enable read access for all users" ON past_streams;`);
    
    await client.query(`
      CREATE POLICY "Enable read access for all users"
      ON past_streams
      FOR SELECT
      USING (true);
    `);
    console.log("Added RLS policy for public select");

  } catch (err) {
    console.error("Error executing query", err.stack);
  } finally {
    await client.end();
  }
}

run();
