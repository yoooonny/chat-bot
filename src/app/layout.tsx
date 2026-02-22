import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Settings } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '기업형 AI 지식 챗봇',
  description: 'Gemini와 Supabase 벡터 데이터베이스를 활용한 챗봇 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900`}>
        {/* Top minimal navigation */}
        <nav className="fixed top-0 inset-x-0 h-16 bg-white/50 backdrop-blur-md border-b border-slate-200/50 z-50 flex items-center justify-between px-6 transition-all">
          <Link href="/" className="font-bold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-80 transition-opacity">
            AI 챗봇
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              <Settings className="w-4 h-4 mr-1.5" />
              관리자 모드
            </Link>
          </div>
        </nav>

        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
