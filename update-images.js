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
      UPDATE games SET hero_image_url = '/tekken_bg.jpg' WHERE slug = 'tekken-8';
      UPDATE games SET hero_image_url = '/mk_bg.jpg' WHERE slug = 'mortal-kombat-1';
      UPDATE games SET hero_image_url = '/valorant_bg.jpg' WHERE slug = 'valorant';
    `);
    
    console.log("Image URLs updated successfully!");
  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

run();
