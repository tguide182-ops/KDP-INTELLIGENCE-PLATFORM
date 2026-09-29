import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { EnrichedMarketBook } from '@/services/market/MarketScannerService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { books = [], format = 'xlsx', filename = 'market_research_export' } = body;

    if (!Array.isArray(books) || books.length === 0) {
      return NextResponse.json({ error: 'No books provided for export.' }, { status: 400 });
    }

    // Format all 24 required columns
    const exportRows = books.map((b: EnrichedMarketBook, index: number) => ({
      Rank: index + 1,
      ASIN: b.asin,
      Title: b.title,
      Subtitle: b.subtitle || '',
      Author: b.author,
      Publisher: b.publisher,
      'KDP Inferred': b.isIndependentKDP ? 'Yes (Independent)' : 'No (Traditional)',
      Reviews: b.reviewCount,
      Rating: b.rating,
      BSR: b.bsr,
      Price: b.price,
      Currency: b.currency,
      Pages: b.pages,
      'Publication Date': b.publicationDate,
      'Book Age': b.bookAge,
      Format: b.format,
      Language: b.language,
      Categories: Array.isArray(b.categories) ? b.categories.join(' > ') : '',
      'Found Via': Array.isArray(b.foundVia) ? b.foundVia.join(', ') : '',
      'Est. Monthly Sales': b.estimatedMonthlySales,
      'Est. Monthly Revenue': `$${b.estimatedMonthlyRevenue}`,
      'Data Source': b.dataSource,
      'Data Timestamp': b.timestamp,
    }));

    if (format === 'json') {
      return new NextResponse(JSON.stringify(exportRows, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      });
    }

    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // Default: XLSX
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Market Research');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('[API /market/export] Error:', error);
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}
