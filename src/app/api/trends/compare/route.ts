import { NextRequest, NextResponse } from 'next/server';
import { TrendService } from '@/services/TrendService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keywordsParam = searchParams.get('keywords') || 'glp-1 cookbook,menopause cookbook,keto cookbook,air fryer recipes';
  const timeframe = (searchParams.get('timeframe') as '30d' | '90d' | '12m') || '90d';

  const keywords = keywordsParam.split(',').map((s) => s.trim()).filter(Boolean);

  try {
    const result = TrendService.compareTrends(keywords, timeframe);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error comparing trends:', error);
    return NextResponse.json({ error: 'Failed to compare trends' }, { status: 500 });
  }
}
