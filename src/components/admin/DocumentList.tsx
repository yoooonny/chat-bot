'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Trash2 } from 'lucide-react';

type Document = {
    id: string;
    metadata: {
        filename: string;
        type: string;
        hash: string;
    };
    content: string;
    // We don't fetch embeddings to save bandwidth
};

export function DocumentList({ refreshTrigger }: { refreshTrigger: number }) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, [refreshTrigger]);

    const fetchDocuments = async () => {
        setLoading(true);
        // Fetch unique documents grouped by hash
        const { data, error } = await supabase
            .from('documents')
            .select('id, metadata, content')
            .order('id', { ascending: false });

        if (error) {
            console.error('Error fetching docs:', error);
        } else if (data) {
            // Deduplicate by filename/hash for display
            const uniqueDocs = Array.from(new Map(data.map(item => [item.metadata?.hash, item])).values());
            setDocuments(uniqueDocs as Document[]);
        }
        setLoading(false);
    };

    const handleDelete = async (hash: string) => {
        if (!confirm('이 문서의 모든 청크 데이터를 삭제하시겠습니까?')) return;

        // delete all rows with the matching hash
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('metadata->>hash', hash);

        if (error) {
            alert('문서 삭제 실패: ' + error.message);
        } else {
            fetchDocuments();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-12 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800">색인된 지식 베이스</h3>
            </div>

            {loading ? (
                <div className="p-8 text-center text-slate-500">문서 불러오는 중...</div>
            ) : documents.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <FileText className="w-12 h-12 mb-3 text-slate-300" />
                    <p>등록된 문서가 없습니다.</p>
                    <p className="text-sm mt-1">파일을 업로드하여 챗봇 지식을 추가해보세요.</p>
                </div>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                        <li key={doc.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="ml-4 truncate">
                                    <p className="text-base font-medium text-slate-800 truncate" title={doc.metadata?.filename}>
                                        {doc.metadata?.filename || '알 수 없는 문서'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {doc.metadata?.type || 'text/plain'} • 해시값: {doc.metadata?.hash?.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(doc.metadata.hash)}
                                className="ml-4 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="문서 삭제"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
