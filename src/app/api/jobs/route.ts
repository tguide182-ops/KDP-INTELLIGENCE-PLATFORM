import { NextRequest, NextResponse } from 'next/server';
import { JobQueue } from '@/services/jobs/JobQueue';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('id');

  if (jobId) {
    const job = JobQueue.getJob(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ job });
  }

  const jobs = JobQueue.listJobs();
  return NextResponse.json({ jobs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'RESEARCH_JOB', payload = {} } = body;

    const job = JobQueue.createJob(type, payload);
    return NextResponse.json({ job }, { status: 202 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
