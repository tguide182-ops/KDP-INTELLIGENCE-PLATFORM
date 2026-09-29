import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlueprintService } from '@/services/BlueprintService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where: any = {};
    if (projectId) where.projectId = projectId;

    const books = await prisma.bookProject.findMany({
      where,
      include: {
        blueprint: true,
        _count: {
          select: { chapters: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error fetching book projects:', error);
    return NextResponse.json({ error: 'Failed to fetch book projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      title = 'Untitled KDP Book Project',
      subtitle = '',
      targetAudience = 'General Non-Fiction Readers',
      coreBenefit = 'Step-by-step transformation and actionable guidance',
      primaryKeyword = 'KDP Publishing Guide',
      secondaryKeywords = [],
      niche = 'Publishing & Writing',
      targetWordCount = 25000,
      targetPageCount = 140,
      trimSize = '6x9',
      paperType = 'white',
      marketplace = 'amazon.com',
      autoGenerateBlueprint = true,
    } = body;

    // Generate structured blueprint outline
    const generated = autoGenerateBlueprint
      ? BlueprintService.generateBlueprintFromResearch({
          niche,
          primaryKeyword,
          secondaryKeywords,
          targetAudience,
          coreBenefit,
          title,
          subtitle,
          targetWordCount,
          trimSize,
          paperType,
        })
      : null;

    // Save to database in a transaction
    const newBook = await prisma.$transaction(async (tx) => {
      const book = await tx.bookProject.create({
        data: {
          projectId: projectId || null,
          title,
          subtitle,
          targetAudience,
          coreBenefit,
          primaryKeyword,
          secondaryKeywords: JSON.stringify(secondaryKeywords),
          niche,
          targetWordCount,
          targetPageCount: generated ? generated.estimatedPages : targetPageCount,
          trimSize,
          paperType,
          status: generated ? 'BLUEPRINT_READY' : 'CONCEPT',
          marketplace,
        },
      });

      if (generated) {
        // Create Blueprint
        await tx.blueprint.create({
          data: {
            bookProjectId: book.id,
            thesis: generated.thesis,
            targetReaderProfile: generated.targetReaderProfile,
            toneAndStyle: generated.toneAndStyle,
            structureType: generated.structureType,
            totalChapters: generated.totalChapters,
            estimatedPages: generated.estimatedPages,
            estimatedReadingTimeMin: generated.estimatedReadingTimeMin,
            keywordCoverage: JSON.stringify(generated.keywordCoverage),
          },
        });

        // Create Chapters and Sections
        for (const ch of generated.chapters) {
          const chapter = await tx.chapter.create({
            data: {
              bookProjectId: book.id,
              orderIndex: ch.orderIndex,
              chapterNumber: ch.chapterNumber,
              type: ch.type,
              title: ch.title,
              subtitle: ch.subtitle || null,
              targetWordCount: ch.targetWordCount,
              purpose: ch.purpose,
              assignedKeywords: JSON.stringify(ch.assignedKeywords),
            },
          });

          for (const sec of ch.sections) {
            await tx.section.create({
              data: {
                chapterId: chapter.id,
                orderIndex: sec.orderIndex,
                title: sec.title,
                targetWordCount: sec.targetWordCount,
                summary: sec.summary,
                keyPoints: JSON.stringify(sec.keyPoints),
              },
            });
          }
        }
      }

      return book;
    });

    // Fetch the full created project with relations
    const fullProject = await prisma.bookProject.findUnique({
      where: { id: newBook.id },
      include: {
        blueprint: true,
        chapters: {
          include: { sections: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return NextResponse.json({ book: fullProject }, { status: 201 });
  } catch (error) {
    console.error('Error creating book project:', error);
    return NextResponse.json({ error: 'Failed to create book project' }, { status: 500 });
  }
}
