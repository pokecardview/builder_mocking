#!/bin/bash
# ============================================================
# Script d'assemblage et déploiement de ProdCoach
# Usage : bash setup.sh
# Ce script crée l'intégralité du projet dans ./prodcoach,
# l'initialise en dépôt Git et le pousse sur votre repo GitHub.
# ============================================================

set -e

# --- CONFIGURATION (à adapter) ---
REPO_URL="https://github.com/pokecardview/builder_mocking.git"
PROJECT_DIR="prodcoach"

# Vérification des prérequis
command -v node >/dev/null 2>&1 || { echo "❌ Node.js est requis. Installez-le depuis https://nodejs.org"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git est requis."; exit 1; }

echo "🚀 Création du projet ProdCoach dans ./$PROJECT_DIR ..."
rm -rf $PROJECT_DIR
mkdir $PROJECT_DIR
cd $PROJECT_DIR

# Initialisation package.json avec dépendances
npm init -y > /dev/null 2>&1
npm install next@14.2.5 react@18.3.1 react-dom@18.3.1 \
  @supabase/supabase-js@2.45.1 @octokit/rest@21.0.2 \
  tailwindcss@3.4.7 autoprefixer@10.4.19 postcss@8.4.40 clsx@2.1.1 \
  netlify@13.0.0 > /dev/null 2>&1

# Écrasement du package.json par notre version personnalisée
cat > package.json << 'EOF'
{
  "name": "prodcoach-lite",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.45.1",
    "@octokit/rest": "^21.0.2",
    "tailwindcss": "^3.4.7",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "clsx": "^2.1.1",
    "netlify": "^13.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5"
  }
}
EOF

# Fichiers de configuration racine
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};
module.exports = nextConfig;
EOF

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        prodcoach: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5c7cfa',
          600: '#4c6ef5',
          700: '#4263eb',
          800: '#3b5bdb',
          900: '#364fc7',
        },
      },
    },
  },
  plugins: [],
};
EOF

cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

cat > .env.local.example << 'EOF'
# Supabase (votre instance ProdCoach)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Token GitHub (scope 'repo')
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Token API de gestion Supabase (Personal Access Token)
SUPABASE_MANAGEMENT_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# LLM
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
EOF

# Structure des dossiers
mkdir -p src/app/login
mkdir -p src/app/chat/\[id\]
mkdir -p src/app/settings
mkdir -p src/app/api/sessions/\[id\]/messages
mkdir -p src/app/api/sessions/\[id\]/generate
mkdir -p src/app/api/sessions/\[id\]/deploy
mkdir -p src/app/api/deployments/\[id\]
mkdir -p src/app/api/user/tokens
mkdir -p src/components
mkdir -p src/lib/supabase
mkdir -p src/lib/agents
mkdir -p src/lib/deploy
mkdir -p src/types

# === FICHIERS SOURCE ===
# src/app/globals.css
cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# src/app/layout.tsx
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProdCoach - Coach IA pour Product Builders',
  description: 'Définissez votre produit, challenger votre idée et obtenez une application déployée automatiquement.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
EOF

# src/app/page.tsx
cat > src/app/page.tsx << 'EOF'
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">ProdCoach</h1>
      <p className="text-lg text-gray-600 mb-8">
        Coach IA · Challenge · Génération · Déploiement
      </p>
      <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition">
        Commencer le coaching
      </Link>
    </main>
  );
}
EOF

# src/app/login/page.tsx
cat > src/app/login/page.tsx << 'EOF'
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">ProdCoach</h1>
        <p className="text-gray-600 mb-6 text-center">Connectez-vous pour démarrer un coaching.</p>
        <AuthForm />
      </div>
    </main>
  );
}
EOF

# src/app/settings/page.tsx
cat > src/app/settings/page.tsx << 'EOF'
import SettingsPage from '@/components/SettingsPage';

export default function SettingsRoute() {
  return <SettingsPage />;
}
EOF

# src/app/chat/[id]/page.tsx
cat > src/app/chat/\[id\]/page.tsx << 'EOF'
import ChatInterface from '@/components/ChatInterface';

