const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', '');
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Starting migration...');

    // Add columns to games table
    await pool.query(`
      ALTER TABLE games
      ADD COLUMN IF NOT EXISTS show_tournament_categories BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS tournament_category_cards JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('Added show_tournament_categories and tournament_category_cards to games table.');

    // We can also remove the column from settings table if we want, but it's okay to just leave it 
    // or drop it. Let's drop it to keep the DB clean.
    await pool.query(`
      ALTER TABLE settings
      DROP COLUMN IF EXISTS show_tournament_categories;
    `);
    console.log('Removed show_tournament_categories from settings table.');

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
