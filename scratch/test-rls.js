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
    
    // Check if RLS is enabled
    let res = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'registrations';
    `);
    console.log("RLS Status:", res.rows);

    res = await client.query(`
      SELECT * FROM pg_policies WHERE tablename = 'registrations';
    `);
    console.log("Policies:", res.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
