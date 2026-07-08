import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: session } = await supabase.from('sessions').select('*').eq('id', params.id).eq('user_id', user.id).single();
  if (!session) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });

  const generatedFiles = [
    { path: 'src/app/layout.tsx', content: '// generated layout' },
    { path: 'src/app/page.tsx', content: '// generated page' },
    { path: 'src/lib/supabase.ts', content: '// generated supabase client' },
    { path: 'README.md', content: '# Generated App' },
  ];
  const inserts = generatedFiles.map(f => ({ session_id: session.id, file_path: f.path, content: f.content }));
  const { error } = await supabase.from('generated_files').insert(inserts);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, files: generatedFiles });
}
