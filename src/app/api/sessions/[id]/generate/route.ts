import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  // Pas de check auth (on garde l'anon)
  const { data: session } = await supabase.from('sessions').select('*').eq('id', params.id).single();
  if (!session) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });

  // Récupérer l'historique
  const { data: messages } = await supabase.from('messages').select('content, role').eq('session_id', params.id).order('created_at', { ascending: true });
  const prompt = messages?.map(m => `${m.role}: ${m.content}`).join('\n') + '\nGénère le code complet d\'une application Next.js basée sur cette discussion. Fournis les fichiers séparés par des commentaires /* file: chemin */.';

  // Appeler OpenAI (ou le LLM configuré)
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: 2000 }),
  });
  const aiData = await response.json();
  const generatedText = aiData.choices[0].message.content;

  // Parser pour extraire les fichiers (ex: /* file: src/app/page.tsx */ ... code ...)
  const files = [];
  const regex = /\/\* file: (.+?) \*\/([\s\S]*?)(?=\/\* file:|$)/g;
  let match;
  while ((match = regex.exec(generatedText)) !== null) {
    files.push({ file_path: match[1].trim(), content: match[2].trim() });
  }
  if (files.length === 0) {
    // fallback: un seul fichier page.tsx
    files.push({ file_path: 'src/app/page.tsx', content: generatedText });
  }

  // Sauvegarder dans generated_files
  const inserts = files.map(f => ({ session_id: session.id, file_path: f.file_path, content: f.content }));
  await supabase.from('generated_files').insert(inserts);

  return NextResponse.json({ success: true, files });
}
