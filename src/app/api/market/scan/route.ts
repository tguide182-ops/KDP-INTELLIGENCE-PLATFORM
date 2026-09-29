import { NextRequest, NextResponse } from 'next/server';
import { MarketScannerService, SearchMode, MarketFilterOptions } from '@/services/market/MarketScannerService';
import { JobQueue } from '@/services/jobs/JobQueue';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seeds, mode = 'QUICK_SEARCH', filters = {} } = body;

    if (!seeds || !Array.isArray(seeds) || seeds.length === 0) {
      return NextResponse.json(
        { error: 'At least one seed keyword is required.' },
        { status: 400 }
      );
    }

    const searchMode: SearchMode = mode;
    const filterOptions: MarketFilterOptions = filters;

    // Quick Search runs synchronously for immediate UI feedback
    if (searchMode === 'QUICK_SEARCH') {
      const result = await MarketScannerService.executeScan(seeds, 'QUICK_SEARCH', filterOptions);
      return NextResponse.json({
        success: true,
        mode: 'QUICK_SEARCH',
        result,
      });
    }

    // Deep Search & Market Scan run via Background Job Queue
    const job = JobQueue.createJob('RESEARCH_JOB', {
      seeds,
      mode: searchMode,
      filters: filterOptions,
    });

    // Start background worker
    (async () => {
      try {
        JobQueue.updateJob(job.id, { status: 'RUNNING', stage: 'Preparing queries', progress: 5 });

        const result = await MarketScannerService.executeScan(
          seeds,
          searchMode,
          filterOptions,
          (stage, progress) => {
            const currentJob = JobQueue.getJob(job.id);
            if (currentJob && currentJob.status === 'CANCELLED') {
              throw new Error('Scan cancelled by user');
            }
            JobQueue.updateJob(job.id, { stage, progress });
          }
        );

        JobQueue.updateJob(job.id, {
          status: 'COMPLETED',
          progress: 100,
          stage: 'Completed',
          result,
        });
      } catch (err: any) {
        if (err.message === 'Scan cancelled by user') {
          JobQueue.updateJob(job.id, { status: 'CANCELLED', stage: 'Cancelled by user' });
        } else {
          JobQueue.updateJob(job.id, {
            status: 'FAILED',
            stage: 'Failed',
            error: err.message || 'Unknown scan error',
          });
        }
      }
    })();

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: 'PENDING',
      message: `${searchMode} launched. Monitor progress at /api/market/jobs/${job.id}`,
    });
  } catch (error: any) {
    console.error('[API /market/scan] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute market scan' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seed = searchParams.get('seed') || 'senior sudoku';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);
    const marketplace = searchParams.get('marketplace') || 'amazon.com';

    const result = await MarketScannerService.executeScan([seed], 'QUICK_SEARCH', {
      marketplace,
      targetResults: pageSize,
    });

    const start = (page - 1) * pageSize;
    const paginatedBooks = result.books.slice(start, start + pageSize);

    return NextResponse.json({
      success: true,
      books: paginatedBooks,
      overview: result.overview,
      page,
      pageSize,
      totalResults: result.overview.searchCoverage.matchingBooksCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
