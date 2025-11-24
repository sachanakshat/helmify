import { NextRequest, NextResponse } from 'next/server';
import { createPipelineTemplate } from '../../../lib/services/pipelineService';
import { logger } from '../../../lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = await createPipelineTemplate(body);
    return NextResponse.json(payload);
  } catch (error) {
    logger.error({ error }, 'Failed to generate pipeline template');
    return NextResponse.json(
      { error: 'Unable to generate pipeline' },
      { status: 500 }
    );
  }
}