export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <main className="h-screen flex flex-col">
      <div className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">ProdCoach</h1>
      </div>
      <ChatInterface sessionId={params.id} />
    </main>
  );
}
EOF

# === COMPOSANTS ===
# src/components/AuthForm.tsx
cat > src/components/AuthForm.tsx << 'EOF'
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Envoi du lien magique...');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/chat` },
    });
    if (error) setMessage(`Erreur: ${error.message}`);
    else setMessage('✅ Vérifiez votre email pour le lien de connexion.');
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Connexion par Magic Link</button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
EOF

# src/components/AgentDebateLog.tsx
cat > src/components/AgentDebateLog.tsx << 'EOF'
'use client';
import { useState } from 'react';

interface DebateEntry { agent: string; content: string; timestamp: string; }

export default function AgentDebateLog({ entries }: { entries: DebateEntry[] }) {
  const [expanded, setExpanded] = useState(false);
  if (entries.length === 0) return null;

  return (
    <div className="border-t pt-2 mt-2">
      <button onClick={() => setExpanded(!expanded)} className="text-sm text-blue-600 hover:underline">
        {expanded ? 'Masquer' : 'Afficher'} le débat interne des agents
      </button>
      {expanded && (
        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
          {entries.map((entry, idx) => (
            <div key={idx} className="text-xs p-2 bg-gray-100 rounded">
              <span className="font-semibold capitalize">{entry.agent} :</span> {entry.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
EOF

# src/components/DeployStatus.tsx
cat > src/components/DeployStatus.tsx << 'EOF'
type DeploymentInfo = {
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  github_repo_url?: string;
  supabase_project_ref?: string;
  logs?: string;
};

export default function DeployStatus({ deployment }: { deployment: DeploymentInfo }) {
  const statusText = { pending:'En attente',in_progress:'En cours',success:'Réussi',failed:'Échoué' }[deployment.status];
  return (
    <div className="text-sm p-2 bg-gray-50 rounded">
      <p><strong>Statut :</strong> {statusText}</p>
      {deployment.github_repo_url && <p><strong>Repo GitHub :</strong> <a href={deployment.github_repo_url} target="_blank" className="text-blue-600 underline">{deployment.github_repo_url}</a></p>}
      {deployment.supabase_project_ref && <p><strong>Projet Supabase :</strong> {deployment.supabase_project_ref}</p>}
      {deployment.logs && <p className="text-red-600"><strong>Logs :</strong> {deployment.logs}</p>}
    </div>
  );
}
EOF

# src/components/SettingsPage.tsx
cat > src/components/SettingsPage.tsx << 'EOF'
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [tokens, setTokens] = useState({
    github: '',
    supabase: '',
    netlify: '',
    vercel: '',
    cloudflare: '',
    cloudflareAccountId: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadTokens = async () => {
      const { data } = await supabase.from('user_tokens').select('*').single();
      if (data) {
        setTokens({
          github: data.github_token || '',
          supabase: data.supabase_management_token || '',
          netlify: data.netlify_access_token || '',
          vercel: data.vercel_access_token || '',
          cloudflare: data.cloudflare_api_token || '',
          cloudflareAccountId: data.cloudflare_account_id || '',
        });
      }
    };
    loadTokens();
  }, []);

  const handleSave = async () => {
    const res = await fetch('/api/user/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens),
    });
    if (res.ok) setMessage('✅ Tokens sauvegardés.');
    else setMessage('❌ Erreur lors de la sauvegarde.');
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold">Paramètres de déploiement</h1>
      <input type="password" placeholder="Token GitHub" value={tokens.github} onChange={e => setTokens({...tokens, github: e.target.value})} className="w-full p-2 border" />
      <input type="password" placeholder="Token Supabase Management" value={tokens.supabase} onChange={e => setTokens({...tokens, supabase: e.target.value})} className="w-full p-2 border" />
      <input type="password" placeholder="Token Netlify" value={tokens.netlify} onChange={e => setTokens({...tokens, netlify: e.target.value})} className="w-full p-2 border" />
      <input type="password" placeholder="Token Vercel" value={tokens.vercel} onChange={e => setTokens({...tokens, vercel: e.target.value})} className="w-full p-2 border" />
      <input type="password" placeholder="Token Cloudflare" value={tokens.cloudflare} onChange={e => setTokens({...tokens, cloudflare: e.target.value})} className="w-full p-2 border" />
      <input type="text" placeholder="Cloudflare Account ID" value={tokens.cloudflareAccountId} onChange={e => setTokens({...tokens, cloudflareAccountId: e.target.value})} className="w-full p-2 border" />
      <button onClick={handleSave} className="bg-blue-600 text-white p-2 rounded">Sauvegarder</button>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
EOF

# src/components/ChatInterface.tsx (version complète avec sélecteur)
cat > src/components/ChatInterface.tsx << 'EOF'
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import AgentDebateLog from './AgentDebateLog';
import DeployStatus from './DeployStatus';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  agent_type?: 'yc' | 'pm' | 'techlead';
  content: string;
  created_at: string;
};

type DeploymentInfo = {
  id: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  github_repo_url?: string;
  supabase_project_ref?: string;
  logs?: string;
};

export default function ChatInterface({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [debateLog, setDebateLog] = useState<any[]>([]);
  const [generated, setGenerated] = useState(false);
  const [deployment, setDeployment] = useState<DeploymentInfo | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'netlify' | 'vercel' | 'cloudflare'>('netlify');

  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        setDebateLog(data.filter(m => m.agent_type).map(m => ({ agent: m.agent_type!, content: m.content, timestamp: m.created_at })));
      }
    };
    loadMessages();
    const channel = supabase.channel(`messages:session_id=eq.${sessionId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` }, (payload) => {
      const newMsg = payload.new as Message;
      setMessages(prev => [...prev, newMsg]);
      if (newMsg.agent_type) setDebateLog(prev => [...prev, { agent: newMsg.agent_type!, content: newMsg.content, timestamp: newMsg.created_at }]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    await fetch(`/api/sessions/${sessionId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: input }) });
    setInput('');
    setLoading(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const res = await fetch(`/api/sessions/${sessionId}/generate`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) setGenerated(true);
    else alert('Erreur: ' + data.error);
    setLoading(false);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    const res = await fetch(`/api/sessions/${sessionId}/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: selectedProvider }),
    });
    const data = await res.json();
    if (res.ok) {
      pollDeploymentStatus(data.deployment);
    } else {
      alert('Erreur: ' + data.error);
      setDeploying(false);
    }
  };

  const pollDeploymentStatus = async (deployId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/deployments/${deployId}`);
      const data = await res.json();
      if (data.deployment) {
        setDeployment(data.deployment);
        if (data.deployment.status === 'success' || data.deployment.status === 'failed') {
          clearInterval(interval);
          setDeploying(false);
        }
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {msg.agent_type && <div className="text-xs font-semibold uppercase mb-1">{msg.agent_type}</div>}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-lg"><em>Les agents réfléchissent...</em></div></div>}
      </div>
      <div className="border-t p-3 bg-white space-y-2">
        <div className="flex gap-2">
          <button onClick={handleGenerate} disabled={loading || generated} className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50">{generated ? 'Code généré' : 'Générer le code'}</button>
          <div className="flex gap-1 items-center">
            <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value as any)} className="text-sm border p-1 rounded">
              <option value="netlify">Netlify</option>
              <option value="vercel">Vercel</option>
              <option value="cloudflare">Cloudflare</option>
            </select>
            <button onClick={handleDeploy} disabled={loading || !generated || deploying} className="px-3 py-1 bg-purple-600 text-white rounded text-sm disabled:opacity-50">{deploying ? 'Déploiement...' : 'Déployer'}</button>
          </div>
        </div>
        {deployment && <DeployStatus deployment={deployment} />}
      </div>
      <AgentDebateLog entries={debateLog} />
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Décrivez votre idée de produit..." className="flex-1 p-2 border rounded" />
          <button onClick={handleSend} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Envoyer</button>
        </div>
      </div>
    </div>
  );
}
EOF

# === LIBRAIRIES ===
# src/lib/supabase/client.ts
cat > src/lib/supabase/client.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
EOF

# src/lib/supabase/server.ts
cat > src/lib/supabase/server.ts << 'EOF'
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name) { return cookieStore.get(name)?.value; },
      set(name, value, options) { cookieStore.set({ name, value, ...options }); },
      remove(name, options) { cookieStore.set({ name, value: '', ...options }); },
    },
  });
}
EOF

# src/lib/agents/orchestrator.ts
cat > src/lib/agents/orchestrator.ts << 'EOF'
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
EOF

# src/lib/deploy/getTokens.ts
cat > src/lib/deploy/getTokens.ts << 'EOF'
import { createServerSupabase } from '@/lib/supabase/server';

export async function getUserTokens(userId: string) {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('user_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}
EOF

# src/lib/deploy/github.ts
cat > src/lib/deploy/github.ts << 'EOF'
import { Octokit } from '@octokit/rest';

export async function createGitHubRepo(name: string, token: string): Promise<string> {
  const octokit = new Octokit({ auth: token });
  const res = await octokit.repos.createForAuthenticatedUser({ name, private: true, auto_init: false });
  return res.data.clone_url;
}

export async function pushFilesToRepo(repoFullName: string, files: { path: string; content: string }[], token: string, commitMessage = 'Initial commit from ProdCoach') {
  const octokit = new Octokit({ auth: token });
  const [owner, repo] = repoFullName.split('/');
  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });
  const treeItems = await Promise.all(files.map(async file => {
    const blob = await octokit.git.createBlob({ owner, repo, content: file.content, encoding: 'utf-8' });
    return { path: file.path, mode: '100644' as const, type: 'blob' as const, sha: blob.data.sha };
  }));
  const tree = await octokit.git.createTree({ owner, repo, tree: treeItems });
  const commit = await octokit.git.createCommit({ owner, repo, message: commitMessage, tree: tree.data.sha, parents: [ref.object.sha] });
  await octokit.git.updateRef({ owner, repo, ref: 'heads/main', sha: commit.data.sha });
  return true;
}
EOF

# src/lib/deploy/supabase.ts
cat > src/lib/deploy/supabase.ts << 'EOF'
export async function createSupabaseProject(name: string, dbPassword: string, managementToken: string) {
  const response = await fetch('https://api.supabase.com/v1/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managementToken}` },
    body: JSON.stringify({ name, db_pass: dbPassword, plan: 'free', region: 'us-east-1' }),
  });
  if (!response.ok) throw new Error(`Supabase management error: ${response.status}`);
  return await response.json();
}

export async function executeSqlOnProject(ref: string, sql: string, managementToken: string) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managementToken}` },
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) throw new Error(`Supabase SQL execution error: ${response.status}`);
  return await response.json();
}
EOF

# src/lib/deploy/netlify.ts
cat > src/lib/deploy/netlify.ts << 'EOF'
import { NetlifyAPI } from 'netlify';

export async function deployToNetlify(accessToken: string, repoUrl: string, siteName: string) {
  const client = new NetlifyAPI(accessToken);
  const site = await client.createSite({
    body: {
      name: siteName,
      repo: {
        provider: 'github',
        repo: repoUrl, // "owner/repo"
        private: true,
        branch: 'main',
        cmd: 'npm run build',
        dir: '.next',
      },
    },
  });
  await client.createSiteBuild({ site_id: site.id });
  return {
    url: `https://${site.default_domain}`,
    siteId: site.id,
  };
}
EOF

