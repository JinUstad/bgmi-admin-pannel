const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', '');
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query(`SELECT relrowsecurity FROM pg_class WHERE relname = 'games';`);
    console.log(res.rows);
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();
