import { NextRequest, NextResponse } from 'next/server';
import { ClusteringEngine } from '@/services/ClusteringEngine';
import { DemoDataProvider } from '@/services/DemoDataProvider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { keywords, seed = 'menopause cookbook', marketplace = 'amazon.com' } = body;

    const sourceKeywords = Array.isArray(keywords) && keywords.length > 0
      ? keywords
      : DemoDataProvider.getKeywordsForSeed(seed, marketplace);

    const clusters = ClusteringEngine.clusterKeywords(sourceKeywords);

    return NextResponse.json({
      totalKeywords: sourceKeywords.length,
      clusterCount: clusters.length,
      clusters,
    });
  } catch (error) {
    console.error('Error clustering keywords:', error);
    return NextResponse.json({ error: 'Failed to cluster keywords' }, { status: 500 });
  }
}
