import { Bot, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';

type MessageProps = {
    role: 'user' | 'model';
    content: string;
};

export function MessageBubble({ role, content }: MessageProps) {
    const isUser = role === 'user';

    return (
        <div className={twMerge(clsx('flex w-full mb-6', isUser ? 'justify-end' : 'justify-start'))}>
            <div className={twMerge(clsx('flex max-w-[80%] md:max-w-[70%]', isUser ? 'flex-row-reverse' : 'flex-row'))}>

                {/* Avatar */}
                <div className={twMerge(
                    clsx(
                        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                        isUser ? 'ml-4 bg-indigo-100 text-indigo-600' : 'mr-4 bg-emerald-100 text-emerald-600'
                    )
                )}>
                    {isUser ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                </div>

                {/* Message Content */}
                <div className={twMerge(
                    clsx(
                        'px-5 py-4 rounded-2xl shadow-sm text-base leading-relaxed overflow-hidden',
                        isUser
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-slate-200/50'
                    )
                )}>
                    {isUser ? (
                        <div className="whitespace-pre-wrap">{content}</div>
                    ) : (
                        <div className="prose prose-slate prose-sm max-w-none 
              prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-50
              prose-headings:font-semibold prose-a:text-blue-600">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
