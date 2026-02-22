export async function extractTextFromFile(buffer: Buffer, mimetype: string, extension: string): Promise<string> {
    try {
        const ext = extension.toLowerCase();

        if (mimetype === 'application/pdf' || ext === 'pdf') {
            // Dynamic import to avoid Vercel serverless module loading failures
            // pdf-parse는 ESM에서 default export가 없으므로 require 방식으로 로드
            const pdfParseModule = await import('pdf-parse');
            const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
            const data = await pdfParse(buffer);
            return data.text;
        }
        else if (ext === 'csv' || mimetype === 'text/csv') {
            return await extractTextFromCSV(buffer);
        }
        else if (ext === 'txt' || mimetype === 'text/plain') {
            return buffer.toString('utf-8');
        }
        else if (['ppt', 'pptx', 'doc', 'docx'].includes(ext)) {
            return await parseOfficeBuffer(buffer);
        }

        throw new Error('Unsupported file format');
    } catch (error) {
        console.error('Extraction error:', error);
        throw new Error('Failed to extract text from file.');
    }
}

async function extractTextFromCSV(buffer: Buffer): Promise<string> {
    const { Readable } = await import('stream');
    const csvParser = (await import('csv-parser')).default;

    return new Promise((resolve, reject) => {
        const results: any[] = [];
        const stream = Readable.from(buffer.toString('utf-8'));

        stream
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                const text = results.map(row => Object.values(row).join(', ')).join('\n');
                resolve(text);
            })
            .on('error', (err) => reject(err));
    });
}

async function parseOfficeBuffer(buffer: Buffer): Promise<string> {
    const officeParser = (await import('officeparser')).default;
    return new Promise((resolve, reject) => {
        officeParser.parseOffice(buffer, function (data: any, err: any) {
            if (err) return reject(err);
            resolve((data as any) || '');
        });
    });
}
