const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrateV2() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', '');
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Starting migration V2...');
    
    // Create tournaments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE,
        status TEXT DEFAULT 'upcoming',
        entry_fee NUMERIC DEFAULT 0,
        prize_pool NUMERIC DEFAULT 0,
        slots INTEGER DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('Table tournaments created or already exists.');

    // Create registrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
        team_name TEXT NOT NULL,
        contact_email TEXT,
        contact_phone TEXT NOT NULL,
        in_game_ids TEXT[] NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('Table registrations created or already exists.');

    // Create matches table (for brackets/hierarchy)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
        round_level TEXT NOT NULL,
        team_a TEXT,
        team_b TEXT,
        winner TEXT,
        match_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('Table matches created or already exists.');

    console.log('Migration V2 completed successfully.');
  } catch (error) {
    console.error('Migration V2 failed:', error);
  } finally {
    await pool.end();
  }
}

migrateV2();
