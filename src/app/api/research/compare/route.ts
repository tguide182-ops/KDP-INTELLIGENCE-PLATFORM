import { NextResponse } from 'next/server';
import { YouTubeProviderFactory } from '@/lib/providers/youtube/factory';
import { getCurrentUser } from '@/lib/auth/session';
import { cleanYouTubeInput } from '@/lib/youtube-utils';
import { NormalizedChannel, NormalizedVideo, NormalizedOutlier } from '@/lib/providers/youtube/types';
import { wrapMetric, MetricWithProvenance } from '@/lib/provenance';

export interface ComparedChannelData {
  channel: NormalizedChannel;
  stats: {
    subscriberCount: number;
    viewCount: number;
    videoCount: number;
    avgViews: number;
    uploadCadenceDays: number;
    videosPerMonth: number;
    outlierRatePercent: number;
    avgDurationFormatted: string;
    shortsRatioPercent: number;
  };
  topOutlier: {
    title: string;
    views: number;
    multiplier: number;
    thumbnailUrl: string;
    videoId: string;
  } | null;
  recentVideos: NormalizedVideo[];
}

export interface ChannelComparisonResult {
  channels: ComparedChannelData[];
  benchmarks: {
    subscriberLeader: string;
    avgViewsLeader: string;
    cadenceLeader: string;
    topOutlierLeader: string;
  };
  strategicGaps: {
    whiteSpaceTitle: string;
    whiteSpaceDescription: string;
    tacticalRecommendations: string[];
    suggestedFormatAngle: string;
  };
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelsParam = searchParams.get('channels');

    if (!channelsParam) {
      return NextResponse.json({ error: 'channels parameter is required (comma-separated handles or URLs)' }, { status: 400 });
    }

