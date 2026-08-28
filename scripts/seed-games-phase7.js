const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No database connection string found");
    return;
  }
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Get Categories
    const { rows: categories } = await client.query('SELECT id, name FROM game_categories');
    const battleRoyaleCategory = categories.find(c => c.name === 'Battle Royale');
    const fightingCategory = categories.find(c => c.name === 'Fighting');
    const sportsCategory = categories.find(c => c.name === 'Sports');
    const fpsCategory = categories.find(c => c.name === 'FPS / Shooter');

    // Default dynamic content for games
    const gamesToUpsert = [
      {
        name: 'Free Fire',
        theme_identifier: 'free-fire',
        is_active: false,
        category_id: battleRoyaleCategory.id,
        slug: 'free-fire',
        description: 'Free Fire is the ultimate survival shooter game available on mobile. Each 10-minute game places you on a remote island where you are pit against 49 other players, all seeking survival.',
        hero_heading: 'BOOYAH\\nEVERY DAY',
        hero_subheading: 'Drop in, gear up, and survive. The ultimate fast-paced battle royale experience.',
        hero_image_url: '/free_fire_bg.jpg',
        game_primary_color: '#FF9800',
        game_secondary_color: '#F44336',
        game_accent_color: '#FFEB3B',
        about_heading: 'About Free Fire Esports',
        about_description: 'Join the most vibrant and fast-paced mobile esports community. We host daily skirmishes and weekly major tournaments for Free Fire squads looking to prove their dominance and earn massive rewards.',
        about_bg_image_url: '/free_fire_bg.jpg',
        about_character_image_url: '/free_fire_about.jpg',
        tournaments_heading: 'Free Fire Tournaments',
        tournaments_description: 'Register for upcoming Free Fire tournaments. Whether you are a solo rusher or part of a coordinated squad, we have the perfect competitive stage for you.'
      },
      {
        name: 'Tekken Tag',
        theme_identifier: 'tekken-tag',
        is_active: false,
        category_id: fightingCategory.id,
        slug: 'tekken-tag',
        description: 'The iconic tag-team fighting game returns. Master two characters, switch on the fly, and deliver devastating combos in the ultimate iron fist tournament.',
        hero_heading: 'TAG TEAM\\nCHAMPIONSHIP',
        hero_subheading: 'Two fighters, one destiny. Master the tag mechanics and dominate the arena.',
        hero_image_url: '/tekken_tag_bg.jpg',
        game_primary_color: '#3F51B5',
        game_secondary_color: '#9C27B0',
        game_accent_color: '#00E5FF',
        about_heading: 'About Tekken Tag Arena',
        about_description: 'Welcome to the underground circuit. Here, teamwork and perfect execution mean everything. We provide the premier platform for Tekken Tag competitive play, featuring ranked brackets and prize pools.',
        about_bg_image_url: '/tekken_tag_bg.jpg',
        about_character_image_url: '/tekken_tag_about.jpg',
        tournaments_heading: 'Tekken Tag Fight Nights',
        tournaments_description: 'Enter the Iron Fist Tournament. Review the current brackets, register for the next qualifier, and fight your way to the top.'
      }
    ];

    for (const game of gamesToUpsert) {
      // Check if game exists
      const { rows } = await client.query('SELECT id FROM games WHERE theme_identifier = $1', [game.theme_identifier]);
      
      if (rows.length > 0) {
        // Update
        await client.query(`
          UPDATE games SET
            category_id = $2,
            hero_heading = $3, hero_subheading = $4, hero_image_url = $5,
            game_primary_color = $6, game_secondary_color = $7, game_accent_color = $8,
            about_heading = $9, about_description = $10, about_bg_image_url = $11, about_character_image_url = $12,
            tournaments_heading = $13, tournaments_description = $14
          WHERE theme_identifier = $1
        `, [
          game.theme_identifier, game.category_id,
          game.hero_heading, game.hero_subheading, game.hero_image_url,
          game.game_primary_color, game.game_secondary_color, game.game_accent_color,
          game.about_heading, game.about_description, game.about_bg_image_url, game.about_character_image_url,
          game.tournaments_heading, game.tournaments_description
        ]);
      } else {
        // Insert
        await client.query(`
          INSERT INTO games (
            name, theme_identifier, is_active, category_id, slug, description,
            hero_heading, hero_subheading, hero_image_url, 
            game_primary_color, game_secondary_color, game_accent_color,
            about_heading, about_description, about_bg_image_url, about_character_image_url,
            tournaments_heading, tournaments_description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        `, [
          game.name, game.theme_identifier, game.is_active, game.category_id, game.slug, game.description,
          game.hero_heading, game.hero_subheading, game.hero_image_url,
          game.game_primary_color, game.game_secondary_color, game.game_accent_color,
          game.about_heading, game.about_description, game.about_bg_image_url, game.about_character_image_url,
          game.tournaments_heading, game.tournaments_description
        ]);
      }
      console.log(`Upserted ${game.name}`);
    }

    // Update existing games with generic dynamic content so they don't break
    await client.query(`
      UPDATE games SET
        about_heading = 'About ' || name,
        about_description = description,
        about_bg_image_url = hero_image_url,
        about_character_image_url = hero_image_url,
        tournaments_heading = name || ' Tournaments',
        tournaments_description = 'Compete in ' || name || ' tournaments for massive prize pools.'
      WHERE about_heading IS NULL
    `);
    console.log("Updated existing games with fallback about/tournaments content.");

  } catch (err) {
    console.error('Error seeding games:', err);
  } finally {
    await client.end();
  }
}

run();
