import crypto from 'crypto';

export function generateHash(content: string | Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

export function chunkText(text: string, maxChunkSize = 1000, overlap = 200): string[] {
    // Very simple chunking: split by paragraphs, then join into chunks
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const para of paragraphs) {
        if (currentChunk.length + para.length > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            // Keep some overlap from the end of the previous chunk
            currentChunk = currentChunk.slice(-overlap) + '\n\n' + para;
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + para;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}
