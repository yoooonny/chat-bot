'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/admin/FileUpload';
import { DocumentList } from '@/components/admin/DocumentList';
import { Bot, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadSuccess = () => {
        // trigger list re-fetch
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            {/* Decorative background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-slate-200/60 to-transparent"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]"></div>
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-emerald-400/10 rounded-full blur-[100px]"></div>
            </div>

            <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                <header className="flex flex-col md:flex-row items-center justify-between mb-12">
                    <div className="flex items-center group cursor-default">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform duration-300">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <div className="ml-5">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">관리자 대시보드</h1>
                            <p className="text-slate-500 mt-1">AI 지식 베이스 및 문서 관리</p>
                        </div>
                    </div>

                    <div className="mt-6 md:mt-0">
                        <Link
                            href="/"
                            className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Bot className="w-4 h-4 mr-2" />
                            챗봇으로 이동
                        </Link>
                    </div>
                </header>

                <FileUpload onUploadSuccess={handleUploadSuccess} />

                <DocumentList refreshTrigger={refreshTrigger} />
            </main>
        </div>
    );
}
