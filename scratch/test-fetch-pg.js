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
    
    console.log("--- Registrations ---");
    let res = await client.query('SELECT * FROM registrations;');
    console.log(res.rows);

    console.log("--- Matches ---");
    res = await client.query('SELECT * FROM matches;');
    console.log(res.rows);

    console.log("--- Team Matches ---");
    res = await client.query('SELECT * FROM team_matches;');
    console.log(res.rows);

  } catch (err) {
    console.error("Error executing query", err.stack);
  } finally {
    await client.end();
  }
}

run();