    const rawList = channelsParam
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, 4); // Limit to 4 channels side-by-side

    if (rawList.length === 0) {
      return NextResponse.json({ error: 'At least one channel must be provided' }, { status: 400 });
    }

    const provider = YouTubeProviderFactory.getProvider();

    // Fetch channel profiles in parallel
    const channelResults = await Promise.all(
      rawList.map(async (raw) => {
        try {
          const parsed = cleanYouTubeInput(raw);
          let ch: NormalizedChannel | null = null;
          if (parsed.type === 'channelId') {
            ch = await provider.getChannelById(parsed.value);
          } else {
            ch = await provider.getChannelByHandle(parsed.value);
            if (!ch) {
              const searchResults = await provider.searchChannels(parsed.value.replace(/^@/, ''), 1);
              if (searchResults.length > 0) ch = searchResults[0];
            }
          }
          return ch;
        } catch {
          return null;
        }
      })
    );

    const validChannels = channelResults.filter((c): c is NormalizedChannel => c !== null);

    if (validChannels.length === 0) {
      return NextResponse.json({ error: 'No valid channels could be resolved' }, { status: 404 });
    }

    // Fetch videos & calculate metrics for each channel
    const comparedData: ComparedChannelData[] = await Promise.all(
      validChannels.map(async (ch) => {
        let videos: NormalizedVideo[] = [];
        try {
          videos = await provider.getChannelVideos(ch.youtubeChannelId, 25);
        } catch (err) {
          console.warn(`Failed to fetch videos for ${ch.title}:`, err);
        }

        const subs = ch.subscriberCount.value;
        const totalViews = ch.viewCount.value;
        const totalVideos = ch.videoCount.value;
        const baselineAvg = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;

        // Calculate upload cadence from video timestamps
        let uploadCadenceDays = 7;
        if (videos.length >= 2) {
          const dates = videos
            .map((v) => new Date(v.publishedAt).getTime())
            .filter((t) => !isNaN(t))
            .sort((a, b) => b - a);

          if (dates.length >= 2) {
            const intervals: number[] = [];
            for (let i = 0; i < dates.length - 1; i++) {
              const diffDays = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);
              if (diffDays > 0 && diffDays < 90) {
                intervals.push(diffDays);
              }
            }
            if (intervals.length > 0) {
              uploadCadenceDays = Number((intervals.reduce((a, b) => a + b, 0) / intervals.length).toFixed(1));
            }
          }
        }

        const videosPerMonth = uploadCadenceDays > 0 ? Number((30 / uploadCadenceDays).toFixed(1)) : 4;

        // Outlier detection & rate
        let outlierCount = 0;
        let topOutlierVideo: NormalizedVideo | null = null;
        let maxMultiplier = 0;

        videos.forEach((v) => {
          const mult = baselineAvg > 0 ? Number((v.views.value / baselineAvg).toFixed(2)) : 1.0;
          if (mult >= 1.5) outlierCount++;
          if (mult > maxMultiplier) {
            maxMultiplier = mult;
            topOutlierVideo = v;
          }
        });

        const outlierRatePercent = videos.length > 0 ? Math.round((outlierCount / videos.length) * 100) : 0;

        // Average duration & Shorts ratio
        let totalDuration = 0;
        let shortsCount = 0;
        videos.forEach((v) => {
          totalDuration += v.durationSeconds || 0;
          if (v.isShort) shortsCount++;
        });

        const avgDurationSec = videos.length > 0 ? Math.round(totalDuration / videos.length) : 0;
        const avgMin = Math.floor(avgDurationSec / 60);
        const avgSec = avgDurationSec % 60;
        const avgDurationFormatted = `${avgMin}:${avgSec < 10 ? '0' : ''}${avgSec}`;
        const shortsRatioPercent = videos.length > 0 ? Math.round((shortsCount / videos.length) * 100) : 0;

        const topOutlier = topOutlierVideo
          ? {
              title: (topOutlierVideo as NormalizedVideo).title,
              views: (topOutlierVideo as NormalizedVideo).views.value,
              multiplier: maxMultiplier,
              thumbnailUrl: (topOutlierVideo as NormalizedVideo).thumbnailUrl,
              videoId: (topOutlierVideo as NormalizedVideo).youtubeVideoId,
            }
          : null;

        return {
          channel: ch,
          stats: {
            subscriberCount: subs,
            viewCount: totalViews,
            videoCount: totalVideos,
            avgViews: baselineAvg,
            uploadCadenceDays,
            videosPerMonth,
            outlierRatePercent,
            avgDurationFormatted,
            shortsRatioPercent,
          },
          topOutlier,
          recentVideos: videos.slice(0, 6),
        };
      })
    );

    // Compute Leaders
    let subLeader = comparedData[0];
    let avgViewsLeader = comparedData[0];
    let cadenceLeader = comparedData[0];
    let topOutlierLeader = comparedData[0];

    comparedData.forEach((cd) => {
      if (cd.stats.subscriberCount > subLeader.stats.subscriberCount) subLeader = cd;
      if (cd.stats.avgViews > avgViewsLeader.stats.avgViews) avgViewsLeader = cd;
      if (cd.stats.videosPerMonth > cadenceLeader.stats.videosPerMonth) cadenceLeader = cd;
      if ((cd.topOutlier?.multiplier || 0) > (topOutlierLeader.topOutlier?.multiplier || 0)) {
        topOutlierLeader = cd;
      }
    });

    // Strategic Gap & White Space Analysis
    const targetChannel = comparedData[0];
    const isTargetDominantInViews = targetChannel.channel.id === avgViewsLeader.channel.id;
    const isTargetFastestCadence = targetChannel.channel.id === cadenceLeader.channel.id;

    const strategicGaps = {
      whiteSpaceTitle: `${targetChannel.channel.title} vs Niche Competitor Analysis`,
      whiteSpaceDescription: isTargetDominantInViews
        ? `${targetChannel.channel.title} commands higher average view density (${targetChannel.stats.avgViews.toLocaleString()} avg) than peers, indicating stronger packaging and retention fidelity per upload.`
        : `${avgViewsLeader.channel.title} currently leads the peer group in average view volume (${avgViewsLeader.stats.avgViews.toLocaleString()} avg), driven by higher-stakes curiosity hooks and broader packaging reach.`,
      tacticalRecommendations: [
        isTargetFastestCadence
          ? `High upload cadence (${targetChannel.stats.videosPerMonth} vids/mo) is active: ensure production quality does not dilute outlier velocity.`
          : `Competitors maintain an average upload cadence of ~${cadenceLeader.stats.uploadCadenceDays} days. Consider increasing release consistency to capture recurring algorithmic recommendations.`,
        `Outlier Benchmark: Highest peer outlier achieved ${topOutlierLeader.topOutlier?.multiplier || 2.5}× baseline. Benchmark thumbnail contrast and title curiosity against "${topOutlierLeader.topOutlier?.title || 'top outlier'}" without copying topic directly.`,
        `Format Opportunity: ${comparedData.some((c) => c.stats.shortsRatioPercent > 30) ? 'Rivals are utilizing Shorts for top-of-funnel discovery. Test companion Shorts pointing to longform investigations.' : 'All compared channels focus predominantly on longform content. A dedicated Short-form hook preview strategy represents uncontested ground.'}`,
      ],
      suggestedFormatAngle: `Contrarian Forensic Deep Dive: Focus on the single question that ${comparedData.map((c) => c.channel.title).slice(1).join(' and ') || 'competitors'} have left unanswered in recent coverage.`,
    };

    const response: ChannelComparisonResult = {
      channels: comparedData,
      benchmarks: {
        subscriberLeader: subLeader.channel.title,
        avgViewsLeader: avgViewsLeader.channel.title,
        cadenceLeader: cadenceLeader.channel.title,
        topOutlierLeader: topOutlierLeader.channel.title,
      },
      strategicGaps,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Channel comparison error:', error);
    return NextResponse.json({ error: error.message || 'Failed to compare channels' }, { status: 500 });
  }
}
