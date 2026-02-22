const pdfParse = require('pdf-parse');
import officeParser from 'officeparser';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

export async function extractTextFromFile(buffer: Buffer, mimetype: string, extension: string): Promise<string> {
    try {
        const ext = extension.toLowerCase();

        if (mimetype === 'application/pdf' || ext === 'pdf') {
            const data = await pdfParse(buffer);
            return data.text;
        }
        else if (ext === 'csv' || mimetype === 'text/csv') {
            return await extractTextFromCSV(buffer);
        }
        else if (
            ext === 'txt' ||
            mimetype === 'text/plain'
        ) {
            return buffer.toString('utf-8');
        }
        else if (['ppt', 'pptx', 'doc', 'docx'].includes(ext)) {
            // using officeParser which requires a file path usually, 
            // but it also supports parsing buffer directly since version v4+
            // Wait, officeparser usually takes filename, but we can write to temp
            return await parseOfficeBuffer(buffer);
        }

        throw new Error('Unsupported file format');
    } catch (error) {
        console.error('Extraction error:', error);
        throw new Error('Failed to extract text from file.');
    }
}

async function extractTextFromCSV(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const results: any[] = [];
        const stream = Readable.from(buffer.toString('utf-8'));

        stream
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                // Convert array of objects to a string representation
                const text = results.map(row => Object.values(row).join(', ')).join('\n');
                resolve(text);
            })
            .on('error', (err) => reject(err));
    });
}

function parseOfficeBuffer(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        officeParser.parseOffice(buffer, function (data, err) {
            if (err) return reject(err);
            resolve((data as any) || '');
        });
    });
}
