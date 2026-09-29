import { ConfidenceLevel, DataProvenance, KeywordIntent, VolumeTrend } from '../lib/types';

export class KeywordVolumeEngine {
  /**
   * Classify keyword intent from semantic markers
   */
  static classifyIntent(term: string): KeywordIntent {
    const lower = term.toLowerCase();

    if (
      lower.includes('for beginners') ||
      lower.includes('for seniors') ||
      lower.includes('for women') ||
      lower.includes('for men') ||
      lower.includes('for kids') ||
      lower.includes('for teens') ||
      lower.includes('over 40') ||
      lower.includes('over 50') ||
      lower.includes('for couples')
    ) {
      return 'audience';
    }

    if (
      lower.includes('keto') ||
      lower.includes('high protein') ||
      lower.includes('low carb') ||
      lower.includes('gluten free') ||
      lower.includes('diabetic') ||
      lower.includes('anti inflammatory') ||
      lower.includes('mediterranean') ||
      lower.includes('vegan') ||
      lower.includes('plant based')
    ) {
      return 'diet_specific';
    }

    if (
      lower.includes('air fryer') ||
      lower.includes('instant pot') ||
      lower.includes('slow cooker') ||
      lower.includes('crockpot') ||
      lower.includes('blender') ||
      lower.includes('spiralizer')
    ) {
      return 'appliance_specific';
    }

    if (
      lower.includes('weight loss') ||
      lower.includes('fat loss') ||
      lower.includes('menopause relief') ||
      lower.includes('adhd relief') ||
      lower.includes('pain relief') ||
      lower.includes('healing') ||
      lower.includes('management')
    ) {
      return 'problem_solution';
    }

    if (
      lower.includes('cookbook') ||
      lower.includes('recipes') ||
      lower.includes('workbook') ||
      lower.includes('guide') ||
      lower.includes('journal') ||
      lower.includes('planner') ||
      lower.includes('handbook') ||
      lower.includes('manual')
    ) {
      return 'commercial';
    }

    if (
      lower.includes('best') ||
      lower.includes('buy') ||
      lower.includes('order') ||
      lower.includes('kindle edition') ||
      lower.includes('paperback')
    ) {
      return 'transactional';
    }

    if (
      lower.startsWith('what') ||
      lower.startsWith('how to') ||
      lower.startsWith('why') ||
      lower.startsWith('can you')
    ) {
      return 'informational';
    }

    return 'commercial';
  }

  /**
   * Determine volume trend from term characteristics
   */
  static determineTrend(term: string): VolumeTrend {
    const lower = term.toLowerCase();
    const risingKeywords = ['glp-1', 'glp 1', 'air fryer', 'high protein', 'menopause', 'adhd', 'ozempic', 'over 50', 'microbiome'];
    const decliningKeywords = ['dvd', 'cd', 'pager', 'fax', 'quarantine'];

    if (risingKeywords.some(k => lower.includes(k))) return 'rising';
    if (decliningKeywords.some(k => lower.includes(k))) return 'declining';
    return 'stable';
  }

  /**
   * Estimate monthly searches algorithmically
   */
  static estimateVolume(
    term: string,
    suggestionRank: number = 5, // 1 is top suggestion
    marketplace: string = 'amazon.com'
  ): {
    estimatedMonthlySearches: number;
    confidenceLevel: ConfidenceLevel;
    volumeTrend: VolumeTrend;
    dataSource: DataProvenance;
  } {
    const wordCount = term.trim().split(/\s+/).length;
    const trend = this.determineTrend(term);

    // Multiplier based on marketplace
    let marketMultiplier = 1.0;
    if (marketplace === 'amazon.co.uk') marketMultiplier = 0.28;
    else if (marketplace === 'amazon.de') marketMultiplier = 0.25;
    else if (marketplace === 'amazon.ca') marketMultiplier = 0.15;
    else if (marketplace === 'amazon.com.au') marketMultiplier = 0.12;
    else if (marketplace.includes('.es') || marketplace.includes('.it') || marketplace.includes('.fr')) marketMultiplier = 0.10;

    // Base volume calculated from suggestion position & length
    let base = 1200;
    if (suggestionRank === 1) base = 14500;
    else if (suggestionRank === 2) base = 9800;
    else if (suggestionRank === 3) base = 6700;
    else if (suggestionRank === 4) base = 4800;
    else if (suggestionRank === 5) base = 3400;
    else if (suggestionRank <= 8) base = 2100;
    else if (suggestionRank <= 10) base = 1300;
    else base = 450;

    // Long tail decay factor: longer phrases have lower individual volume
    if (wordCount > 4) {
      base = base * Math.max(0.3, 1 - (wordCount - 4) * 0.18);
    }

    // Trend adjustment
    if (trend === 'rising') base *= 1.35;
    else if (trend === 'declining') base *= 0.7;

    const estimatedMonthlySearches = Math.round((base * marketMultiplier) / 10) * 10;

    // Confidence level:
    // Suggestion ranks 1-3 with standard word count have HIGH confidence
    let confidenceLevel: ConfidenceLevel = 'MEDIUM';
    if (suggestionRank <= 3 && wordCount <= 4) confidenceLevel = 'HIGH';
    else if (suggestionRank > 8 || wordCount > 6) confidenceLevel = 'LOW';

    return {
      estimatedMonthlySearches: Math.max(80, estimatedMonthlySearches),
      confidenceLevel,
      volumeTrend: trend,
      dataSource: 'ESTIMATED',
    };
  }
}
