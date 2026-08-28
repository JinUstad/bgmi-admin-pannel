const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await client.query(`
    CREATE OR REPLACE FUNCTION activate_game_atomic(new_game_id UUID)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      -- Deactivate all currently active games to satisfy safeupdate
      UPDATE games SET is_active = false WHERE is_active = true;
      
      -- Activate the selected game
      UPDATE games SET is_active = true WHERE id = new_game_id;

      -- Update config
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

  console.log("Fixed activate_game_atomic RPC function to satisfy safeupdate rules");
  await client.end();
}
run().catch(console.error);
