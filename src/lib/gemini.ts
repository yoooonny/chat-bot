import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY!;

export const ai = new GoogleGenAI({ apiKey });

export async function getEmbedding(text: string) {
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
