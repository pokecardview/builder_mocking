import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Agentic Builder',
  description: 'Build your product with AI agents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className="font-sans bg-[var(--bg-base)] text-[var(--text-primary)] antialiased">
        <div className="flex h-screen w-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <div className="flex-1 overflow-hidden">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
