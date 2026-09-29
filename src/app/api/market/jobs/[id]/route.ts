import { NextRequest, NextResponse } from 'next/server';
import { JobQueue } from '@/services/jobs/JobQueue';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = JobQueue.getJob(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        stage: job.stage,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        result: job.result,
        error: job.error,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const job = JobQueue.getJob(id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (action === 'pause') {
      const ok = JobQueue.pauseJob(id);
      return NextResponse.json({ success: ok, status: 'PAUSED', message: 'Job paused' });
    }

    if (action === 'resume') {
      const ok = JobQueue.resumeJob(id);
      return NextResponse.json({ success: ok, status: 'RUNNING', message: 'Job resumed' });
    }

    if (action === 'cancel') {
      const ok = JobQueue.cancelJob(id);
      return NextResponse.json({ success: ok, status: 'CANCELLED', message: 'Job cancelled' });
    }

    return NextResponse.json({ error: `Unsupported action "${action}"` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
