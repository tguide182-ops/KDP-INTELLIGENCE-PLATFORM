export interface QualityRuleConfig {
  emDashLimitPer1kWords: number; // e.g. 2 per 1,000 words
  maxBulletRatio: number;        // e.g. 0.20 (20% of lines/sentences)
  forbiddenPhrases?: string[];
  genre?: string;
  readingLevel?: string;
}

export interface QualityIssue {
  type: 'EM_DASH_OVERUSE' | 'EXCESSIVE_BULLETS' | 'GENERIC_AI_PHRASE' | 'REPETITION' | 'TONE_DRIFT';
  severity: 'CRITICAL' | 'WARNING' | 'SUGGESTION';
  message: string;
  snippet?: string;
  recommendation: string;
}

export interface QualityReport {
  overallScore: number; // 0 to 100
  passed: boolean;
  wordCount: number;
  emDashStats: {
    totalCount: number;
    countPer1k: number;
    limit: number;
  };
  bulletStats: {
    bulletCount: number;
    totalParagraphs: number;
    bulletRatioPct: number;
    maxAllowedPct: number;
  };
  detectedAIPhrases: {
    phrase: string;
    count: number;
  }[];
  issues: QualityIssue[];
  recommendations: string[];
}

export const DEFAULT_FORBIDDEN_AI_PHRASES = [
  "in today's fast-paced world",
  "in today's digital age",
  "whether you're a beginner or",
  "it's important to note",
  "it is important to note",
  "it's worth noting",
  "let's dive in",
  "let's delve into",
  "in conclusion",
  "this comprehensive guide",
  "a testament to",
  "a tapestry of",
  "a game changer",
  "look no further",
  "without further ado",
  "embark on a journey",
  "beacon of hope",
  "delve deeper",
  "unlock the secrets",
  "supercharge your",
  "crucial to remember",
  "navigating the complexities",
  "in summary, we have seen",
];

export class WritingQualityEngine {
  /**
   * Run comprehensive editorial quality audit on a manuscript or chapter text
   */
  static analyzeText(
    text: string,
    config: Partial<QualityRuleConfig> = {}
  ): QualityReport {
    const emDashLimit = config.emDashLimitPer1kWords ?? 2;
    const maxBulletRatio = config.maxBulletRatio ?? 0.20;
    const forbiddenList = config.forbiddenPhrases || DEFAULT_FORBIDDEN_AI_PHRASES;

    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length || 1;

    // 1. Em Dash Analysis (detects —, --, &mdash;)
    const emDashMatches = text.match(/—|--|&mdash;/g) || [];
    const emDashCount = emDashMatches.length;
    const emDashPer1k = Number(((emDashCount / wordCount) * 1000).toFixed(2));

    // 2. Bullet / List Ratio Analysis
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const totalLines = lines.length || 1;
    const bulletLines = lines.filter((l) => /^[-*•]\s+|^\d+\.\s+/.test(l));
    const bulletCount = bulletLines.length;
    const bulletRatio = bulletCount / totalLines;
    const bulletRatioPct = Math.round(bulletRatio * 100);
    const maxAllowedPct = Math.round(maxBulletRatio * 100);

    // 3. Generic AI Cliché Phrase Analysis
    const textLower = text.toLowerCase();
    const detectedAIPhrases: { phrase: string; count: number }[] = [];

    for (const phrase of forbiddenList) {
      const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches && matches.length > 0) {
        detectedAIPhrases.push({
          phrase,
          count: matches.length,
        });
      }
    }

    // 4. Repetitive Openers Analysis (e.g. 3+ sentences starting with "This" or "It is")
    const sentenceStarters = lines
      .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter((l) => l.length > 10)
      .map((l) => l.split(' ').slice(0, 2).join(' ').toLowerCase());

    const starterCounts: Record<string, number> = {};
    sentenceStarters.forEach((st) => {
      if (st) starterCounts[st] = (starterCounts[st] || 0) + 1;
    });

    const issues: QualityIssue[] = [];

    // Evaluate Em Dash Rule
    if (emDashPer1k > emDashLimit) {
      issues.push({
        type: 'EM_DASH_OVERUSE',
        severity: emDashPer1k > emDashLimit * 2 ? 'CRITICAL' : 'WARNING',
        message: `Em dash frequency (${emDashPer1k}/1k words) exceeds limit of ${emDashLimit}/1k.`,
        recommendation: 'Replace excessive em dashes with commas, periods, colons, or parentheses.',
      });
    }

    // Evaluate Bullet Overuse Rule
    if (bulletRatio > maxBulletRatio) {
      issues.push({
        type: 'EXCESSIVE_BULLETS',
        severity: bulletRatio > maxBulletRatio * 1.5 ? 'CRITICAL' : 'WARNING',
        message: `Bullet points account for ${bulletRatioPct}% of the text (max allowed is ${maxAllowedPct}%).`,
        recommendation: 'Convert bullet lists into coherent, structured narrative prose. Reserve lists strictly for actionable checklists or ingredients.',
      });
    }

    // Evaluate Generic AI Phrases Rule
    if (detectedAIPhrases.length > 0) {
      const totalPhraseCount = detectedAIPhrases.reduce((acc, p) => acc + p.count, 0);
      issues.push({
        type: 'GENERIC_AI_PHRASE',
        severity: totalPhraseCount > 3 ? 'CRITICAL' : 'WARNING',
        message: `Found ${totalPhraseCount} occurrences of generic AI clichés (${detectedAIPhrases.map((p) => `"${p.phrase}"`).join(', ')}).`,
        recommendation: 'Rewrite clichés with concrete, specific, voice-driven explanations.',
      });
    }

    // Evaluate Repetition
    Object.entries(starterCounts).forEach(([starter, count]) => {
      if (count >= 4) {
        issues.push({
          type: 'REPETITION',
          severity: 'WARNING',
          message: `Repetitive sentence opening: "${starter}" starts ${count} paragraphs/sentences.`,
          recommendation: 'Vary sentence structures and rhythmic cadence.',
        });
      }
    });

    // Compute Overall Editorial Score (0 to 100)
    let score = 100;
    for (const issue of issues) {
      if (issue.severity === 'CRITICAL') score -= 20;
      else if (issue.severity === 'WARNING') score -= 10;
      else score -= 5;
    }
    score = Math.max(20, Math.min(100, score));

    const recommendations: string[] = [];
    if (emDashPer1k > emDashLimit) {
      recommendations.push(`Reduce em dash frequency from ${emDashPer1k}/1k to under ${emDashLimit}/1k.`);
    }
    if (bulletRatio > maxBulletRatio) {
      recommendations.push(`Synthesize bullet points into paragraphs to avoid looking like AI meeting notes.`);
    }
    if (detectedAIPhrases.length > 0) {
      recommendations.push(`Eliminate AI clichés like ${detectedAIPhrases.slice(0, 3).map((p) => `"${p.phrase}"`).join(', ')}.`);
    }
    if (recommendations.length === 0) {
      recommendations.push('Text meets all professional manuscript quality thresholds.');
    }

    return {
      overallScore: score,
      passed: score >= 75 && !issues.some((i) => i.severity === 'CRITICAL'),
      wordCount,
      emDashStats: {
        totalCount: emDashCount,
        countPer1k: emDashPer1k,
        limit: emDashLimit,
      },
      bulletStats: {
        bulletCount,
        totalParagraphs: totalLines,
        bulletRatioPct,
        maxAllowedPct,
      },
      detectedAIPhrases,
      issues,
      recommendations,
    };
  }
}
