const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fixRLS() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', '');
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Fixing RLS policies for games table...');
    
    await pool.query(`
      DROP POLICY IF EXISTS "Enable all access for all users" ON games;
      CREATE POLICY "Enable all access for all users" ON games FOR ALL USING (true) WITH CHECK (true);
    `);
    
    await pool.query(`
      DROP POLICY IF EXISTS "Enable all access for all users" ON game_categories;
      CREATE POLICY "Enable all access for all users" ON game_categories FOR ALL USING (true) WITH CHECK (true);
    `);

    await pool.query(`
      DROP POLICY IF EXISTS "Enable all access for all users" ON tournament_brackets;
      CREATE POLICY "Enable all access for all users" ON tournament_brackets FOR ALL USING (true) WITH CHECK (true);
    `);

    await pool.query(`
      DROP POLICY IF EXISTS "Enable all access for all users" ON registrations;
      CREATE POLICY "Enable all access for all users" ON registrations FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('Successfully enabled all access on games, game_categories, and tournament_brackets.');
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await pool.end();
  }
}

fixRLS();
