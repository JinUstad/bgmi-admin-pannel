import { createClient } from '@supabase/supabase-js';

// We provide fallback placeholders so that the Next.js build doesn't crash on Vercel
// if the environment variables are missing during the static generation phase.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