# src/lib/deploy/vercel.ts
cat > src/lib/deploy/vercel.ts << 'EOF'
export async function deployToVercel(accessToken: string, repoUrl: string, projectName: string) {
  const repoPath = repoUrl.replace('https://github.com/', '').replace('.git', '');
  const projRes = await fetch('https://api.vercel.com/v10/projects', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: projectName, framework: 'nextjs', gitRepository: { type: 'github', repo: repoPath } }),
  });
  if (!projRes.ok) throw new Error(`Vercel project creation error: ${projRes.status}`);
  const project = await projRes.json();

  const deployRes = await fetch(`https://api.vercel.com/v13/deployments?projectId=${project.id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: 'production', gitSource: { type: 'github', repo: repoPath, ref: 'main' } }),
  });
  if (!deployRes.ok) throw new Error(`Vercel deploy trigger error: ${deployRes.status}`);
  const deploy = await deployRes.json();
  return { url: `https://${deploy.url}`, projectId: project.id };
}
EOF

# src/lib/deploy/cloudflare.ts
cat > src/lib/deploy/cloudflare.ts << 'EOF'
export async function deployToCloudflare(apiToken: string, accountId: string, repoUrl: string, projectName: string) {
  const repoPath = repoUrl.replace('https://github.com/', '').replace('.git', '');
  const [owner, repo] = repoPath.split('/');

  const projRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: projectName, production_branch: 'main' }),
  });
  if (!projRes.ok) throw new Error(`Cloudflare project creation error: ${projRes.status}`);
  const project = await projRes.json();

  const deployRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project.result.name}/deployments`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: {
          type: 'github',
          config: { owner, repo_name: repo, production_branch: 'main', pr_comments_enabled: false },
        },
      }),
    }
  );
  if (!deployRes.ok) throw new Error(`Cloudflare deploy trigger error: ${deployRes.status}`);
  const deploy = await deployRes.json();
  return { url: `https://${project.result.subdomain}.pages.dev`, projectName: project.result.name };
}
EOF

