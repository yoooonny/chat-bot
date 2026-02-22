import { ChatWindow } from '@/components/chat/ChatWindow';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative Background for User View */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="z-10 w-full flex justify-center">
        <ChatWindow />
      </main>
    </div>
  );
}
