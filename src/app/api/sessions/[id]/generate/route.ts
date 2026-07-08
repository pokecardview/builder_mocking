import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: session } = await supabase.from('sessions').select('*').eq('id', params.id).single();
  if (!session) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });

  // Récupération de l'historique des messages
  const { data: messages } = await supabase
    .from('messages')
    .select('content, role')
    .eq('session_id', params.id)
    .order('created_at', { ascending: true });

  const conversation = messages?.map(m => `${m.role}: ${m.content}`).join('\n') || '';

  // Prompt optimisé pour générer une application Next.js complète avec Supabase
  const prompt = `
Tu es un développeur expert en Next.js 14 (App Router) et Supabase.
À partir de la conversation suivante entre un utilisateur et des agents (YC, PM, Tech Lead), génère le code complet d'une application Next.js fonctionnelle.

La conversation :
${conversation}

Instructions :
- Génère TOUS les fichiers nécessaires pour une application Next.js 14 avec TypeScript, Tailwind CSS, et Supabase.
- Inclus l'authentification par Magic Link (email) avec Supabase Auth.
- Crée une page d'accueil, une page de connexion, un tableau de bord protégé, et des pages CRUD pour la ressource principale discutée.
- Fournis le schéma SQL nécessaire dans un fichier 'supabase/migrations/init.sql'.
- Fournis les variables d'environnement exemple dans '.env.local.example'.
- Utilise le App Router (dossier src/app/), des composants React, et un fichier 'src/lib/supabase.ts' pour le client Supabase.
- Pour chaque fichier, précède son contenu par un commentaire indiquant le chemin exact : /* file: chemin/du/fichier */
- Assure-toi que le code est complet, prêt à être déployé, et qu'il utilise les meilleures pratiques.
`;

  // Appel à l'API OpenAI (ou tout LLM compatible)
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.5,
    }),
  });

  const aiData = await response.json();
  const generatedText = aiData.choices[0].message.content;

  // Parser le texte pour extraire les fichiers
  const fileRegex = /\/\* file: (.+?) \*\/([\s\S]*?)(?=\/\* file:|$)/g;
  const files: { file_path: string; content: string }[] = [];
  let match;
  while ((match = fileRegex.exec(generatedText)) !== null) {
    files.push({ file_path: match[1].trim(), content: match[2].trim() });
  }

  // Si le parsing échoue, on met tout dans un seul fichier
  if (files.length === 0) {
    files.push({ file_path: 'src/app/page.tsx', content: generatedText });
  }

  // Sauvegarde dans Supabase
  const inserts = files.map(f => ({
    session_id: session.id,
    file_path: f.file_path,
    content: f.content,
  }));

  const { error } = await supabase.from('generated_files').insert(inserts);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, files });
}
