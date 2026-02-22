import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getEmbedding } from '@/lib/gemini';
import { extractTextFromFile } from '@/lib/utils/extraction';
import { chunkText, generateHash } from '@/lib/utils/text';

// Vercel 서버리스에서 Node.js 런타임을 명시적으로 사용
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    console.log('--- Upload API Called ---');
    try {
        if (!req.body) {
            console.error('No request body');
            return NextResponse.json({ error: 'No request body' }, { status: 400 });
        }
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 1. Check if we already have this file by content hash
        const hash = generateHash(buffer);
        const { data: existingDoc } = await supabaseAdmin
            .from('documents')
            .select('id')
            .eq('metadata->>hash', hash)
            .limit(1)
            .single();

        if (existingDoc) {
            return NextResponse.json({ message: 'File already exists', id: existingDoc.id }, { status: 200 });
        }

        // 2. Upload raw file to Supabase Storage (optional but good for tracking)
        // Storage key needs to be ascii/safe characters. We'll use the hash to avoid Korean filename errors.
        const extension = file.name.split('.').pop() || '';
        const filePath = `${Date.now()}_${hash.substring(0, 16)}.${extension}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('files')
            .upload(filePath, buffer, {
                contentType: file.type,
            });

        if (uploadError) {
            console.error('Supabase Storage Error:', uploadError);
            return NextResponse.json({
                error: 'Failed to upload to storage',
                details: uploadError.message
            }, { status: 500 });
        }

        console.log('File uploaded to storage:', filePath);

        // 3. Extract Text
        const extractedText = await extractTextFromFile(buffer, file.type, extension);

        // 4. Chunk Text
        const chunks = chunkText(extractedText, 1000, 200);

        // 5. Embed and Store each chunk
        // We store each chunk as a separate row in `documents` to make vector search effective
        let chunksInserted = 0;

        for (const chunk of chunks) {
            const embedding = await getEmbedding(chunk);

            const { error: dbError } = await supabaseAdmin
                .from('documents')
                .insert({
                    content: chunk,
                    embedding,
                    metadata: {
                        filename: file.name,
                        hash,
                        type: file.type,
                        storagePath: filePath,
                    }
                });

            if (dbError) {
                console.error('DB Insert error details:', dbError);
                throw new Error(`DB Insert Error: ${dbError.message}`);
            } else {
                chunksInserted++;
            }
        }

        return NextResponse.json({
            message: 'File processing successful',
            chunksProcessed: chunksInserted
        }, { status: 200 });

    } catch (error: any) {
        console.error('Upload handler error:', error.message, error.stack);
        return NextResponse.json({
            error: error.message || 'Internal server error',
            stack: error.stack
        }, { status: 500 });
    }
}
