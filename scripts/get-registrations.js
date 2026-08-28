const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', '');
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'games'");
    console.log("GAMES:", res.rows);
    const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'game_categories'");
    console.log("CATEGORIES:", res2.rows);
  } finally {
    await pool.end();
  }
}

check();
