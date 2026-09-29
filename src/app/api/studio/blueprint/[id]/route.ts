import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await prisma.blueprint.update({
      where: { id },
      data: {
        ...(body.thesis !== undefined && { thesis: body.thesis }),
        ...(body.targetReaderProfile !== undefined && { targetReaderProfile: body.targetReaderProfile }),
        ...(body.toneAndStyle !== undefined && { toneAndStyle: body.toneAndStyle }),
        ...(body.structureType !== undefined && { structureType: body.structureType }),
        ...(body.totalChapters !== undefined && { totalChapters: body.totalChapters }),
        ...(body.estimatedPages !== undefined && { estimatedPages: body.estimatedPages }),
        ...(body.estimatedReadingTimeMin !== undefined && { estimatedReadingTimeMin: body.estimatedReadingTimeMin }),
        ...(body.keywordCoverage !== undefined && { keywordCoverage: JSON.stringify(body.keywordCoverage) }),
      },
    });

    return NextResponse.json({ blueprint: updated });
  } catch (error) {
    console.error('Error updating blueprint:', error);
    return NextResponse.json({ error: 'Failed to update blueprint' }, { status: 500 });
  }
}
