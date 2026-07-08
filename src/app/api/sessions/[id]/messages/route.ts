import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { getAgentResponse } from '@/lib/agents/orchestrator';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { content } = await request.json();
  if (!content) return NextResponse.json({ error: 'Contenu requis' }, { status: 400 });
  const { data: session } = await supabase.from('sessions').select('*').eq('id', params.id).eq('user_id', user.id).single();
  if (!session) return NextResponse.json({ error: 'Session introuvable ou non autorisée' }, { status: 404 });

  await supabase.from('messages').insert({ session_id: session.id, role: 'user', content });
  const { data: history } = await supabase.from('messages').select('role, content').eq('session_id', session.id).order('created_at', { ascending: true });
  const lastAgentMsg = history?.filter(m => m.role === 'assistant').pop();
  const lastAgent = (lastAgentMsg as any)?.agent_type;
  const agents = ['yc', 'pm', 'techlead'] as const;
  const currentIndex = lastAgent ? agents.indexOf(lastAgent as any) : -1;
  const nextAgent = agents[(currentIndex + 1) % agents.length];
  const responseText = await getAgentResponse(history!.map(m => ({ role: m.role, content: (m as any).content })), nextAgent);
  const { data: agentMsg } = await supabase.from('messages').insert({ session_id: session.id, role: 'assistant', agent_type: nextAgent, content: responseText }).select().single();
  return NextResponse.json({ message: agentMsg });
}
