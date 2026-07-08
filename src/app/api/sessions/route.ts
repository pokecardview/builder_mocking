import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const { initial_message, anonymous_user_id } = await request.json();
  
  if (!initial_message) return NextResponse.json({ error: 'Message requis' }, { status: 400 });

  const userId = anonymous_user_id || '00000000-0000-0000-0000-000000000000';

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({ user_id: userId, title: initial_message.slice(0, 50), phase: 'ideation' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('messages').insert({
    session_id: session.id,
    role: 'user',
    content: initial_message,
  });

  const { getAgentResponse } = await import('@/lib/agents/orchestrator');
  const history = [{ role: 'user', content: initial_message }];
  const agentResponse = await getAgentResponse(history, 'yc');
  await supabase.from('messages').insert({
    session_id: session.id,
    role: 'assistant',
    agent_type: 'yc',
    content: agentResponse,
  });

  return NextResponse.json({ session });
}
