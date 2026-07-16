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

    await client.query(`
      CREATE TABLE IF NOT EXISTS past_streams (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log("Created past_streams table (if it didn't exist)");

  } catch (err) {
    console.error("Error executing query", err.stack);
  } finally {
    await client.end();
  }
}

run();
