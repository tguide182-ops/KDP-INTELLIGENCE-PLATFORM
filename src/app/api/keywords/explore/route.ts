import { NextRequest, NextResponse } from 'next/server';
import { AmazonSuggestionProvider } from '@/services/AmazonSuggestionProvider';
import { KeywordVolumeEngine } from '@/services/KeywordVolumeEngine';
import { ScoringEngine } from '@/services/ScoringEngine';
import { DemoDataProvider } from '@/services/DemoDataProvider';
import { KeywordItem } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const marketplace = searchParams.get('marketplace') || 'amazon.com';
  const expand = searchParams.get('expand') === 'true';

  if (!query.trim()) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const startTime = Date.now();
  let items: KeywordItem[] = [];
  let source: 'REAL' | 'DEMO' | 'HYBRID' = 'REAL';

  try {
    // 1. Attempt live Amazon autocomplete suggestions
    const rawSuggestions = expand
      ? await AmazonSuggestionProvider.expandKeywords(query, marketplace)
      : await AmazonSuggestionProvider.fetchSuggestions(query, marketplace);

    if (rawSuggestions && rawSuggestions.length > 0) {
      items = rawSuggestions.map((item, idx) => {
        const intent = KeywordVolumeEngine.classifyIntent(item.term);
        const volData = KeywordVolumeEngine.estimateVolume(item.term, item.rank, marketplace);
        
        // Estimate competition signals from rank & length
        const baseResultCount = Math.max(120, Math.round(3500 / Math.max(1, item.rank) + (item.term.length * 45)));
        const demand = ScoringEngine.calculateDemandScore(
          volData.estimatedMonthlySearches,
          item.rank,
          volData.volumeTrend,
          intent
        );
        const competition = ScoringEngine.calculateCompetitionScore(baseResultCount);
        const opportunity = ScoringEngine.calculateOpportunityScore(
          demand.score,
          competition.score,
          volData.volumeTrend,
          intent
        );

        return {
          id: `live-${idx}-${encodeURIComponent(item.term)}`,
          term: item.term,
          normalizedTerm: item.term.toLowerCase(),
          marketplace,
          phraseType: item.phraseType,
          wordCount: item.term.split(/\s+/).length,
          intent,
          parentKeyword: item.parentKeyword || query.toLowerCase(),
          estimatedMonthlyVol: volData.estimatedMonthlySearches,
          volumeTrend: volData.volumeTrend,
          amazonResultCount: baseResultCount,
          confidenceLevel: volData.confidenceLevel,
          dataSource: 'REAL',
          demandScore: demand.score,
          competitionScore: competition.score,
          opportunityScore: opportunity,
          demandBreakdown: demand.breakdown,
          competitionBreakdown: competition.breakdown,
          lastUpdated: new Date().toISOString(),
        };
      });
    }
  } catch (err) {
    console.warn('Live Amazon suggestion fetch failed, falling back to Demo provider:', err);
  }

  // 2. If live returned no results or failed, fall back to high quality demo datasets
  if (items.length === 0) {
    items = DemoDataProvider.getKeywordsForSeed(query, marketplace);
    source = 'DEMO';
  }

  const durationMs = Date.now() - startTime;

  return NextResponse.json({
    query,
    marketplace,
    totalCount: items.length,
    source,
    durationMs,
    keywords: items,
  });
}
