import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../../../lib/logger';

const MODEL_NAME = 'gemini-1.5-flash';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL_NAME });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentCharts, prompt, chartName } = body;

    if (!currentCharts || !prompt) {
      return NextResponse.json(
        { error: 'currentCharts and prompt are required' },
        { status: 400 }
      );
    }

    const model = getClient();

    // Build context from current charts
    const chartContext = Object.entries(currentCharts)
      .map(([path, content]) => `File: ${path}\n${content}`)
      .join('\n\n---\n\n');

    const aiPrompt = `You are a Kubernetes and Helm chart expert. The user wants to modify their Helm chart based on the following requirements:

User Requirements:
${prompt}

Current Helm Chart Files:
${chartContext}

Please provide the modified Helm chart files. Return ONLY the modified files as a JSON object where keys are file paths and values are the complete file contents. Include all necessary files (Chart.yaml, values.yaml, templates/*, etc.). Make sure the modifications are production-ready and follow Kubernetes best practices.

Format your response as a JSON object like this:
{
  "Chart.yaml": "...",
  "values.yaml": "...",
  "templates/deployment.yaml": "..."
}

Only return the JSON, no additional text or markdown formatting.`;

    const result = await model.generateContent(aiPrompt);
    const responseText = result.response.text();

    // Try to extract JSON from the response
    let modifiedFiles: Record<string, string> = {};
    
    try {
      // Remove markdown code blocks if present
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        modifiedFiles = JSON.parse(jsonMatch[0]);
      } else {
        modifiedFiles = JSON.parse(responseText);
      }
    } catch (parseError) {
      logger.error({ parseError, responseText }, 'Failed to parse AI response');
      // Fallback: return the original files with a note
      return NextResponse.json({
        error: 'Failed to parse AI-generated modifications',
        original: currentCharts,
        aiResponse: responseText,
      }, { status: 500 });
    }

    logger.info({ chartName, filesModified: Object.keys(modifiedFiles).length }, 'AI chart modification complete');

    return NextResponse.json({
      success: true,
      files: modifiedFiles,
      originalFiles: currentCharts,
    });
  } catch (error) {
    logger.error({ error }, 'AI generation failed');
    return NextResponse.json(
      { error: 'AI generation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

