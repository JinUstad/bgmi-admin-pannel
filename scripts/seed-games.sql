-- Seed games with real brand colors
INSERT INTO games (id, name, slug, theme_identifier, description, hero_heading, hero_subheading, hero_image_url, logo_url, bg_image_url, game_primary_color, game_secondary_color, game_accent_color, is_active, category_id)
SELECT 
  gen_random_uuid(), 
  'Tekken 8', 
  'tekken-8', 
  'tekken-8',
  'Fist meets fate in the latest installment of the legendary fighting game franchise.',
  'THE KING OF IRON FIST\nTOURNAMENT',
  'Prepare for the ultimate battle. Experience visceral combat and stunning visuals in Tekken 8.',
  'https://media.rawg.io/media/games/2ad/2ad87a4a69b11048024250213d5a2d67.jpg',
  '',
  '',
  '#1A8FE3', -- Electric Blue
  '#E8361A', -- Fire Red
  '#FFB800', -- Gold
  false,
  id
FROM game_categories WHERE slug = 'fighting'
ON CONFLICT DO NOTHING;

INSERT INTO games (id, name, slug, theme_identifier, description, hero_heading, hero_subheading, hero_image_url, logo_url, bg_image_url, game_primary_color, game_secondary_color, game_accent_color, is_active, category_id)
SELECT 
  gen_random_uuid(), 
  'Mortal Kombat 1', 
  'mortal-kombat-1', 
  'mortal-kombat-1',
  'It''s in our blood. Discover a reborn Mortal Kombat Universe created by the Fire God Liu Kang.',
  'A REBORN\nUNIVERSE',
  'Test your might in the bloodiest, most visceral fighting tournament ever created.',
  'https://media.rawg.io/media/games/9b5/9b53fba880d64d5ee269899127d49be2.jpg',
  '',
  '',
  '#F43928', -- Red
  '#ECDE29', -- Yellow
  '#FF6600', -- Orange
  false,
  id
FROM game_categories WHERE slug = 'fighting'
ON CONFLICT DO NOTHING;

INSERT INTO games (id, name, slug, theme_identifier, description, hero_heading, hero_subheading, hero_image_url, logo_url, bg_image_url, game_primary_color, game_secondary_color, game_accent_color, is_active, category_id)
SELECT 
  gen_random_uuid(), 
  'Valorant', 
  'valorant', 
  'valorant',
  'A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities.',
  'DEFY THE\nLIMITS',
  'Blend your style and experience on a global, competitive stage.',
  'https://media.rawg.io/media/games/b11/b115b2bc6a5957a917bc7601f4abdda2.jpg',
  '',
  '',
  '#FF4655', -- VALORANT Red
  '#0F1923', -- Dark Navy
  '#ECE8E1', -- Off-white
  false,
  id
FROM game_categories WHERE slug = 'fps-shooter'
ON CONFLICT DO NOTHING;

INSERT INTO games (id, name, slug, theme_identifier, description, hero_heading, hero_subheading, hero_image_url, logo_url, bg_image_url, game_primary_color, game_secondary_color, game_accent_color, is_active, category_id)
SELECT 
  gen_random_uuid(), 
  'BGMI', 
  'bgmi', 
  'bgmi',
  'BATTLEGROUNDS MOBILE INDIA is a new battle royale game where multiple players employ strategies to fight and be the last man standing on the battlegrounds.',
  'INDIA''S BIGGEST\nBGMI TOURNAMENT',
  'Join the elite. Fight for glory. Win massive cash prizes in the ultimate battleground experience.',
  '/war_game_bg.png',
  '',
  '',
  '#F2A900', -- Yellow
  '#2E4A32', -- Green
  '#FF6B00', -- Orange
  false,
  id
FROM game_categories WHERE slug = 'battle-royale'
ON CONFLICT DO NOTHING;

INSERT INTO games (id, name, slug, theme_identifier, description, hero_heading, hero_subheading, hero_image_url, logo_url, bg_image_url, game_primary_color, game_secondary_color, game_accent_color, is_active, category_id)
SELECT 
  gen_random_uuid(), 
  'EA Sports FC 24', 
  'fc-24', 
  'fc-24',
  'Welcome to the Club. EA SPORTS FC™ is a new era for The World''s Game.',
  'WELCOME TO\nTHE CLUB',
  'Experience unrivaled authenticity with over 19,000 fully licensed players, 700 teams and 30 leagues.',
  'https://media.rawg.io/media/games/bd0/bd0d225dc2c1a826490327f27fbab9c0.jpg',
  '',
  '',
  '#2E7D32', -- Pitch Green
  '#000000', -- Boot Black
  '#FFFFFF', -- Chalk White
  false,
  id
FROM game_categories WHERE slug = 'sports'
ON CONFLICT DO NOTHING;
