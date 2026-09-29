import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DOCXExportService } from '@/services/export/DOCXExportService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
    }

    const book = await prisma.bookProject.findUnique({
      where: { id: bookId },
      include: {
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
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const buffer = await DOCXExportService.generateDOCX(book);

    const safeTitle = book.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeTitle}_manuscript.docx"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting DOCX:', error);
    return NextResponse.json({ error: error.message || 'Failed to export DOCX' }, { status: 500 });
  }
}
