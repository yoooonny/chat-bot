'use client';

import { useState } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function FileUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        setMessage('파일 업로드 및 분석 중...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const text = await res.text();
            let data: any = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                // JSON 파싱 실패 (빈 응답 등) 시 상태 코드 기반으로 에러 처리
                data = { error: `서버 오류 (HTTP ${res.status})` };
            }

            if (!res.ok) {
                throw new Error(data.error || '파일 업로드 실패');
            }

            setStatus('success');
            setMessage(data.message || '파일이 성공적으로 지식 베이스에 추가되었습니다!');
            setFile(null);
            if (onUploadSuccess) onUploadSuccess();

            // Reset after a few seconds
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 5000);

        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">지식 베이스 문서 업로드</h2>

            <div
                className={twMerge(
                    clsx(
                        "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-200 ease-in-out cursor-pointer",
                        isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
                    )
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
            >
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.csv,.txt,.ppt,.pptx"
                />

                {file ? (
                    <div className="flex flex-col items-center text-slate-700">
                        <FileType className="w-12 h-12 text-blue-500 mb-3" />
                        <span className="font-medium text-lg">{file.name}</span>
                        <span className="text-sm text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-slate-500">
                        <UploadCloud className="w-12 h-12 mb-4 text-slate-400" />
                        <p className="font-medium text-lg">클릭하거나 파일을 드래그하여 업로드하세요</p>
                        <p className="text-sm mt-2 text-slate-400">지원 형식: PDF, CSV, TXT, PPT</p>
                    </div>
                )}
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex-1 mr-4">
                    {status === 'uploading' && (
                        <div className="flex items-center text-blue-600">
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            <span className="text-sm font-medium">{message}</span>
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="flex items-center text-emerald-600">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">{message}</span>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="flex items-center text-rose-600">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">{message}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleUpload();
                    }}
                    disabled={!file || status === 'uploading'}
                    className={twMerge(
                        clsx(
                            "px-6 py-2.5 rounded-lg font-medium transition-all duration-200",
                            (!file || status === 'uploading')
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95"
                        )
                    )}
                >
                    {status === 'uploading' ? '처리 중...' : '파일 업로드'}
                </button>
            </div>
        </div>
    );
}
