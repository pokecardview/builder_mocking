import { NextRequest, NextResponse } from 'next/server';
// On n'utilise plus Supabase, on va simuler avec le store côté serveur (mais pour la génération on utilisera quand même l'API LLM)
// Pour l'instant, on retourne une session mockée.
export async function POST(request: NextRequest) {
  const { initial_message, anonymous_user_id } = await request.json();
  // Simuler la création d'une session et la réponse du premier agent
  const sessionId = crypto.randomUUID();
  const agentResponse = "Quel est le problème principal que ton produit résout ?"; // Réponse par défaut si LLM non configuré

  // On peut tenter d'appeler le LLM pour une réponse réelle
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
      const model = process.env.LLM_MODEL || 'gpt-4o-mini';
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'Tu es un YC Partner. Pose une seule question challengeante.' },
            { role: 'user', content: initial_message },
          ],
          max_tokens: 200,
        }),
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        // Pas de stockage serveur, on renvoie juste la réponse
        return NextResponse.json({
          session: { id: sessionId, title: initial_message.slice(0, 50), phase: 'ideation', status: 'active', created_at: new Date().toISOString() },
          message: { id: crypto.randomUUID(), role: 'assistant', agent_type: 'yc', content: data.choices[0].message.content, created_at: new Date().toISOString() },
        });
      }
    }
  } catch (e) {
    console.error('LLM call failed, using default response');
  }

  return NextResponse.json({
    session: { id: sessionId, title: initial_message.slice(0, 50), phase: 'ideation', status: 'active', created_at: new Date().toISOString() },
    message: { id: crypto.randomUUID(), role: 'assistant', agent_type: 'yc', content: agentResponse, created_at: new Date().toISOString() },
  });
}
