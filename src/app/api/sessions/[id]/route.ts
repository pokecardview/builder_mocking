import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: session } = await supabase.from('sessions').select('*').eq('id', params.id).single();
  if (!session) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  const { data: messages } = await supabase.from('messages').select('*').eq('session_id', params.id).order('created_at', { ascending: true });
  return NextResponse.json({ session, messages });
}
