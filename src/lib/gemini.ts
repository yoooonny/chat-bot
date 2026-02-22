import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not set in environment variables.');
}

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function getEmbedding(text: string) {
    if (!ai) {
        throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in environment variables.');
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
