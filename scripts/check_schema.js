const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', ''),
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tournaments'");
    console.log("tournaments schema:", res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
