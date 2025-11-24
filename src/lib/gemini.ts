import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from './logger';

const MODEL_NAME = 'gemini-1.5-flash';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL_NAME });
}

export async function generateTemplate(prompt: string): Promise<string> {
  try {
    const model = getClient();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text ?? '';
  } catch (error) {
    logger.error({ error }, 'Gemini generation failed');
    throw error;
  }
}

