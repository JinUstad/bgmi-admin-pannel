const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', '');
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Running Migration 8...');
    
    // Add amount columns to registrations
    await pool.query(`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0;
      
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS pending_amount numeric DEFAULT 0;
    `);
    
    // Create time_slots table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        slot_time text NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);
    
    // RLS Policies for time_slots
    await pool.query(`
      ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Enable all access for all users" ON time_slots;
      CREATE POLICY "Enable all access for all users" ON time_slots FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('Migration Phase 8 completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
