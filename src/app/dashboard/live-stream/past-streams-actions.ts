"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function addPastStream(title: string, url: string, thumbnailUrl?: string) {
  try {
    const { error } = await supabase
      .from('past_streams')
      .insert([{ title, url, thumbnail_url: thumbnailUrl }]);

    if (error) {
      console.error("Error adding past stream:", error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/live-stream');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deletePastStream(id: string) {
  try {
    const { error } = await supabase
      .from('past_streams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting past stream:", error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/live-stream');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getPastStreams() {
  try {
    const { data, error } = await supabase
      .from('past_streams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching past streams:", error);
      return { data: [], error: error.message };
    }

    return { data: data || [] };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}
