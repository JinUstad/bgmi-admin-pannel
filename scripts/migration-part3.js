const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Bypass self-signed cert errors for Supabase local/remote instances when using connection string
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DB connection string");
    return;
  }
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("Connected to DB. Running Migration Part 3...");

  // 1. Alter tournaments table (or upcoming_tournaments) to add game_id
  await client.query(`
    ALTER TABLE upcoming_tournaments 
    ADD COLUMN IF NOT EXISTS game_id UUID REFERENCES games(id) ON DELETE CASCADE;
  `);

  console.log("Added game_id to upcoming_tournaments");

  // Fetch the active game id for fallback data migration
  const activeGameRes = await client.query(`SELECT active_game_id FROM active_game_config WHERE id = 1;`);
  const activeGameId = activeGameRes.rows.length > 0 ? activeGameRes.rows[0].active_game_id : null;

  if (activeGameId) {
      await client.query(`
        UPDATE upcoming_tournaments 
        SET game_id = $1 
        WHERE game_id IS NULL;
      `, [activeGameId]);
      console.log(`Updated existing tournaments with game_id: ${activeGameId}`);
  }

  // 2. Add activate_game_atomic function for atomic game switching
  await client.query(`
    CREATE OR REPLACE FUNCTION activate_game_atomic(new_game_id UUID)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      is_admin boolean;
    BEGIN
      -- Note: You can add an admin check here if you have an admin role
      -- e.g., SELECT auth.jwt()->>'role' = 'service_role' OR auth.uid() IN (SELECT id from admins)

      UPDATE active_game_config 
      SET active_game_id = new_game_id, 
          updated_at = NOW() 
      WHERE id = 1;

      IF NOT FOUND THEN
         INSERT INTO active_game_config (id, active_game_id) VALUES (1, new_game_id);
      END IF;
    END;
    $$;
  `);
  console.log("Created activate_game_atomic RPC function");

  // 3. Strict RLS Policies

  // game_categories
  await client.query(`ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;`);
  await client.query(`DROP POLICY IF EXISTS "Public read access" ON game_categories`);
  await client.query(`CREATE POLICY "Public read access" ON game_categories FOR SELECT USING (true);`);

  // games
  await client.query(`ALTER TABLE games ENABLE ROW LEVEL SECURITY;`);
  await client.query(`DROP POLICY IF EXISTS "Public read access" ON games`);
  await client.query(`CREATE POLICY "Public read access" ON games FOR SELECT USING (true);`);

  // active_game_config
  await client.query(`ALTER TABLE active_game_config ENABLE ROW LEVEL SECURITY;`);
  await client.query(`DROP POLICY IF EXISTS "Public read access" ON active_game_config`);
  await client.query(`CREATE POLICY "Public read access" ON active_game_config FOR SELECT USING (true);`);

  // upcoming_tournaments
  await client.query(`ALTER TABLE upcoming_tournaments ENABLE ROW LEVEL SECURITY;`);
  await client.query(`DROP POLICY IF EXISTS "Public read access" ON upcoming_tournaments`);
  await client.query(`CREATE POLICY "Public read access" ON upcoming_tournaments FOR SELECT USING (true);`);

  console.log("Applied RLS policies");

  await client.end();
  console.log("Migration Part 3 Complete.");
}
run().catch(console.error);
