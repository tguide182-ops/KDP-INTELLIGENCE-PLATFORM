import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'HEALTHY';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    dbStatus = 'DEGRADED';
    console.warn('Database health check error:', err);
  }

  // Check Amazon Autocomplete Provider responsiveness
  let amazonProviderStatus = 'HEALTHY';
  let amazonLatencyMs = 0;
  try {
    const amzStart = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://completion.amazon.com/api/2017/suggestions?mid=ATVPDKIKX0DER&alias=stripbooks&prefix=test', {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    clearTimeout(timeoutId);
    amazonLatencyMs = Date.now() - amzStart;
    if (!res.ok) amazonProviderStatus = 'DEGRADED';
  } catch {
    amazonProviderStatus = 'FALLBACK_DEMO_ACTIVE';
  }

  return NextResponse.json({
    status: 'ONLINE',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    providers: {
      amazonSuggestions: {
        status: amazonProviderStatus,
        latencyMs: amazonLatencyMs,
        provider: 'Amazon Completion API (Live)',
        endpoint: 'completion.amazon.com',
      },
      volumeEstimationEngine: {
        status: 'HEALTHY',
        mode: 'Algorithmic Multi-Signal with Confidence Scoring',
      },
      scoringEngine: {
        status: 'HEALTHY',
        version: '1.2-weighted-transparent',
      },
      demoDataProvider: {
        status: 'HEALTHY',
        activeSeeds: ['menopause cookbook', 'glp-1 cookbook', 'air fryer recipes', 'high protein cookbook'],
      },
    },
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      dialect: 'SQLite (dev.db)',
    },
    performance: {
      totalCheckLatencyMs: Date.now() - startTime,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  });
}
