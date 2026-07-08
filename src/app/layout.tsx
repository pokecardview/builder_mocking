import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ProdCoach – Visual Builder IA',
  description: 'Coachez vos idées, générez du code et déployez en un clic.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} dark`}>
      <body className="font-sans bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
