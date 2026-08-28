const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', '');
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Adding game_id to registrations table...');
    
    // Add game_id column and foreign key
    await pool.query(`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS game_id UUID REFERENCES games(id) ON DELETE SET NULL;
    `);

    // Ensure RLS policy is updated for registrations (since we dropped and recreated earlier, it's fine, but let's make sure it exists)
    await pool.query(`
      DROP POLICY IF EXISTS "Enable all access for all users" ON registrations;
      CREATE POLICY "Enable all access for all users" ON registrations FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('Successfully updated registrations table!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
