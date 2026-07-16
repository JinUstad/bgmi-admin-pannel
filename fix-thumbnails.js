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

    const res = await client.query(`SELECT id, url, thumbnail_url FROM past_streams`);
    const streams = res.rows;

    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

    for (const stream of streams) {
      if (!stream.thumbnail_url) {
        const match = stream.url.match(regExp);
        if (match && match[1].length === 11) {
          const newThumbnail = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
          await client.query(`UPDATE past_streams SET thumbnail_url = $1 WHERE id = $2`, [newThumbnail, stream.id]);
          console.log(`Updated thumbnail for ${stream.url}`);
        } else {
            console.log(`Could not extract thumbnail for ${stream.url}`);
        }
      }
    }
    console.log("Finished updating thumbnails");

  } catch (err) {
    console.error("Error executing query", err.stack);
  } finally {
    await client.end();
  }
}

run();
