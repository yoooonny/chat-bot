require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModel(modelName) {
    try {
        const res = await ai.models.embedContent({
            model: modelName,
            contents: 'test content'
        });
        console.log(`[${modelName}] Success! Dimension: ${res.embeddings?.[0]?.values?.length || 'unknown'}`);
    } catch (err) {
        console.error(`[${modelName}] Error:`, err.message);
    }
}

async function run() {
    await testModel('text-embedding-004');
    await testModel('models/text-embedding-004');
    await testModel('models/embedding-001');
    await testModel('text-embedding-002');
    await testModel('models/text-embedding-002');
    await testModel('embedding-001');
}

run();
