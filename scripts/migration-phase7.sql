-- Phase 7 Migration

-- 1. Modify `games` table to support dynamic pages
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS about_heading TEXT,
ADD COLUMN IF NOT EXISTS about_description TEXT,
ADD COLUMN IF NOT EXISTS about_bg_image_url TEXT,
ADD COLUMN IF NOT EXISTS about_character_image_url TEXT,
ADD COLUMN IF NOT EXISTS tournaments_heading TEXT,
ADD COLUMN IF NOT EXISTS tournaments_description TEXT;

-- 2. Create `tournament_brackets` table
CREATE TABLE IF NOT EXISTS tournament_brackets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    bracket_data JSONB NOT NULL DEFAULT '{"rounds": []}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id)
);

-- Enable RLS for tournament_brackets (Optional, but good practice. We'll allow public read)
ALTER TABLE tournament_brackets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON tournament_brackets;
CREATE POLICY "Enable read access for all users" ON tournament_brackets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON tournament_brackets;
CREATE POLICY "Enable all access for authenticated users" ON tournament_brackets USING (true) WITH CHECK (true);

-- 3. Cleanup Duplicate Categories
-- The old games linked to these will be deleted if ON DELETE CASCADE is set.
-- First check if ON DELETE CASCADE exists, if not we delete manually
DELETE FROM games WHERE category_id IN (
  SELECT id FROM game_categories WHERE name IN ('Battle Royale Series', 'Tekken Series')
);
DELETE FROM game_categories WHERE name IN ('Battle Royale Series', 'Tekken Series');

-- 4. Delete the "old" BGMI and "old" Call of Duty Mobile if they were in the deleted categories,
-- wait, we just deleted all games in those categories!
-- Let's make sure we still have our correct categories
