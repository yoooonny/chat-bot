'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { Send, Loader2, Bot, Sparkles } from 'lucide-react';

type Message = {
    role: 'user' | 'model';
    content: string;
};

export function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            content: '안녕하세요! 저는 관리자 대시보드에 업로드된 문서 정보를 기반으로 답변해 드리는 AI 챗봇입니다. 궁금한 점을 물어보세요!',
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Create a temporary model message to stream into
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            const payloadMessages = [...messages, userMsg];

            // Call streaming API
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: payloadMessages }),
            });

            if (!res.ok) {
                throw new Error('Failed to fetch response');
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let completeResponse = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunkStr = decoder.decode(value, { stream: true });
                    completeResponse += chunkStr;

                    // Update the last message in the state with the current streamed text
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].content = completeResponse;
                        return newMessages;
                    });
                }
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-4xl mx-auto bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden mt-8">
            {/* Header */}
            <div className="flex items-center px-6 py-4 bg-white border-b border-slate-100">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4">
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">기업 지식 기반 AI 챗봇</h2>
                    <p className="text-xs text-slate-500 font-medium">Gemini 2.5 Flash & Supabase pgvector 기술 활용</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className="max-w-3xl mx-auto">
                    {messages.map((msg, idx) => (
                        <MessageBubble key={idx} role={msg.role} content={msg.content} />
                    ))}
                    {isLoading && (
                        <div className="flex w-full mb-6 justify-start">
                            <div className="flex max-w-[80%] flex-row">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-emerald-100 text-emerald-600">
                                    <Bot className="w-6 h-6 animate-pulse" />
                                </div>
                                <div className="px-5 py-4 rounded-2xl bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        placeholder="업로드된 문서에 대해 질문해 보세요..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-full px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 shadow-inner group-hover:bg-white"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
