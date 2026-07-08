import { createServerSupabase } from '@/lib/supabase/server';

export async function getUserTokens(userId: string) {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('user_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}
