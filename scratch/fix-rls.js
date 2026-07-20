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
    
    // Enable RLS
    await client.query(`ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;`);

    // Drop any existing policies
    await client.query(`DROP POLICY IF EXISTS "Enable read access for all users" ON registrations;`);
    await client.query(`DROP POLICY IF EXISTS "Enable insert for all users" ON registrations;`);
    await client.query(`DROP POLICY IF EXISTS "Enable update for all users" ON registrations;`);
    await client.query(`DROP POLICY IF EXISTS "Enable delete for all users" ON registrations;`);

    // Create policies
    await client.query(`
      CREATE POLICY "Enable read access for all users" ON registrations FOR SELECT USING (true);
    `);
    await client.query(`
      CREATE POLICY "Enable insert for all users" ON registrations FOR INSERT WITH CHECK (true);
    `);
    await client.query(`
      CREATE POLICY "Enable update for all users" ON registrations FOR UPDATE USING (true);
    `);
    await client.query(`
      CREATE POLICY "Enable delete for all users" ON registrations FOR DELETE USING (true);
    `);

    // Make sure anon/authenticated can access the table
    await client.query(`GRANT ALL ON registrations TO anon;`);
    await client.query(`GRANT ALL ON registrations TO authenticated;`);

    console.log("Fixed RLS policies for registrations.");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
