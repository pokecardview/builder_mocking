import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await request.json();
  const { github, supabase: sbToken, netlify, vercel, cloudflare, cloudflareAccountId } = body;

  const { error } = await supabase.from('user_tokens').upsert({
    user_id: user.id,
    github_token: github,
    supabase_management_token: sbToken,
    netlify_access_token: netlify,
    vercel_access_token: vercel,
    cloudflare_api_token: cloudflare,
    cloudflare_account_id: cloudflareAccountId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
