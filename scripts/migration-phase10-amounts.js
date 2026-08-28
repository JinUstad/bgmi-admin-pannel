const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', '');
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Adding total_amount and pending_amount to registrations table...');
    
    // Add columns if they do not exist
    await pool.query(`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS pending_amount DECIMAL(10,2) DEFAULT 0;
    `);

    console.log('Successfully updated registrations table!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
