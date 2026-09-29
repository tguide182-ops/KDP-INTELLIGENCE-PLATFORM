export type JobType = 'RESEARCH_JOB' | 'REPORT_JOB' | 'BOOK_JOB' | 'TRANSLATION_JOB';
export type JobStatus = 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface BackgroundJob {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0 to 100
  stage: string;
  payload: Record<string, any>;
  result?: Record<string, any>;
  scanState?: Record<string, any>;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export class JobQueue {
  private static jobs: Map<string, BackgroundJob> = new Map();

  static createJob(type: JobType, payload: Record<string, any>): BackgroundJob {
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const job: BackgroundJob = {
      id,
      type,
      status: 'PENDING',
      progress: 0,
      stage: 'Queued',
      payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.jobs.set(id, job);
    return job;
  }

  static getJob(id: string): BackgroundJob | undefined {
    return this.jobs.get(id);
  }

  static updateJob(
    id: string,
    updates: Partial<Pick<BackgroundJob, 'status' | 'progress' | 'stage' | 'result' | 'scanState' | 'error'>>
  ): BackgroundJob | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updatedJob: BackgroundJob = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  static pauseJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job || job.status !== 'RUNNING') return false;
    job.status = 'PAUSED';
    job.stage = 'Paused by user';
    job.updatedAt = new Date().toISOString();
    return true;
  }

  static resumeJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job || job.status !== 'PAUSED') return false;
    job.status = 'RUNNING';
    job.stage = 'Resuming scan';
    job.updatedAt = new Date().toISOString();
    return true;
  }

  static cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;
    job.status = 'CANCELLED';
    job.stage = 'Cancelled by user';
    job.updatedAt = new Date().toISOString();
    return true;
  }

  static listJobs(limit: number = 20): BackgroundJob[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

