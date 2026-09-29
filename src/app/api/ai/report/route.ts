import { NextRequest, NextResponse } from 'next/server';
import { NicheService } from '@/services/NicheService';
import { GapAnalysisEngine } from '@/services/GapAnalysisEngine';
import { formatNumber, formatBSR, formatCurrency } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { niche = 'Menopause Cookbook', marketplace = 'amazon.com' } = body;

    const dossier = NicheService.generateNicheDossier(niche, marketplace);
    const gaps = GapAnalysisEngine.analyzeGaps(niche);

    const reportMarkdown = `# KDP Research Intelligence Report: ${dossier.nicheName}

*Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} (Marketplace: ${marketplace})*
*Data Provenance: Analytical Estimate & Verified Amazon Suggestion Signals*

---

## 1. Executive Summary

| Metric | Value |
| :--- | :--- |
| **Market Opportunity Score** | **${dossier.opportunityScore.toFixed(1)} / 10** (${dossier.opportunityLabel}) |
| **Demand Score** | **${dossier.demandScore.toFixed(1)} / 10** |
| **Competition Score** | **${dossier.competitionScore.toFixed(1)} / 10** |
| **Estimated Monthly Market Revenue** | **${formatCurrency(dossier.marketOverview.totalEstimatedRevenue)} / mo** |
| **Median Competitor BSR** | **${formatBSR(dossier.marketOverview.medianBSR)}** |
| **Average Paperback Price** | **${formatCurrency(dossier.marketOverview.avgPrice)}** |
| **Newcomer Penetration Rate** | **${dossier.marketOverview.newcomerPenetrationPct}%** of Page 1 published in last 12 mo |

**Key Research Finding**: ${dossier.opportunityLabel}. The market shows strong ongoing reader appetite with high newcomer penetration (${dossier.marketOverview.newcomerPenetrationPct}%), making it a prime candidate for targeted sub-niche positioning.

---

## 2. Competitive Distribution & Barrier to Entry

### A. Review Count Distribution
${dossier.reviewDistribution.map(b => `- **${b.range} reviews**: ${b.count} books (${b.percentage}%)`).join('\n')}

### B. BSR (Sales Velocity) Distribution
${dossier.bsrDistribution.map(b => `- **${b.range}**: ${b.count} books (${b.percentage}%)`).join('\n')}

### C. Publication Age Breakdown
${dossier.ageDistribution.map(b => `- **${b.range}**: ${b.count} books (${b.percentage}%)`).join('\n')}

---

## 3. Top First-Page Competitor Books

${dossier.topBooks.slice(0, 5).map(b => `
### #${b.rank}. ${b.title}
- **Author**: ${b.author} | **ASIN**: \`${b.asin}\`
- **Sales Rank**: ${formatBSR(b.bsr)} (~${formatNumber(b.estimatedMonthlySales)} copies/mo • ${formatCurrency(b.estimatedMonthlyRevenue)}/mo)
- **Paperback Price**: ${formatCurrency(b.price)} | **Rating**: ★ ${b.rating.toFixed(1)} (${formatNumber(b.reviewCount)} reviews)
- **Title Match**: ${Math.round(b.titleMatchRatio * 100)}% exact/partial match
`).join('\n')}

---

## 4. Strategic Opportunity Gaps

${gaps.map(g => `
### 🎯 ${g.title} (${g.impact} Impact • Opp Score: ${g.opportunityScore.toFixed(1)})
- **Estimated Monthly Demand**: ~${formatNumber(g.estimatedMonthlyDemand)} searches/mo
- **Page 1 Competitor Coverage**: Only ${g.competitorPageOneCoverage} out of 10 books
- **Gap Analysis**: ${g.gapExplanation}
- **Recommended Positioning**: ${g.positioningRecommendation}
- **Sample Title Concept**: *"${g.sampleBookTitle}"*
`).join('\n')}

---

## 5. Publishing Risks & Compliance Guardrails

${dossier.risks.map(r => `- ⚠️ **Risk**: ${r}`).join('\n')}

---

## 6. Actionable Publishing Blueprint

1. **Target Trim Size**: 6" x 9" or 7" x 10" paperback.
2. **Page Count Target**: 160 – 220 pages to optimize printing margin.
3. **Price Strategy**: $14.99 – $16.99 (Paperback) / $4.99 – $6.99 (Kindle).
4. **Primary Keyword**: Place *"${dossier.primaryKeyword}"* at the start of the title.
5. **Backend Keywords**: Focus on non-redundant, problem-solution phrases under 50 characters each.
`;

    return NextResponse.json({
      niche,
      marketplace,
      reportMarkdown,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating research report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
