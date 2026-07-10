"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function updateLiveStreamAction(url: string, enabled: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({ id: 1, live_stream_url: url, is_live_stream_enabled: enabled, updated_at: new Date().toISOString() });

    if (error) {
      return { error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
