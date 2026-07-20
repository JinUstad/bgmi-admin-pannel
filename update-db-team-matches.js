const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const connString = process.env.POSTGRES_URL_NON_POOLING.split('?')[0];
  const client = new Client({
    connectionString: connString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database");

    await client.query(`
      CREATE TABLE IF NOT EXISTS team_matches (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          tournament_type TEXT NOT NULL,
          time_slot TEXT NOT NULL,
          team1_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
          team2_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
          winner_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
          status TEXT DEFAULT 'pending'
      );
    `);
    console.log("team_matches table created or already exists");

    // Grant SELECT to anon and authenticated roles
    await client.query(`GRANT SELECT ON team_matches TO anon;`);
    await client.query(`GRANT SELECT ON team_matches TO authenticated;`);

    // Enable RLS and add policy for public select
    await client.query(`ALTER TABLE team_matches ENABLE ROW LEVEL SECURITY;`);
    
    await client.query(`DROP POLICY IF EXISTS "Enable read access for all users" ON team_matches;`);
    await client.query(`
      CREATE POLICY "Enable read access for all users"
      ON team_matches FOR SELECT USING (true);
    `);
    
    await client.query(`DROP POLICY IF EXISTS "Enable insert for all users" ON team_matches;`);
    await client.query(`
      CREATE POLICY "Enable insert for all users"
      ON team_matches FOR INSERT WITH CHECK (true);
    `);

    await client.query(`DROP POLICY IF EXISTS "Enable update for all users" ON team_matches;`);
    await client.query(`
      CREATE POLICY "Enable update for all users"
      ON team_matches FOR UPDATE USING (true);
    `);

    await client.query(`DROP POLICY IF EXISTS "Enable delete for all users" ON team_matches;`);
    await client.query(`
      CREATE POLICY "Enable delete for all users"
      ON team_matches FOR DELETE USING (true);
    `);
    console.log("Added RLS policies for team_matches");

  } catch (err) {
    console.error("Error executing query", err.stack);
  } finally {
    await client.end();
  }
}

run();
