import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketScannerService, SearchMode, EnrichedMarketBook } from '@/services/market/MarketScannerService';

export async function GET(req: NextRequest) {
  try {
    const saved = await prisma.savedMarketSearch.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    const formatted = saved.map((s) => ({
      id: s.id,
      name: s.name,
      seeds: JSON.parse(s.seeds || '[]'),
      marketplace: s.marketplace,
      filters: JSON.parse(s.filters || '{}'),
      mode: s.mode,
      resultCount: s.resultCount,
      overview: s.overviewSnapshot ? JSON.parse(s.overviewSnapshot) : null,
      lastRun: s.lastRun,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ success: true, savedSearches: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, seeds, marketplace = 'amazon.com', filters = {}, mode = 'QUICK_SEARCH', overview, books = [] } = body;

    if (!name || !seeds || seeds.length === 0) {
      return NextResponse.json({ error: 'Name and at least one seed are required.' }, { status: 400 });
    }

    const saved = await prisma.savedMarketSearch.create({
      data: {
        name,
        seeds: JSON.stringify(seeds),
        marketplace,
        filters: JSON.stringify(filters),
        mode,
        resultCount: books.length,
        overviewSnapshot: overview ? JSON.stringify(overview) : null,
        resultsSnapshot: books.length > 0 ? JSON.stringify(books.slice(0, 100)) : null,
      },
    });

    return NextResponse.json({ success: true, savedSearch: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Saved search ID is required.' }, { status: 400 });
    }

    const existing = await prisma.savedMarketSearch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Saved search not found.' }, { status: 404 });
    }

    const seeds: string[] = JSON.parse(existing.seeds);
    const filters = JSON.parse(existing.filters);
    const mode = existing.mode as SearchMode;
    const oldBooks: EnrichedMarketBook[] = existing.resultsSnapshot ? JSON.parse(existing.resultsSnapshot) : [];

    // Re-run scan
    const newScan = await MarketScannerService.executeScan(seeds, mode, filters);
    const newBooks = newScan.books;

    // Calculate delta changes
    const oldAsinMap = new Map(oldBooks.map((b) => [b.asin, b]));
    const newAsinMap = new Map(newBooks.map((b) => [b.asin, b]));

    const newEntrants = newBooks.filter((b) => !oldAsinMap.has(b.asin));
    const removedBooks = oldBooks.filter((b) => !newAsinMap.has(b.asin));

    const bsrChanges: Array<{ asin: string; title: string; oldBSR: number; newBSR: number; diff: number }> = [];
    const reviewGrowths: Array<{ asin: string; title: string; oldReviews: number; newReviews: number; diff: number }> = [];

    for (const nb of newBooks) {
      const ob = oldAsinMap.get(nb.asin);
      if (ob) {
        if (nb.bsr !== ob.bsr) {
          bsrChanges.push({ asin: nb.asin, title: nb.title, oldBSR: ob.bsr, newBSR: nb.bsr, diff: ob.bsr - nb.bsr });
        }
        if (nb.reviewCount > ob.reviewCount) {
          reviewGrowths.push({ asin: nb.asin, title: nb.title, oldReviews: ob.reviewCount, newReviews: nb.reviewCount, diff: nb.reviewCount - ob.reviewCount });
        }
      }
    }

    // Update database record
    await prisma.savedMarketSearch.update({
      where: { id },
      data: {
        resultCount: newBooks.length,
        overviewSnapshot: JSON.stringify(newScan.overview),
        resultsSnapshot: JSON.stringify(newBooks.slice(0, 100)),
        lastRun: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      delta: {
        newEntrantsCount: newEntrants.length,
        removedBooksCount: removedBooks.length,
        newEntrants: newEntrants.slice(0, 10),
        bsrChanges: bsrChanges.slice(0, 10),
        reviewGrowths: reviewGrowths.slice(0, 10),
      },
      newScan,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
