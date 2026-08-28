const { Client } = require('pg');
require('dotenv').config({ path: 'd:/myWork/bgmi/bgmi-admin-pannel/.env.local' });

async function run() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DB connection string");
    return;
  }
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  let res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tournaments'");
  console.log('tournaments columns:', JSON.stringify(res.rows, null, 2));

  let rls = await client.query("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('games', 'game_categories', 'active_game_config', 'tournaments', 'profiles')");
  console.log('RLS Status:', JSON.stringify(rls.rows, null, 2));

  let policies = await client.query("SELECT tablename, policyname, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('games', 'game_categories', 'active_game_config', 'tournaments', 'profiles')");
  console.log('Policies:', JSON.stringify(policies.rows, null, 2));

  await client.end();
}
run();
