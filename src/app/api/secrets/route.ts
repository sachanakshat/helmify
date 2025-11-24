import { NextRequest, NextResponse } from 'next/server';
import { hydrateSecrets } from '../../../lib/services/secretService';
import { logger } from '../../../lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secrets = hydrateSecrets(body.blocks ?? []);
    return NextResponse.json({ secrets });
  } catch (error) {
    logger.error({ error }, 'Failed to process secrets input');
    return NextResponse.json({ error: 'Unable to parse secrets' }, { status: 400 });
  }
}

