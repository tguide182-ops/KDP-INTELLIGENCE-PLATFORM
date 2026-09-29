export interface TrendDataPoint {
  date: string;
  volume: number;
}

export interface KeywordTrendSeries {
  keyword: string;
  direction: 'rising' | 'stable' | 'declining' | 'volatile';
  growthPct: number;
  averageVolume: number;
  dataPoints: TrendDataPoint[];
}

export interface TrendComparisonResult {
  keywords: string[];
  timeframe: '30d' | '90d' | '12m';
  series: KeywordTrendSeries[];
  fastestGrowing: string;
  summary: string;
}

export class TrendService {
  /**
   * Compare trends for multiple keywords over a timeframe
   */
  static compareTrends(
    keywords: string[],
    timeframe: '30d' | '90d' | '12m' = '90d'
  ): TrendComparisonResult {
    const pointsCount = timeframe === '30d' ? 6 : timeframe === '90d' ? 12 : 24;
    const now = new Date();

    const series: KeywordTrendSeries[] = keywords.map((kw) => {
      const lower = kw.toLowerCase().trim();
      let baseVol = 2400;
      let growthRate = 1.05;
      let direction: KeywordTrendSeries['direction'] = 'stable';

      if (lower.includes('glp') || lower.includes('ozempic')) {
        baseVol = 4800;
        growthRate = 1.25;
        direction = 'rising';
      } else if (lower.includes('menopause') || lower.includes('high protein')) {
        baseVol = 3600;
        growthRate = 1.15;
        direction = 'rising';
      } else if (lower.includes('keto')) {
        baseVol = 6200;
        growthRate = 0.92;
        direction = 'declining';
      } else if (lower.includes('air fryer')) {
        baseVol = 9500;
        growthRate = 1.02;
        direction = 'stable';
      }

      const dataPoints: TrendDataPoint[] = [];
      let current = Math.round(baseVol / Math.pow(growthRate, pointsCount / 4));

      for (let i = pointsCount - 1; i >= 0; i--) {
        const d = new Date(now);
        if (timeframe === '30d') d.setDate(d.getDate() - i * 5);
        else if (timeframe === '90d') d.setDate(d.getDate() - i * 7.5);
        else d.setMonth(d.getMonth() - i * 0.5);

        current = Math.round(current * (1 + (growthRate - 1) / (pointsCount / 3)) * (0.95 + Math.random() * 0.1));

        dataPoints.push({
          date: d.toISOString().split('T')[0],
          volume: current,
        });
      }

      const firstVol = dataPoints[0].volume;
      const lastVol = dataPoints[dataPoints.length - 1].volume;
      const growthPct = Math.round(((lastVol - firstVol) / firstVol) * 100);
      const avgVol = Math.round(dataPoints.reduce((acc, p) => acc + p.volume, 0) / dataPoints.length);

      return {
        keyword: kw,
        direction,
        growthPct,
        averageVolume: avgVol,
        dataPoints,
      };
    });

    const sortedByGrowth = [...series].sort((a, b) => b.growthPct - a.growthPct);
    const fastestGrowing = sortedByGrowth[0]?.keyword || keywords[0];

    return {
      keywords,
      timeframe,
      series,
      fastestGrowing,
      summary: `"${fastestGrowing}" is the fastest growing keyword across the ${timeframe} timeframe with a +${sortedByGrowth[0]?.growthPct}% momentum change.`,
    };
  }
}
