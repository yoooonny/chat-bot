import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not set in environment variables.');
}

// apiKey 없이도 빌드 오류가 발생하지 않게 placeholder를 사용
// 실제 API 호출 시에는 런타임 에러가 발생함
export const ai = new GoogleGenAI({ apiKey: apiKey || 'placeholder' });

export async function getEmbedding(text: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }
    try {
        const response = await ai.models.embedContent({
            model: 'models/gemini-embedding-001',
            contents: text,
        });
        return response.embeddings?.[0]?.values || [];
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}
