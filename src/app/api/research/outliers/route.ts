import { NextResponse } from 'next/server';
import { YouTubeProviderFactory } from '@/lib/providers/youtube/factory';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId') || 'UC_mock_veritasium_style';
    const minMultiplier = parseFloat(searchParams.get('minMultiplier') || '2.0');

    const provider = YouTubeProviderFactory.getProvider();
    const outliers = await provider.getOutliers(channelId, minMultiplier);

    return NextResponse.json({ outliers });
  } catch (error: any) {
    console.error('Outlier scan error:', error);
    return NextResponse.json({ error: error.message || 'Failed to scan outliers' }, { status: 500 });
  }
}
