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
    console.log("Connected to database.");

    // 1. Add missing columns to game_categories
    await client.query(`
      ALTER TABLE game_categories
      ADD COLUMN IF NOT EXISTS color_background TEXT DEFAULT '#000000',
      ADD COLUMN IF NOT EXISTS color_text TEXT DEFAULT '#FFFFFF',
      ADD COLUMN IF NOT EXISTS color_muted TEXT DEFAULT '#888888',
      ADD COLUMN IF NOT EXISTS color_surface TEXT DEFAULT '#111111',
      ADD COLUMN IF NOT EXISTS color_card TEXT DEFAULT '#222222',
      ADD COLUMN IF NOT EXISTS color_border TEXT DEFAULT '#333333',
      ADD COLUMN IF NOT EXISTS color_glow TEXT DEFAULT '#FF0000',
      ADD COLUMN IF NOT EXISTS gradient_start TEXT DEFAULT '#FF0000',
      ADD COLUMN IF NOT EXISTS gradient_end TEXT DEFAULT '#000000',
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    `);
    console.log("Updated game_categories schema.");
    
    // Ensure active_game_config is ready
    await client.query(`
      CREATE TABLE IF NOT EXISTS active_game_config (
        id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        active_game_id UUID REFERENCES games(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Seed Categories
    // Fighting Category
    const fightingColors = {
      primary_color: '#FF1744',
      secondary_color: '#8B0000',
      accent_color: '#DC143C',
      color_background: '#050000',
      color_text: '#F5F5F5',
      color_muted: '#A9A9A9',
      color_surface: '#1A0000',
      color_card: '#290000',
      color_border: '#4D0000',
      color_glow: '#FF1744',
      gradient_start: '#4A0000',
      gradient_end: '#050000'
    };
    
    let { rows: fightingRows } = await client.query("SELECT id FROM game_categories WHERE slug = 'fighting'");
    let fightingId = fightingRows.length > 0 ? fightingRows[0].id : null;
    
    if (fightingId) {
      await client.query(`
        UPDATE game_categories SET 
          primary_color=$1, secondary_color=$2, accent_color=$3,
          color_background=$4, color_text=$5, color_muted=$6, color_surface=$7,
          color_card=$8, color_border=$9, color_glow=$10, gradient_start=$11, gradient_end=$12,
          is_active=true
        WHERE id = $13
      `, [
        fightingColors.primary_color, fightingColors.secondary_color, fightingColors.accent_color,
        fightingColors.color_background, fightingColors.color_text, fightingColors.color_muted, fightingColors.color_surface,
        fightingColors.color_card, fightingColors.color_border, fightingColors.color_glow, fightingColors.gradient_start, fightingColors.gradient_end,
        fightingId
      ]);
    } else {
      const res = await client.query(`
        INSERT INTO game_categories (
          name, slug, description, icon_url, emoji, primary_color, secondary_color, accent_color,
          color_background, color_text, color_muted, color_surface, color_card, color_border, color_glow, gradient_start, gradient_end, is_active
        ) VALUES (
          'Fighting', 'fighting', 'Aggressive, technical, competitive', '', '🥊', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true
        ) RETURNING id
      `, [
        fightingColors.primary_color, fightingColors.secondary_color, fightingColors.accent_color,
        fightingColors.color_background, fightingColors.color_text, fightingColors.color_muted, fightingColors.color_surface,
        fightingColors.color_card, fightingColors.color_border, fightingColors.color_glow, fightingColors.gradient_start, fightingColors.gradient_end
      ]);
      fightingId = res.rows[0].id;
    }
    
    // Battle Royale Category
    const brColors = {
      primary_color: '#FFB300',
      secondary_color: '#FF8F00',
      accent_color: '#FFA000',
      color_background: '#121212',
      color_text: '#E0E0E0',
      color_muted: '#9E9E9E',
      color_surface: '#1E1E1E',
      color_card: '#2C2C2C',
      color_border: '#424242',
      color_glow: '#FFB300',
      gradient_start: '#332200',
      gradient_end: '#121212'
    };
    
    let { rows: brRows } = await client.query("SELECT id FROM game_categories WHERE slug = 'battle-royale'");
    let brId = brRows.length > 0 ? brRows[0].id : null;
    
    if (brId) {
      await client.query(`
        UPDATE game_categories SET 
          primary_color=$1, secondary_color=$2, accent_color=$3,
          color_background=$4, color_text=$5, color_muted=$6, color_surface=$7,
          color_card=$8, color_border=$9, color_glow=$10, gradient_start=$11, gradient_end=$12,
          is_active=true
        WHERE id = $13
      `, [
        brColors.primary_color, brColors.secondary_color, brColors.accent_color,
        brColors.color_background, brColors.color_text, brColors.color_muted, brColors.color_surface,
        brColors.color_card, brColors.color_border, brColors.color_glow, brColors.gradient_start, brColors.gradient_end,
        brId
      ]);
    } else {
      const res = await client.query(`
        INSERT INTO game_categories (
          name, slug, description, icon_url, emoji, primary_color, secondary_color, accent_color,
          color_background, color_text, color_muted, color_surface, color_card, color_border, color_glow, gradient_start, gradient_end, is_active
        ) VALUES (
          'Battle Royale', 'battle-royale', 'Military, survival, high-intensity', '', '🔫', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true
        ) RETURNING id
      `, [
        brColors.primary_color, brColors.secondary_color, brColors.accent_color,
        brColors.color_background, brColors.color_text, brColors.color_muted, brColors.color_surface,
        brColors.color_card, brColors.color_border, brColors.color_glow, brColors.gradient_start, brColors.gradient_end
      ]);
      brId = res.rows[0].id;
    }
    
    console.log("Categories seeded.");

    // 3. Seed Games
    const gamesToSeed = [
      { name: 'Tekken Tag Tournament', slug: 'tekken-tag-tournament', category_id: fightingId, description: 'The iconic tag-team fighting game.' },
      { name: 'Tekken 5', slug: 'tekken-5', category_id: fightingId, description: 'Classic 3D fighter.' },
      { name: 'Tekken 7', slug: 'tekken-7', category_id: fightingId, description: 'The Mishima saga.' },
      { name: 'Tekken 8', slug: 'tekken-8', category_id: fightingId, description: 'Next-gen fighting experience.' },
      { name: 'Free Fire', slug: 'free-fire', category_id: brId, description: 'Ultimate survival shooter.' },
      { name: 'PUBG Mobile / BGMI', slug: 'pubg-mobile', category_id: brId, description: 'The original battle royale on mobile.' }
    ];

    await client.query(`
      ALTER TABLE games
      ADD COLUMN IF NOT EXISTS short_description TEXT,
      ADD COLUMN IF NOT EXISTS tagline TEXT,
      ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
    `);

    for (const game of gamesToSeed) {
      const { rows } = await client.query('SELECT id FROM games WHERE slug = $1', [game.slug]);
      if (rows.length > 0) {
        await client.query(`
          UPDATE games SET category_id = $1, description = $2, is_active = true WHERE slug = $3
        `, [game.category_id, game.description, game.slug]);
      } else {
        await client.query(`
          INSERT INTO games (name, slug, theme_identifier, category_id, description, is_active, display_order)
          VALUES ($1, $2, $2, $3, $4, true, 0)
        `, [game.name, game.slug, game.category_id, game.description]);
      }
    }
    console.log("Games seeded.");

  } catch (err) {
    console.error('Error in migration:', err);
  } finally {
    await client.end();
  }
}

run();
