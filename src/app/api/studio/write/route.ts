import { NextRequest, NextResponse } from 'next/server';
import { WritingEngineService } from '@/services/WritingEngineService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, chapterId, mode = 'chapter' } = body;

    if (!bookId) {
      return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
    }

    if (mode === 'full') {
      const result = await WritingEngineService.draftFullBook(bookId);
      return NextResponse.json({
        success: true,
        message: `Successfully drafted all ${result.chaptersDrafted} chapters`,
        ...result,
      });
    }

    if (!chapterId) {
      return NextResponse.json({ error: 'chapterId is required for chapter mode' }, { status: 400 });
    }

    const result = await WritingEngineService.draftChapter(bookId, chapterId);
    return NextResponse.json({
      success: true,
      message: `Successfully drafted chapter "${result.title}"`,
      ...result,
    });
  } catch (error: any) {
    console.error('Error drafting book content:', error);
    return NextResponse.json({ error: error.message || 'Failed to draft content' }, { status: 500 });
  }
}
