import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getEmbedding, ai } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        const latestMessage = messages[messages.length - 1].content;

        // 1. Get embedding for the user's latest message
        const queryEmbedding = await getEmbedding(latestMessage);

        // 2. Perform vector search (RAG) using Supabase RPC `match_documents`
        // Convert array to string format required by pgvector,e.g., '[0.1, 0.2, ...]'
        const embeddingStr = `[${queryEmbedding.join(',')}]`;

        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: embeddingStr,
            match_threshold: 0.7,
            match_count: 5,
        });

        if (error) {
            console.error('Vector search error:', error);
        }

        // 3. Construct context from matched documents
        let contextStr = '';
        if (documents && documents.length > 0) {
            contextStr = documents.map((doc: any) => doc.content).join('\n---\n');
        }

        // 4. Construct prompt for Gemini
        const systemInstruction = `당신은 유능한 AI 챗봇 어시스턴트입니다. 제공된 컨텍스트(Context)를 바탕으로 사용자의 질문에 반드시 한국어로 답변해 주세요. 만약 컨텍스트에 답변할 수 있는 정보가 없다면, 제공된 문서에는 관련 정보가 없다고 정중하게 말씀해 주세요.
    
Context:
${contextStr || '업로드된 문서에서 관련된 내용을 찾지 못했습니다.'}`;

        // Format chat history for @google/genai
        const formattedHistory = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // 5. Generate Response Stream
        const responseStream = await ai.models.generateContentStream({
            model: 'models/gemini-2.5-flash',
            contents: [
                ...formattedHistory,
                { role: 'user', parts: [{ text: `System Instruction: ${systemInstruction}\n\nUser Question: ${latestMessage}` }] }
            ]
        });

        // Convert Gemini stream to web standard ReadableStream
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of responseStream) {
                        if (chunk.text) {
                            controller.enqueue(new TextEncoder().encode(chunk.text));
                        }
                    }
                    controller.close();
                } catch (e) {
                    controller.error(e);
                }
            }
        });

        return new NextResponse(readableStream, {
            headers: {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
