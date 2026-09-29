import { KeywordItem } from '../lib/types';
import { KeywordVolumeEngine } from './KeywordVolumeEngine';
import { ScoringEngine } from './ScoringEngine';

export class DemoDataProvider {
  static getKeywordsForSeed(seed: string, marketplace: string = 'amazon.com'): KeywordItem[] {
    const lowerSeed = seed.toLowerCase().trim();

    let rawList: Array<{
      term: string;
      rank: number;
      phraseType: 'seed' | 'suggestion' | 'alphabet' | 'question' | 'modifier';
      resultCount: number;
      medianReviews?: number;
      medianBSR?: number;
    }> = [];

    if (lowerSeed.includes('menopause')) {
      rawList = [
        { term: 'menopause cookbook', rank: 1, phraseType: 'seed', resultCount: 1840, medianReviews: 420, medianBSR: 18400 },
        { term: 'menopause cookbook for women', rank: 2, phraseType: 'suggestion', resultCount: 1420, medianReviews: 310, medianBSR: 22000 },
        { term: 'menopause cookbook for weight loss', rank: 3, phraseType: 'suggestion', resultCount: 890, medianReviews: 190, medianBSR: 14200 },
        { term: 'menopause cookbook over 40', rank: 4, phraseType: 'suggestion', resultCount: 650, medianReviews: 120, medianBSR: 29000 },
        { term: 'menopause recipes', rank: 5, phraseType: 'suggestion', resultCount: 2400, medianReviews: 610, medianBSR: 32000 },
        { term: 'menopause diet cookbook', rank: 6, phraseType: 'suggestion', resultCount: 1980, medianReviews: 480, medianBSR: 19500 },
        { term: 'high protein menopause cookbook', rank: 7, phraseType: 'modifier', resultCount: 420, medianReviews: 75, medianBSR: 11200 },
        { term: 'mediterranean menopause cookbook', rank: 8, phraseType: 'modifier', resultCount: 560, medianReviews: 95, medianBSR: 15400 },
        { term: 'menopause diet for belly fat', rank: 9, phraseType: 'suggestion', resultCount: 780, medianReviews: 140, medianBSR: 17800 },
        { term: 'menopause reset cookbook', rank: 10, phraseType: 'suggestion', resultCount: 1120, medianReviews: 350, medianBSR: 21000 },
        { term: 'easy menopause cookbook for beginners', rank: 11, phraseType: 'modifier', resultCount: 310, medianReviews: 45, medianBSR: 16500 },
        { term: 'menopause hormone balance cookbook', rank: 12, phraseType: 'modifier', resultCount: 610, medianReviews: 88, medianBSR: 24000 },
        { term: 'plant based menopause cookbook', rank: 13, phraseType: 'modifier', resultCount: 390, medianReviews: 62, medianBSR: 38000 },
        { term: 'what to eat during menopause book', rank: 14, phraseType: 'question', resultCount: 1450, medianReviews: 290, medianBSR: 42000 },
        { term: 'menopause cookbook for seniors over 60', rank: 15, phraseType: 'modifier', resultCount: 220, medianReviews: 30, medianBSR: 28000 },
      ];
    } else if (lowerSeed.includes('glp') || lowerSeed.includes('ozempic')) {
      rawList = [
        { term: 'glp-1 cookbook', rank: 1, phraseType: 'seed', resultCount: 620, medianReviews: 110, medianBSR: 8400 },
        { term: 'glp-1 high protein cookbook', rank: 2, phraseType: 'suggestion', resultCount: 340, medianReviews: 65, medianBSR: 6200 },
        { term: 'glp-1 recipes for weight loss', rank: 3, phraseType: 'suggestion', resultCount: 510, medianReviews: 85, medianBSR: 9100 },
        { term: 'glp 1 diet cookbook', rank: 4, phraseType: 'suggestion', resultCount: 590, medianReviews: 92, medianBSR: 11500 },
        { term: 'easy glp-1 cookbook for beginners', rank: 5, phraseType: 'modifier', resultCount: 195, medianReviews: 32, medianBSR: 7800 },
        { term: 'glp-1 meal prep cookbook', rank: 6, phraseType: 'modifier', resultCount: 280, medianReviews: 48, medianBSR: 8900 },
        { term: 'glp-1 side effect relief recipes', rank: 7, phraseType: 'question', resultCount: 140, medianReviews: 18, medianBSR: 14500 },
        { term: 'anti nausea glp-1 cookbook', rank: 8, phraseType: 'modifier', resultCount: 115, medianReviews: 14, medianBSR: 16200 },
        { term: 'glp-1 cookbook for seniors', rank: 9, phraseType: 'modifier', resultCount: 160, medianReviews: 22, medianBSR: 19400 },
      ];
    } else if (lowerSeed.includes('air fryer')) {
      rawList = [
        { term: 'air fryer recipes', rank: 1, phraseType: 'seed', resultCount: 8400, medianReviews: 2400, medianBSR: 3200 },
        { term: 'air fryer cookbook', rank: 2, phraseType: 'suggestion', resultCount: 12500, medianReviews: 3800, medianBSR: 1800 },
        { term: 'air fryer recipes for beginners', rank: 3, phraseType: 'suggestion', resultCount: 4200, medianReviews: 1100, medianBSR: 4500 },
        { term: 'air fryer cookbook for seniors', rank: 4, phraseType: 'suggestion', resultCount: 1850, medianReviews: 340, medianBSR: 8200 },
        { term: 'air fryer low carb recipes', rank: 5, phraseType: 'modifier', resultCount: 2100, medianReviews: 420, medianBSR: 9800 },
        { term: 'air fryer chicken recipes cookbook', rank: 6, phraseType: 'modifier', resultCount: 1600, medianReviews: 290, medianBSR: 12400 },
        { term: 'air fryer mediterranean recipes', rank: 7, phraseType: 'modifier', resultCount: 950, medianReviews: 180, medianBSR: 7900 },
        { term: 'air fryer cookbook for two', rank: 8, phraseType: 'suggestion', resultCount: 3100, medianReviews: 890, medianBSR: 5100 },
      ];
    } else {
      // General fallback seed generation
      rawList = [
        { term: lowerSeed, rank: 1, phraseType: 'seed', resultCount: 2100, medianReviews: 400, medianBSR: 25000 },
        { term: `${lowerSeed} for beginners`, rank: 2, phraseType: 'suggestion', resultCount: 1200, medianReviews: 210, medianBSR: 28000 },
        { term: `${lowerSeed} guide`, rank: 3, phraseType: 'suggestion', resultCount: 1800, medianReviews: 320, medianBSR: 31000 },
        { term: `easy ${lowerSeed}`, rank: 4, phraseType: 'suggestion', resultCount: 950, medianReviews: 160, medianBSR: 34000 },
        { term: `${lowerSeed} workbook`, rank: 5, phraseType: 'suggestion', resultCount: 720, medianReviews: 110, medianBSR: 22000 },
        { term: `${lowerSeed} for women`, rank: 6, phraseType: 'modifier', resultCount: 880, medianReviews: 140, medianBSR: 26000 },
        { term: `${lowerSeed} for seniors`, rank: 7, phraseType: 'modifier', resultCount: 540, medianReviews: 85, medianBSR: 29000 },
        { term: `complete ${lowerSeed} handbook`, rank: 8, phraseType: 'modifier', resultCount: 610, medianReviews: 95, medianBSR: 38000 },
      ];
    }

    return rawList.map((item, index) => {
      const intent = KeywordVolumeEngine.classifyIntent(item.term);
      const volumeData = KeywordVolumeEngine.estimateVolume(item.term, item.rank, marketplace);
      const demand = ScoringEngine.calculateDemandScore(
        volumeData.estimatedMonthlySearches,
        item.rank,
        volumeData.volumeTrend,
        intent
      );
      const competition = ScoringEngine.calculateCompetitionScore(
        item.resultCount,
        item.medianReviews || 300,
        item.medianBSR || 35000
      );
      const opportunity = ScoringEngine.calculateOpportunityScore(
        demand.score,
        competition.score,
        volumeData.volumeTrend,
        intent
      );

      return {
        id: `demo-${index}-${encodeURIComponent(item.term)}`,
        term: item.term,
        normalizedTerm: item.term.toLowerCase(),
        marketplace,
        phraseType: item.phraseType,
        wordCount: item.term.split(/\s+/).length,
        intent,
        parentKeyword: lowerSeed,
        estimatedMonthlyVol: volumeData.estimatedMonthlySearches,
        volumeTrend: volumeData.volumeTrend,
        amazonResultCount: item.resultCount,
        confidenceLevel: volumeData.confidenceLevel,
        dataSource: 'DEMO',
        demandScore: demand.score,
        competitionScore: competition.score,
        opportunityScore: opportunity,
        demandBreakdown: demand.breakdown,
        competitionBreakdown: competition.breakdown,
        lastUpdated: new Date().toISOString(),
      };
    });
  }
}
