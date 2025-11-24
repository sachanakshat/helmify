import { NextRequest, NextResponse } from 'next/server';
import { createTerraformTemplate } from '../../../lib/services/iacService';
import { logger } from '../../../lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = await createTerraformTemplate(body);
    return NextResponse.json(payload);
  } catch (error) {
    logger.error({ error }, 'Failed to generate Terraform template');
    return NextResponse.json(
      { error: 'Unable to generate template' },
      { status: 500 }
    );
  }
}

