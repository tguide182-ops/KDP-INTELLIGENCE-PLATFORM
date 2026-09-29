import { NextRequest, NextResponse } from 'next/server';
import { NicheService } from '@/services/NicheService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'cookbook';
  const marketplace = searchParams.get('marketplace') || 'amazon.com';

  try {
    const niches = NicheService.findSubNiches(query, marketplace);
    return NextResponse.json({
      query,
      marketplace,
      totalCount: niches.length,
      niches,
    });
  } catch (error) {
    console.error('Error finding sub-niches:', error);
    return NextResponse.json({ error: 'Failed to find sub-niches' }, { status: 500 });
  }
}
