import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: deployment } = await supabase.from('deployments').select('*').eq('id', params.id).single();
  if (!deployment) return NextResponse.json({ error: 'Déploiement introuvable' }, { status: 404 });
  return NextResponse.json({ deployment });
}
