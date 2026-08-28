const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_NON_POOLING.split('?')[0],
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log("Connected");
  
  const query = `
    ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow anonymous SELECT on admins" ON admins;
    CREATE POLICY "Allow anonymous SELECT on admins" ON admins FOR SELECT USING (true);
  `;
  
  await client.query(query);
  console.log('RLS policy added!');
  
  await client.end();
}

run().catch(console.error);
