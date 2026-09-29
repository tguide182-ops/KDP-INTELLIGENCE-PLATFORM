import { NextRequest, NextResponse } from 'next/server';
import { SERPService } from '@/services/SERPService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'menopause cookbook';
  const marketplace = searchParams.get('marketplace') || 'amazon.com';

  try {
    const result = SERPService.getPageOneResults(query, marketplace);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing SERP:', error);
    return NextResponse.json({ error: 'Failed to analyze SERP' }, { status: 500 });
  }
}
