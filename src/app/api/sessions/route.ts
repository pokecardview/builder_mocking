import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { initial_message } = await request.json();
  if (!initial_message) return NextResponse.json({ error: 'Message requis' }, { status: 400 });

  const { data: session, error } = await supabase.from('sessions').insert({ user_id: user.id, title: initial_message.slice(0, 50) }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('messages').insert({ session_id: session.id, role: 'user', content: initial_message });
  const { getAgentResponse } = await import('@/lib/agents/orchestrator');
  const history = [{ role: 'user', content: initial_message }];
  const agentResponse = await getAgentResponse(history, 'yc');
  const { data: agentMsg } = await supabase.from('messages').insert({ session_id: session.id, role: 'assistant', agent_type: 'yc', content: agentResponse }).select().single();

  return NextResponse.json({ session, message: agentMsg });
}
