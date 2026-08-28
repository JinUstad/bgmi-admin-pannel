require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error("Missing POSTGRES_URL in .env.local");
  process.exit(1);
}

const client = new Client({
  connectionString: POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

const migrationSql = `
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS long_description text,

  ADD COLUMN IF NOT EXISTS hero_heading text,
  ADD COLUMN IF NOT EXISTS hero_subheading text,
  ADD COLUMN IF NOT EXISTS hero_paragraph text,
  ADD COLUMN IF NOT EXISTS hero_primary_cta text,
  ADD COLUMN IF NOT EXISTS hero_secondary_cta text,

  ADD COLUMN IF NOT EXISTS why_choose_us_heading text,
  ADD COLUMN IF NOT EXISTS why_choose_us_description text,
  ADD COLUMN IF NOT EXISTS why_choose_us_features jsonb,

  ADD COLUMN IF NOT EXISTS about_heading text,
  ADD COLUMN IF NOT EXISTS about_subheading text,
  ADD COLUMN IF NOT EXISTS about_paragraph text,
  ADD COLUMN IF NOT EXISTS about_cta text,

  ADD COLUMN IF NOT EXISTS tournaments_category_heading text,
  ADD COLUMN IF NOT EXISTS tournaments_category_description text,
  ADD COLUMN IF NOT EXISTS tournament_formats jsonb,

  ADD COLUMN IF NOT EXISTS how_it_works_heading text,
  ADD COLUMN IF NOT EXISTS how_it_works_description text,
  ADD COLUMN IF NOT EXISTS how_it_works_steps jsonb,

  ADD COLUMN IF NOT EXISTS cta_heading text,
  ADD COLUMN IF NOT EXISTS cta_description text,
  ADD COLUMN IF NOT EXISTS cta_button_text text,

  ADD COLUMN IF NOT EXISTS registration_heading text,
  ADD COLUMN IF NOT EXISTS registration_description text,
  ADD COLUMN IF NOT EXISTS registration_instructions text,
  ADD COLUMN IF NOT EXISTS registration_requirements jsonb,
  ADD COLUMN IF NOT EXISTS registration_confirmation text,

  ADD COLUMN IF NOT EXISTS tournament_page_heading text,
  ADD COLUMN IF NOT EXISTS tournament_page_description text,
  ADD COLUMN IF NOT EXISTS upcoming_battles_heading text,
  ADD COLUMN IF NOT EXISTS daily_battle_heading text,
  ADD COLUMN IF NOT EXISTS faq_heading text,
  ADD COLUMN IF NOT EXISTS faq_description text,

  ADD COLUMN IF NOT EXISTS blog_page_heading text,
  ADD COLUMN IF NOT EXISTS blog_page_description text,
  ADD COLUMN IF NOT EXISTS blog_introductory_text text,

  ADD COLUMN IF NOT EXISTS seo_meta_title text,
  ADD COLUMN IF NOT EXISTS seo_meta_description text,
  ADD COLUMN IF NOT EXISTS seo_og_title text,
  ADD COLUMN IF NOT EXISTS seo_og_description text,

  ADD COLUMN IF NOT EXISTS hero_background text,
  ADD COLUMN IF NOT EXISTS why_choose_us_background text,
  ADD COLUMN IF NOT EXISTS why_choose_us_side_image text,
  ADD COLUMN IF NOT EXISTS tournament_categories_background text,
  ADD COLUMN IF NOT EXISTS upcoming_battles_background text,
  ADD COLUMN IF NOT EXISTS daily_battle_side_image text,
  ADD COLUMN IF NOT EXISTS faq_background text,
  ADD COLUMN IF NOT EXISTS registration_background text,
  ADD COLUMN IF NOT EXISTS blog_background text,

  ADD COLUMN IF NOT EXISTS game_faqs jsonb;
`;

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase.");

    await client.query(migrationSql);
    console.log("Migration executed successfully: Added all new columns to games table.");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

run();
