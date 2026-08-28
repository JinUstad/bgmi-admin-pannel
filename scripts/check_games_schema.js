require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function checkGamesSchema() {
  const connectionString = process.env.POSTGRES_URL;
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'games';
  `);
  console.table(res.rows);
  await client.end();
}

checkGamesSchema().catch(console.error);
