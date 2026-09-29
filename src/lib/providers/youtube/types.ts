import { MetricWithProvenance, ProvenanceType } from '@/lib/provenance';

export interface NormalizedChannel {
  id: string;
  youtubeChannelId: string;
  handle: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  customUrl?: string;
  country?: string;
  publishedAt: string;
  subscriberCount: MetricWithProvenance<number>;
  viewCount: MetricWithProvenance<number>;
  videoCount: MetricWithProvenance<number>;
  avgViews30d: MetricWithProvenance<number>;
  uploadFrequencyDays: MetricWithProvenance<number>;
  isOwned?: boolean;
}

export interface NormalizedVideo {
  id: string;
  youtubeVideoId: string;
  channelId: string;
  channelTitle: string;
  channelHandle?: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  durationSeconds: number;
  durationFormatted: string;
  isShort: boolean;
  publishedAt: string;
  views: MetricWithProvenance<number>;
  likes: MetricWithProvenance<number>;
  comments: MetricWithProvenance<number>;
  multiplierVsBaseline?: MetricWithProvenance<number>;
  viewVelocity?: MetricWithProvenance<number>; // views/hr
}

export interface NormalizedOutlier {
  videoId: string;
  video: NormalizedVideo;
  channelId: string;
  channelTitle: string;
  multiplier: MetricWithProvenance<number>;
  baselineViews: MetricWithProvenance<number>;
  actualViews: MetricWithProvenance<number>;
  classificationReason: string;
  detectionDate: string;
}

export interface NormalizedComment {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  text: string;
  likeCount: number;
  publishedAt: string;
}

export interface NormalizedTranscriptSegment {
  start: number; // seconds
  duration: number; // seconds
  text: string;
}

export interface NormalizedTranscript {
  videoId: string;
  segments: NormalizedTranscriptSegment[];
  fullText: string;
  hookText: string;
  durationSeconds: number;
  wordCount: number;
  provenance: ProvenanceType;
}

export interface VideoAutopsyResult {
  videoId: string;
  video: NormalizedVideo;
  hookAnalysis: {
    hookText: string;
    hookType: 'QUESTION' | 'SHOCK' | 'CONTRARIAN' | 'MICRO_STORY' | 'CURIOSITY_GAP';
    hookStrength: number; // 0 - 100
    whyItWorks: string;
  };
  contentStructure: Array<{
    timestamp: string;
    beatTitle: string;
    beatObjective: string;
    pacingScore: number;
  }>;
  whyThisVideoStandsOut: string;
  whatCanBeLearned: string[];
  whatIsReplicable: string[];
  whatShouldNotBeCopied: string[];
  originalContentOpportunities: string[];
}

export interface ChannelDNAResult {
  channelId: string;
  positioning: string;
  topicPillars: Array<{ pillar: string; frequencyPercent: number; avgMultiplier: number }>;
  titleDNA: {
    formula: string;
    characterCountAvg: number;
    highPerformingTriggers: string[];
  };
  thumbnailDNA: {
    colorPalette: string[];
    focalStyle: string;
    textDensity: 'LOW' | 'MEDIUM' | 'HIGH';
    expressionStyle: string;
  };
  hookDNA: {
    primaryStyle: string;
    curiosityDurationSec: number;
  };
  visualDNA: {
    pacing: string;
    bRollFrequency: string;
  };
  storytellingDNA: {
    arcPattern: string;
    openLoopsAverage: number;
  };
}
