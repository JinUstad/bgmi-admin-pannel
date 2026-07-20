const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function backup() {
  const connString = process.env.POSTGRES_URL_NON_POOLING.split('?')[0];
  const client = new Client({
    connectionString: connString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Get all tables in public schema
    const { rows: tables } = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);

    const backupData = {};

    for (const table of tables) {
      const tableName = table.tablename;
      console.log(`Backing up ${tableName}...`);
      const { rows } = await client.query(`SELECT * FROM ${tableName}`);
      backupData[tableName] = rows;
    }

    fs.writeFileSync('database_backup.json', JSON.stringify(backupData, null, 2));
    console.log('Successfully backed up database to database_backup.json');

  } catch (err) {
    console.error('Error backing up database:', err);
  } finally {
    await client.end();
  }
}

backup();