# src/types/index.ts
cat > src/types/index.ts << 'EOF'
export interface Session { id: string; user_id: string; title: string | null; status: 'active' | 'closed'; created_at: string; updated_at: string; }
export interface Message { id: string; session_id: string; role: 'user' | 'assistant'; agent_type?: 'yc' | 'pm' | 'techlead'; content: string; created_at: string; }
export interface GeneratedFile { id: string; session_id: string; file_path: string; content: string; created_at: string; }
export interface Deployment { id: string; session_id: string; status: 'pending' | 'in_progress' | 'success' | 'failed'; github_repo_url?: string; supabase_project_ref?: string; logs?: string; created_at: string; updated_at: string; }
EOF

# src/middleware.ts
cat > src/middleware.ts << 'EOF'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session && !req.nextUrl.pathname.startsWith('/login') && req.nextUrl.pathname !== '/') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }
  return res;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
EOF

# === API ROUTES ===

# src/app/api/sessions/route.ts
cat > src/app/api/sessions/route.ts << 'EOF'
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
EOF

# src/app/api/sessions/[id]/route.ts
cat > src/app/api/sessions/\[id\]/route.ts << 'EOF'
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
EOF

# src/app/api/sessions/[id]/messages/route.ts
cat > src/app/api/sessions/\[id\]/messages/route.ts << 'EOF'
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
EOF

