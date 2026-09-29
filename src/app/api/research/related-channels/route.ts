import { NextResponse } from 'next/server';
import { YouTubeProviderFactory } from '@/lib/providers/youtube/factory';
import { getCurrentUser } from '@/lib/auth/session';
import { cleanYouTubeInput } from '@/lib/youtube-utils';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelParam = searchParams.get('channel') || searchParams.get('channelId') || searchParams.get('q');
    let searchQuery = searchParams.get('query');

    const provider = YouTubeProviderFactory.getProvider();
    let targetChannelId = '';

    if (channelParam) {
      const parsed = cleanYouTubeInput(channelParam);
      let targetChannel = null;
      if (parsed.type === 'channelId') {
        targetChannel = await provider.getChannelById(parsed.value);
      } else {
        targetChannel = await provider.getChannelByHandle(parsed.value);
      }

      if (targetChannel) {
        targetChannelId = targetChannel.youtubeChannelId;
        if (!searchQuery) {
          // Derive search keywords from channel title and description
          const titleWords = targetChannel.title.replace(/[^\w\s]/gi, '').split(/\s+/).slice(0, 3).join(' ');
          searchQuery = titleWords || targetChannel.title;
        }
      }
    }

    if (!searchQuery) {
      searchQuery = 'documentary true crime engineering science';
    }

    const candidates = await provider.searchChannels(searchQuery, 8);
    // Filter out target channel if present
    const relatedChannels = candidates.filter(
      (c) => c.youtubeChannelId !== targetChannelId && c.handle !== channelParam
    ).slice(0, 6);

    return NextResponse.json({ relatedChannels });
  } catch (error: any) {
    console.error('Related channels discovery error:', error);
    return NextResponse.json({ error: error.message || 'Failed to discover related channels' }, { status: 500 });
  }
}
