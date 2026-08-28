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
    
    // Create game_series table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_series (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('Table game_series created or already exists.');

    // Create games table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        series_id UUID REFERENCES game_series(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        theme_identifier TEXT NOT NULL,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('Table games created or already exists.');

    // Pre-populate Tekken Series and games for initial setup
    const { rows: seriesRows } = await pool.query(`
      INSERT INTO game_series (name) 
      SELECT 'Tekken Series' 
      WHERE NOT EXISTS (SELECT 1 FROM game_series WHERE name = 'Tekken Series')
      RETURNING id;
    `);

    if (seriesRows.length > 0) {
      const seriesId = seriesRows[0].id;
      await pool.query(`
        INSERT INTO games (series_id, name, theme_identifier, is_active)
        VALUES 
        ($1, 'Tekken Tag', 'tekken', true),
        ($1, 'Tekken 3', 'tekken', false),
        ($1, 'Tekken 8', 'tekken', false)
      `, [seriesId]);
      console.log('Inserted initial Tekken games.');
    }

    const { rows: brSeriesRows } = await pool.query(`
      INSERT INTO game_series (name) 
      SELECT 'Battle Royale Series' 
      WHERE NOT EXISTS (SELECT 1 FROM game_series WHERE name = 'Battle Royale Series')
      RETURNING id;
    `);

    if (brSeriesRows.length > 0) {
      const brSeriesId = brSeriesRows[0].id;
      await pool.query(`
        INSERT INTO games (series_id, name, theme_identifier, is_active)
        VALUES 
        ($1, 'BGMI', 'bgmi', true),
        ($1, 'Free Fire', 'free-fire', false),
        ($1, 'Call of Duty Mobile', 'codm', false)
      `, [brSeriesId]);
      console.log('Inserted initial Battle Royale games.');
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
