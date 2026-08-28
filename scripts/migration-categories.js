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

    // 1. Add columns to settings table
    await pool.query(`
      ALTER TABLE settings
      ADD COLUMN IF NOT EXISTS show_tournament_categories BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS tournament_categories_bg_url TEXT DEFAULT NULL;
    `);
    console.log('Added show_tournament_categories and tournament_categories_bg_url to settings table.');

    // 2. Create public-assets storage bucket if it doesn't exist
    await pool.query(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('public-assets', 'public-assets', true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Ensured public-assets storage bucket exists.');

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
