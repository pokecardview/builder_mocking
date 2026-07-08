export async function getAgentResponse(sessionHistory: { role: string; content: string }[], agentType: 'yc' | 'pm' | 'techlead'): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || 'sk-dummy';
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  const systemPrompts = {
    yc: "Tu es un Y Combinator Partner. Challenge l'idée, demande des preuves, cible le marché, la distribution. Pose UNE question percutante.",
    pm: "Tu es un Product Manager senior. Traduis les retours en user stories et priorise le MVP. Pose UNE question orientée produit.",
    techlead: "Tu es un Tech Lead expérimenté. Pense architecture, stack, données. Pose UNE question technique pour clarifier le scope.",
  };

  const messages = [
    { role: 'system', content: systemPrompts[agentType] },
    ...sessionHistory.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'system', content: `En tant qu'agent ${agentType}, réponds à la conversation ci-dessus par une seule question pertinente.` },
  ];

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, max_tokens: 300 }),
  });
  if (!response.ok) throw new Error(`LLM API error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content.trim();
}
