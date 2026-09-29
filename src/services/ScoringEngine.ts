import { ScoreBreakdown, CompetitionBreakdown, KeywordIntent, VolumeTrend } from '../lib/types';

export class ScoringEngine {
  /**
   * Calculate transparent Demand Score (0 - 10)
   */
  static calculateDemandScore(
    estimatedVol: number,
    suggestionRank: number, // 1 to 10 (1 is top suggestion, 11+ is not in top 10)
    trend: VolumeTrend,
    intent: KeywordIntent
  ): { score: number; breakdown: ScoreBreakdown } {
    // 1. Search Volume Score (0 - 10) on log scale
    // 100 searches -> ~3, 1,000 -> ~6, 10,000 -> ~8.5, 50,000+ -> 10
    const volScore = Math.min(10, Math.max(1, Math.log10(Math.max(10, estimatedVol)) * 2.2));

    // 2. Suggestion Prominence Score (0 - 10)
    // Rank 1 = 10, Rank 2 = 9.5, ..., Rank 10 = 5.5, Not suggested = 2.0
    let suggScore = 2.0;
    if (suggestionRank > 0 && suggestionRank <= 10) {
      suggScore = Math.max(5.0, 10.5 - suggestionRank * 0.5);
    }

    // 3. Trend Score (0 - 10)
    let trendScore = 6.0;
    if (trend === 'rising') trendScore = 9.5;
    else if (trend === 'declining') trendScore = 3.0;

    // 4. Commercial Intent Score (0 - 10)
    let intentScore = 6.0;
    if (intent === 'commercial' || intent === 'transactional') intentScore = 9.5;
    else if (intent === 'audience' || intent === 'problem_solution' || intent === 'diet_specific') intentScore = 8.5;
    else if (intent === 'informational') intentScore = 4.0;

    // Weights: Volume 40%, Suggestion 25%, Trend 15%, Intent 20%
    const searchVolumeWeight = 0.40;
    const suggestionWeight = 0.25;
    const trendWeight = 0.15;
    const intentWeight = 0.20;

    const weightedScore = (
      volScore * searchVolumeWeight +
      suggScore * suggestionWeight +
      trendScore * trendWeight +
      intentScore * intentWeight
    );

    const finalScore = Math.round(weightedScore * 10) / 10;

    return {
      score: Math.min(10, Math.max(1, finalScore)),
      breakdown: {
        searchVolumeWeight,
        suggestionWeight,
        trendWeight,
        intentWeight,
        searchVolumeScore: Math.round(volScore * 10) / 10,
        suggestionScore: Math.round(suggScore * 10) / 10,
        trendScore: Math.round(trendScore * 10) / 10,
        intentScore: Math.round(intentScore * 10) / 10,
        finalScore: Math.min(10, Math.max(1, finalScore)),
      },
    };
  }

  /**
   * Calculate transparent Competition Score (0 - 10)
   */
  static calculateCompetitionScore(
    amazonResultCount: number,
    medianReviews: number = 350,
    medianBSR: number = 45000,
    pctNewerThanOneYear: number = 0.25,
    titleMatchRatio: number = 0.70
  ): { score: number; breakdown: CompetitionBreakdown } {
    // 1. Result count score (0 - 10)
    // < 300 results -> 2, 1,000 results -> 4.5, 5,000 -> 7.5, 20,000+ -> 10
    const resultsScore = Math.min(10, Math.max(1, Math.log10(Math.max(10, amazonResultCount)) * 2.3));

    // 2. Reviews score: < 50 reviews -> 2, 100 -> 4, 500 -> 7, 1000+ -> 9.5
    const reviewsScore = Math.min(10, Math.max(1, Math.log10(Math.max(1, medianReviews)) * 3.0));

    // 3. BSR score (Lower BSR = fiercer competitor sales velocity, so higher competition score)
    // BSR < 5,000 -> 9.5, BSR 50,000 -> 6.0, BSR > 300,000 -> 2.5
    let bsrScore = 5.0;
    if (medianBSR < 5000) bsrScore = 9.5;
    else if (medianBSR < 25000) bsrScore = 8.0;
    else if (medianBSR < 75000) bsrScore = 6.0;
    else if (medianBSR < 200000) bsrScore = 4.0;
    else bsrScore = 2.0;

    // 4. Age score (Higher newcomer ratio means easier for new books to penetrate -> lower competition score)
    // If 50%+ are < 1 year old -> 3.0, if < 10% are new -> 8.5
    const ageScore = Math.min(10, Math.max(1, 10 - (pctNewerThanOneYear * 10)));

    // 5. Title match ratio (High exact match in titles = targeted competition)
    const titleMatchScore = Math.min(10, Math.max(1, titleMatchRatio * 10));

    // Weights: Results 25%, Reviews 25%, BSR 20%, Age 15%, TitleMatch 15%
    const resultsWeight = 0.25;
    const reviewsWeight = 0.25;
    const bsrWeight = 0.20;
    const ageWeight = 0.15;
    const titleMatchWeight = 0.15;

    const weightedScore = (
      resultsScore * resultsWeight +
      reviewsScore * reviewsWeight +
      bsrScore * bsrWeight +
      ageScore * ageWeight +
      titleMatchScore * titleMatchWeight
    );

    const finalScore = Math.round(weightedScore * 10) / 10;

    return {
      score: Math.min(10, Math.max(1, finalScore)),
      breakdown: {
        resultsWeight,
        reviewsWeight,
        bsrWeight,
        ageWeight,
        titleMatchWeight,
        resultsScore: Math.round(resultsScore * 10) / 10,
        reviewsScore: Math.round(reviewsScore * 10) / 10,
        bsrScore: Math.round(bsrScore * 10) / 10,
        ageScore: Math.round(ageScore * 10) / 10,
        titleMatchScore: Math.round(titleMatchScore * 10) / 10,
        finalScore: Math.min(10, Math.max(1, finalScore)),
      },
    };
  }

  /**
   * Calculate transparent Opportunity Score (0 - 10)
   */
  static calculateOpportunityScore(
    demandScore: number,
    competitionScore: number,
    trend: VolumeTrend,
    intent: KeywordIntent
  ): number {
    let trendBonus = 0;
    if (trend === 'rising') trendBonus = 0.5;
    else if (trend === 'declining') trendBonus = -0.5;

    let intentBonus = 0;
    if (intent === 'commercial' || intent === 'transactional') intentBonus = 0.4;
    else if (intent === 'audience' || intent === 'problem_solution') intentBonus = 0.2;

    // Base formula: (Demand * 1.25) - (Competition * 0.75) + Bonuses
    const base = (demandScore * 1.25) - (competitionScore * 0.75) + trendBonus + intentBonus;
    const clamped = Math.min(9.9, Math.max(1.0, base));
    return Math.round(clamped * 10) / 10;
  }
}
