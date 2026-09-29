import { NextRequest, NextResponse } from 'next/server';
import { DefaultLLMProvider } from '@/services/ai/LLMProvider';
import { CostTracker } from '@/services/ai/CostTracker';
import { DemoDataProvider } from '@/services/DemoDataProvider';
import { AmazonSuggestionProvider } from '@/services/AmazonSuggestionProvider';
import { ScoringEngine } from '@/services/ScoringEngine';
import { KeywordVolumeEngine } from '@/services/KeywordVolumeEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, marketplace = 'amazon.com' } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Research prompt is required' }, { status: 400 });
    }

    const startTime = Date.now();

    // 1. Identify seed keyword from prompt
    let detectedSeed = 'menopause cookbook';
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('glp') || lowerPrompt.includes('ozempic')) detectedSeed = 'glp-1 cookbook';
    else if (lowerPrompt.includes('air fryer')) detectedSeed = 'air fryer recipes';
    else if (lowerPrompt.includes('protein')) detectedSeed = 'high protein recipes';
    else if (lowerPrompt.includes('planner') || lowerPrompt.includes('adhd')) detectedSeed = 'adhd planner';
    else {
      // Extract main noun phrase
      const words = prompt.split(/\s+/).filter((w: string) => w.length > 3 && !['find', 'what', 'analyze', 'best', 'tell'].includes(w.toLowerCase()));
      if (words.length > 0) detectedSeed = words.slice(0, 3).join(' ');
    }

    // 2. Fetch live or demo keywords
    let keywords = DemoDataProvider.getKeywordsForSeed(detectedSeed, marketplace);
    try {
      const liveSuggestions = await AmazonSuggestionProvider.fetchSuggestions(detectedSeed, marketplace);
      if (liveSuggestions && liveSuggestions.length > 0) {
        keywords = liveSuggestions.map((s, idx) => {
          const intent = KeywordVolumeEngine.classifyIntent(s.term);
          const vol = KeywordVolumeEngine.estimateVolume(s.term, s.rank, marketplace);
          const demand = ScoringEngine.calculateDemandScore(vol.estimatedMonthlySearches, s.rank, vol.volumeTrend, intent);
          const comp = ScoringEngine.calculateCompetitionScore(2000);
          const opp = ScoringEngine.calculateOpportunityScore(demand.score, comp.score, vol.volumeTrend, intent);

          return {
            id: `ai-live-${idx}-${encodeURIComponent(s.term)}`,
            term: s.term,
            normalizedTerm: s.term.toLowerCase(),
            marketplace,
            phraseType: s.phraseType,
            wordCount: s.term.split(/\s+/).length,
            intent,
            parentKeyword: detectedSeed,
            estimatedMonthlyVol: vol.estimatedMonthlySearches,
            volumeTrend: vol.volumeTrend,
            amazonResultCount: 2000,
            confidenceLevel: vol.confidenceLevel,
            dataSource: 'REAL' as const,
            demandScore: demand.score,
            competitionScore: comp.score,
            opportunityScore: opp,
            demandBreakdown: demand.breakdown,
            competitionBreakdown: comp.breakdown,
            lastUpdated: new Date().toISOString(),
          };
        });
      }
    } catch {}

    // 3. Synthesize via LLM Provider
    const llm = new DefaultLLMProvider();
    const systemPrompt = `You are the KDP Publishing Intelligence AI Research Assistant.
You analyze real and estimated Amazon publishing data with analytical rigor.
Never guarantee profits or invent fake metrics.
Provide structured insights covering:
1. Executive Verdict & Opportunity Score
2. Search Demand & Customer Intent
3. Competitive Barrier to Entry
4. Strategic Positioning Gaps
5. Publishing Action Plan`;

    const llmResponse = await llm.generateText([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this user research request: "${prompt}". Related discovered seed: "${detectedSeed}". Available discovered keywords: ${keywords.slice(0, 5).map(k => k.term).join(', ')}.` },
    ]);

    // 4. Record token & cost usage
    CostTracker.recordUsage(
      llmResponse.model,
      llmResponse.usage.promptTokens,
      llmResponse.usage.completionTokens,
      'ai_research_assistant'
    );

    return NextResponse.json({
      prompt,
      detectedSeed,
      analysis: llmResponse.content,
      model: llmResponse.model,
      usage: llmResponse.usage,
      keywords: keywords.slice(0, 8),
      durationMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Error in AI research assistant:', error);
    return NextResponse.json({ error: 'Failed to process research prompt' }, { status: 500 });
  }
}