# src/app/api/sessions/[id]/generate/route.ts
cat > src/app/api/sessions/\[id\]/generate/route.ts << 'EOF'
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
EOF

# src/app/api/sessions/[id]/deploy/route.ts (version multi-provider)
cat > src/app/api/sessions/\[id\]/deploy/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { getUserTokens } from '@/lib/deploy/getTokens';
import { createGitHubRepo, pushFilesToRepo } from '@/lib/deploy/github';
import { createSupabaseProject, executeSqlOnProject } from '@/lib/deploy/supabase';
import { deployToNetlify } from '@/lib/deploy/netlify';
import { deployToVercel } from '@/lib/deploy/vercel';
import { deployToCloudflare } from '@/lib/deploy/cloudflare';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: session } = await supabase.from('sessions').select('*').eq('id', params.id).eq('user_id', user.id).single();
  if (!session) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });

  const { provider } = await request.json();
  if (!provider || !['netlify', 'vercel', 'cloudflare'].includes(provider)) {
    return NextResponse.json({ error: 'Provider invalide' }, { status: 400 });
  }

  const tokens = await getUserTokens(user.id);
  if (!tokens) return NextResponse.json({ error: 'Tokens non configurés. Allez dans Paramètres.' }, { status: 400 });
  if (!tokens.github_token) return NextResponse.json({ error: 'Token GitHub manquant' }, { status: 400 });

  const { data: files } = await supabase.from('generated_files').select('*').eq('session_id', session.id);
  if (!files || files.length === 0) return NextResponse.json({ error: 'Aucun fichier généré' }, { status: 400 });

  const { data: deployment } = await supabase.from('deployments').insert({ session_id: session.id, status: 'in_progress' }).select().single();

  try {
    const repoName = `prodcoach-app-${Date.now()}`;
    const repoUrl = await createGitHubRepo(repoName, tokens.github_token);
    const repoFullName = repoUrl.replace('https://github.com/', '').replace('.git', '');
    await pushFilesToRepo(repoFullName, files.map(f => ({ path: f.file_path, content: f.content })), tokens.github_token);

    let supabaseProjectRef = '';
    if (tokens.supabase_management_token) {
      const dbPassword = 'Temp' + Math.random().toString(36).slice(-8);
      const supabaseProject = await createSupabaseProject(repoName, dbPassword, tokens.supabase_management_token);
      supabaseProjectRef = supabaseProject.id;
      const sql = `create table if not exists items ( id bigint generated by default as identity primary key, name text, created_at timestamptz default now() );`;
      await executeSqlOnProject(supabaseProjectRef, sql, tokens.supabase_management_token);
    }

    let deployResult;
    if (provider === 'netlify') {
      if (!tokens.netlify_access_token) throw new Error('Token Netlify manquant');
      deployResult = await deployToNetlify(tokens.netlify_access_token, repoFullName, repoName);
    } else if (provider === 'vercel') {
      if (!tokens.vercel_access_token) throw new Error('Token Vercel manquant');
      deployResult = await deployToVercel(tokens.vercel_access_token, repoUrl, repoName);
    } else if (provider === 'cloudflare') {
      if (!tokens.cloudflare_api_token || !tokens.cloudflare_account_id) throw new Error('Token Cloudflare ou Account ID manquant');
      deployResult = await deployToCloudflare(tokens.cloudflare_api_token, tokens.cloudflare_account_id, repoUrl, repoName);
    }

    await supabase.from('deployments').update({
      status: 'success',
      github_repo_url: repoUrl,
      supabase_project_ref: supabaseProjectRef || null,
      logs: `Déployé sur ${provider}: ${deployResult!.url}`,
    }).eq('id', deployment!.id);

    return NextResponse.json({ deployment: deployment!.id, repoUrl, deployUrl: deployResult!.url });
  } catch (err: any) {
    await supabase.from('deployments').update({ status: 'failed', logs: err.message }).eq('id', deployment!.id);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
EOF

# src/app/api/deployments/[id]/route.ts
cat > src/app/api/deployments/\[id\]/route.ts << 'EOF'
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
EOF

# src/app/api/user/tokens/route.ts
cat > src/app/api/user/tokens/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await request.json();
  const { github, supabase: sbToken, netlify, vercel, cloudflare, cloudflareAccountId } = body;

  const { error } = await supabase.from('user_tokens').upsert({
    user_id: user.id,
    github_token: github,
    supabase_management_token: sbToken,
    netlify_access_token: netlify,
    vercel_access_token: vercel,
    cloudflare_api_token: cloudflare,
    cloudflare_account_id: cloudflareAccountId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
EOF

# === FIN DE LA GÉNÉRATION DES FICHIERS ===

# Initialisation Git et push
git init
git remote add origin $REPO_URL
git add .
git commit -m "feat: ProdCoach multi-provider with user tokens"
git branch -M main
git push -u origin main

echo ""
echo "✅ ProdCoach a été poussé avec succès sur $REPO_URL"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Créez un projet Supabase pour héberger les données de ProdCoach."
echo "2. Exécutez les migrations SQL (tables sessions, messages, generated_files, deployments, user_tokens + RLS)."
echo "3. Copiez .env.local.example en .env.local et remplissez vos clés."
echo "4. Déployez l'application sur Netlify, Vercel ou Cloudflare en important le repo."
echo ""
echo "Votre builder visuel est prêt à être utilisé. Aucune ligne de code visible pour les utilisateurs finaux !"
