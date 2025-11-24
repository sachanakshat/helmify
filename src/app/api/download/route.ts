import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { logger } from '../../../lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, files, helmCharts } = body;

    const zip = new JSZip();

    if (type === 'terraform' && files) {
      // Add all Terraform files maintaining directory structure
      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content as string);
      });
    } else if (type === 'helm' && helmCharts) {
      // Add Helm charts, each in its own directory
      helmCharts.forEach((chart: { name: string; files: Record<string, string> }) => {
        Object.entries(chart.files).forEach(([path, content]) => {
          zip.file(`${chart.name}/${path}`, content as string);
        });
      });
    } else if (type === 'all' && files && helmCharts) {
      // Add both Terraform and Helm charts
      Object.entries(files).forEach(([path, content]) => {
        zip.file(`terraform/${path}`, content as string);
      });
      
      helmCharts.forEach((chart: { name: string; files: Record<string, string> }) => {
        Object.entries(chart.files).forEach(([path, content]) => {
          zip.file(`helm-charts/${chart.name}/${path}`, content as string);
        });
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid download request' },
        { status: 400 }
      );
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    logger.info({ type, fileCount: Object.keys(files || {}).length }, 'Generated ZIP download');

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="helmify-${type}-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Failed to generate ZIP download');
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    );
  }
}

