import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || undefined;

    const saved = await prisma.savedKeyword.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        keyword: {
          include: {
            metrics: {
              orderBy: { lastUpdated: 'desc' },
              take: 1,
            },
          },
        },
        project: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ saved });
  } catch (error) {
    console.error('Error fetching saved keywords:', error);
    return NextResponse.json({ saved: [], error: 'Failed to fetch saved keywords' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, projectId, status, notes, starred, tags } = body;

    if (!keyword || !keyword.term) {
      return NextResponse.json({ error: 'Keyword data is required' }, { status: 400 });
    }

    // Upsert keyword record
    const upsertedKeyword = await prisma.keyword.upsert({
      where: { normalizedTerm: keyword.normalizedTerm || keyword.term.toLowerCase() },
      update: {
        wordCount: keyword.wordCount || keyword.term.split(/\s+/).length,
        intent: keyword.intent || 'commercial',
      },
      create: {
        term: keyword.term,
        normalizedTerm: keyword.normalizedTerm || keyword.term.toLowerCase(),
        marketplace: keyword.marketplace || 'amazon.com',
        phraseType: keyword.phraseType || 'suggestion',
        wordCount: keyword.wordCount || keyword.term.split(/\s+/).length,
        intent: keyword.intent || 'commercial',
        parentKeyword: keyword.parentKeyword,
      },
    });

    // Create or update keyword metric
    await prisma.keywordMetric.create({
      data: {
        keywordId: upsertedKeyword.id,
        estimatedMonthlyVol: keyword.estimatedMonthlyVol || 100,
        volumeTrend: keyword.volumeTrend || 'stable',
        amazonResultCount: keyword.amazonResultCount || 500,
        confidenceLevel: keyword.confidenceLevel || 'MEDIUM',
        dataSource: keyword.dataSource || 'ESTIMATED',
        demandScore: keyword.demandScore || 5.0,
        competitionScore: keyword.competitionScore || 5.0,
        opportunityScore: keyword.opportunityScore || 5.0,
        demandBreakdown: JSON.stringify(keyword.demandBreakdown || {}),
        competitionBreakdown: JSON.stringify(keyword.competitionBreakdown || {}),
      },
    });

    // Upsert saved keyword
    const saved = await prisma.savedKeyword.upsert({
      where: {
        projectId_keywordId: {
          projectId: projectId || null,
          keywordId: upsertedKeyword.id,
        },
      },
      update: {
        status: status || 'Researching',
        notes: notes || undefined,
        starred: starred !== undefined ? starred : undefined,
        tags: tags ? JSON.stringify(tags) : undefined,
      },
      create: {
        projectId: projectId || null,
        keywordId: upsertedKeyword.id,
        status: status || 'Researching',
        notes: notes || null,
        starred: starred || false,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    return NextResponse.json({ success: true, saved });
  } catch (error) {
    console.error('Error saving keyword:', error);
    return NextResponse.json({ error: 'Failed to save keyword' }, { status: 500 });
  }
}
