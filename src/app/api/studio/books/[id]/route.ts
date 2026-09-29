import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlueprintService } from '@/services/BlueprintService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const book = await prisma.bookProject.findUnique({
      where: { id },
      include: {
        blueprint: true,
        chapters: {
          include: {
            sections: {
              include: { blocks: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book project not found' }, { status: 404 });
    }

    // Calculate live KDP specs
    const totalWords = book.chapters.reduce((acc, ch) => acc + ch.targetWordCount, 0);
    const kdpSpecs = BlueprintService.calculateKDPSpecs(totalWords, book.trimSize, book.paperType);

    return NextResponse.json({
      book,
      kdpSpecs,
    });
  } catch (error) {
    console.error('Error fetching book project:', error);
    return NextResponse.json({ error: 'Failed to fetch book project' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await prisma.bookProject.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
        ...(body.targetAudience !== undefined && { targetAudience: body.targetAudience }),
        ...(body.coreBenefit !== undefined && { coreBenefit: body.coreBenefit }),
        ...(body.primaryKeyword !== undefined && { primaryKeyword: body.primaryKeyword }),
        ...(body.secondaryKeywords !== undefined && { secondaryKeywords: JSON.stringify(body.secondaryKeywords) }),
        ...(body.targetWordCount !== undefined && { targetWordCount: body.targetWordCount }),
        ...(body.targetPageCount !== undefined && { targetPageCount: body.targetPageCount }),
        ...(body.trimSize !== undefined && { trimSize: body.trimSize }),
        ...(body.paperType !== undefined && { paperType: body.paperType }),
        ...(body.status !== undefined && { status: body.status }),
      },
      include: {
        blueprint: true,
        chapters: {
          include: { sections: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return NextResponse.json({ book: updated });
  } catch (error) {
    console.error('Error updating book project:', error);
    return NextResponse.json({ error: 'Failed to update book project' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.bookProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Book project deleted successfully' });
  } catch (error) {
    console.error('Error deleting book project:', error);
    return NextResponse.json({ error: 'Failed to delete book project' }, { status: 500 });
  }
}
