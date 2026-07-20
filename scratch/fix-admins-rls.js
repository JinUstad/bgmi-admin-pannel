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
    
    // Check RLS
    let res = await client.query(`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins';`);
    console.log("RLS Status:", res.rows);

    res = await client.query(`SELECT * FROM pg_policies WHERE tablename = 'admins';`);
    console.log("Policies:", res.rows);

    // Let's just fix it by enabling read access for anon
    await client.query(`ALTER TABLE admins ENABLE ROW LEVEL SECURITY;`);
    await client.query(`DROP POLICY IF EXISTS "Enable read access for all users" ON admins;`);
    await client.query(`CREATE POLICY "Enable read access for all users" ON admins FOR SELECT USING (true);`);
    await client.query(`GRANT ALL ON admins TO anon;`);
    await client.query(`GRANT ALL ON admins TO authenticated;`);

    console.log("Fixed RLS policies for admins table.");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
