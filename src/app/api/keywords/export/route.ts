import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { KeywordItem } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, format = 'xlsx', filename = 'kdp-keywords-export' } = body as {
      keywords: KeywordItem[];
      format: 'xlsx' | 'csv' | 'json';
      filename?: string;
    };

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json({ error: 'Keywords array is required' }, { status: 400 });
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify(keywords, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      });
    }

    // Flatten keywords into clean table records
    const rows = keywords.map(kw => ({
      'Keyword': kw.term,
      'Marketplace': kw.marketplace,
      'Estimated Monthly Searches': kw.estimatedMonthlyVol,
      'Confidence': kw.confidenceLevel,
      'Volume Trend': kw.volumeTrend.toUpperCase(),
      'Amazon Results Count': kw.amazonResultCount,
      'Demand Score': kw.demandScore,
      'Competition Score': kw.competitionScore,
      'Opportunity Score': kw.opportunityScore,
      'Commercial Intent': kw.intent,
      'Phrase Type': kw.phraseType,
      'Word Count': kw.wordCount,
      'Data Source': kw.dataSource,
      'Parent Keyword': kw.parentKeyword || '',
      'Last Updated': kw.lastUpdated,
    }));

    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      return new NextResponse(csvOutput, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // Generate formatted Excel Workbook (.xlsx)
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set readable column widths
    worksheet['!cols'] = [
      { wch: 36 }, // Keyword
      { wch: 15 }, // Marketplace
      { wch: 24 }, // Est Monthly Searches
      { wch: 12 }, // Confidence
      { wch: 14 }, // Volume Trend
      { wch: 22 }, // Amazon Results Count
      { wch: 14 }, // Demand Score
      { wch: 16 }, // Competition Score
      { wch: 16 }, // Opportunity Score
      { wch: 18 }, // Intent
      { wch: 14 }, // Phrase Type
      { wch: 12 }, // Word Count
      { wch: 14 }, // Data Source
      { wch: 24 }, // Parent Keyword
      { wch: 22 }, // Last Updated
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'KDP Keywords');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to generate export file' }, { status: 500 });
  }
}
