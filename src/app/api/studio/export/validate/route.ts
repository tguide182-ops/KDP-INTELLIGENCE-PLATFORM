import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { KindleExportService } from '@/services/export/KindleExportService';
import { WritingQualityEngine } from '@/services/quality/WritingQualityEngine';
import { StyleProfileService } from '@/services/quality/StyleProfileService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId } = body;

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

    // 1. Run Kindle / Ebook structure validation
    const kindleValidation = KindleExportService.validateBookForKindle(book);

    // 2. Aggregate all drafted text for Writing Quality QA
    let fullManuscriptText = '';
    book.chapters.forEach((ch) => {
      ch.sections.forEach((sec) => {
        sec.blocks?.forEach((b) => {
          fullManuscriptText += b.content + '\n\n';
        });
      });
    });

    // 3. Get Style Profile for niche
    const styleProfile = StyleProfileService.getProfileForNiche(book.niche, book.targetAudience);

    // 4. Run editorial quality audit
    const qualityReport = WritingQualityEngine.analyzeText(fullManuscriptText, {
      emDashLimitPer1kWords: styleProfile.emDashLimitPer1k,
      maxBulletRatio: styleProfile.maxBulletRatio,
    });

    return NextResponse.json({
      bookId,
      bookTitle: book.title,
      kindleValidation,
      qualityReport,
      styleProfile,
    });
  } catch (error: any) {
    console.error('Error validating book for export:', error);
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 500 });
  }
}
