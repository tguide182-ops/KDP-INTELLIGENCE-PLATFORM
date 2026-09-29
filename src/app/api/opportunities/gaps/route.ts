import { NextRequest, NextResponse } from 'next/server';
import { GapAnalysisEngine } from '@/services/GapAnalysisEngine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const niche = searchParams.get('niche') || 'menopause cookbook';

  try {
    const gaps = GapAnalysisEngine.analyzeGaps(niche);
    return NextResponse.json({
      niche,
      totalGaps: gaps.length,
      gaps,
    });
  } catch (error) {
    console.error('Error analyzing opportunity gaps:', error);
    return NextResponse.json({ error: 'Failed to analyze opportunity gaps' }, { status: 500 });
  }
}
