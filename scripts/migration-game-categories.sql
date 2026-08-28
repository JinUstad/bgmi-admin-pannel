-- ================================================================
-- XYLO Esports — Game Categories & Dynamic Theming Migration
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Rename game_series → game_categories and add new columns
ALTER TABLE IF EXISTS game_series RENAME TO game_categories;

-- Add new columns to game_categories
ALTER TABLE game_categories 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '🎮',
  ADD COLUMN IF NOT EXISTS icon_url TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#F2A900',
  ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#FF6B00',
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#FFD740',
  ADD COLUMN IF NOT EXISTS bg_tint TEXT DEFAULT '#0A0A0A',
  ADD COLUMN IF NOT EXISTS overall_feel TEXT DEFAULT 'Gaming';

-- 2. Extend games table with content columns
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES game_categories(id),
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS hero_heading TEXT,
  ADD COLUMN IF NOT EXISTS hero_subheading TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS bg_image_url TEXT,
  ADD COLUMN IF NOT EXISTS game_primary_color TEXT,
  ADD COLUMN IF NOT EXISTS game_secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS game_accent_color TEXT;

-- Copy series_id to category_id for existing records
UPDATE games SET category_id = series_id WHERE category_id IS NULL AND series_id IS NOT NULL;

-- 3. Create active_game_config table (single row)
CREATE TABLE IF NOT EXISTS active_game_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  active_game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row
INSERT INTO active_game_config (id, active_game_id)
VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed categories with real brand colors
INSERT INTO game_categories (id, name, slug, emoji, sort_order, primary_color, secondary_color, accent_color, bg_tint, overall_feel)
VALUES
  (gen_random_uuid(), 'Fighting', 'fighting', '🥊', 1, '#FF1744', '#FF6D00', '#FFD740', '#0A0808', 'Aggressive, fiery'),
  (gen_random_uuid(), 'Battle Royale', 'battle-royale', '🔫', 2, '#FF6B00', '#FFC107', '#2E4A32', '#0A0A08', 'Military, survival'),
  (gen_random_uuid(), 'FPS / Shooter', 'fps-shooter', '🎯', 3, '#00E676', '#00BFA5', '#B2FF59', '#080A0A', 'Tactical, futuristic'),
  (gen_random_uuid(), 'Racing', 'racing', '🏎️', 4, '#00B0FF', '#2979FF', '#00E5FF', '#080A0C', 'Speed, futuristic'),
  (gen_random_uuid(), 'Action / Adventure', 'action-adventure', '⚔️', 5, '#C8102E', '#D4AF37', '#FF6B00', '#0A0808', 'Epic, mysterious'),
  (gen_random_uuid(), 'RPG / Fantasy', 'rpg-fantasy', '🧙', 6, '#7E57C2', '#AB47BC', '#FFD54F', '#09080C', 'Magical, premium'),
  (gen_random_uuid(), 'Sports', 'sports', '🏀', 7, '#2E7D32', '#64DD17', '#FFEA00', '#080A08', 'Energetic, competitive'),
  (gen_random_uuid(), 'Strategy', 'strategy', '🧩', 8, '#536DFE', '#304FFE', '#00E5FF', '#08080C', 'Intelligent, tactical'),
  (gen_random_uuid(), 'Horror', 'horror', '👻', 9, '#B71C1C', '#212121', '#D50000', '#0A0505', 'Dark, terrifying'),
  (gen_random_uuid(), 'Arcade / Casual', 'arcade-casual', '🕹️', 10, '#FF4081', '#7C4DFF', '#00E5FF', '#0A080A', 'Colorful, fun'),
  (gen_random_uuid(), 'Simulation', 'simulation', '🤖', 11, '#00ACC1', '#00838F', '#80DEEA', '#080A0A', 'Clean, futuristic'),
  (gen_random_uuid(), 'MMO / Online', 'mmo-online', '🌐', 12, '#651FFF', '#D500F9', '#00E5FF', '#09080C', 'Vast, immersive')
ON CONFLICT DO NOTHING;

-- 5. Enable RLS policies
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_game_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read game_categories" ON game_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read active_game_config" ON active_game_config FOR SELECT USING (true);

CREATE POLICY "Allow service write game_categories" ON game_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service write active_game_config" ON active_game_config FOR ALL USING (true) WITH CHECK (true);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_category_id ON games(category_id);
CREATE INDEX IF NOT EXISTS idx_games_is_active ON games(is_active);
CREATE INDEX IF NOT EXISTS idx_game_categories_slug ON game_categories(slug);
CREATE INDEX IF NOT EXISTS idx_game_categories_sort_order ON game_categories(sort_order);
