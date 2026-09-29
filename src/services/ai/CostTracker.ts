export interface UsageRecord {
  id: string;
  timestamp: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUSD: number;
  jobId?: string;
  feature: string;
}

export class CostTracker {
  private static records: UsageRecord[] = [];

  static recordUsage(
    model: string,
    promptTokens: number,
    completionTokens: number,
    feature: string,
    jobId?: string
  ): UsageRecord {
    // Standard blended pricing benchmark ($1.25/1M in, $5.00/1M out)
    const cost = (promptTokens * 0.00000125) + (completionTokens * 0.000005);
    const record: UsageRecord = {
      id: `usage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      model,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      estimatedCostUSD: Math.round(cost * 100000) / 100000,
      jobId,
      feature,
    };

    this.records.push(record);
    return record;
  }

  static getTotalSpend(): { totalTokens: number; totalCostUSD: number; recordCount: number } {
    const totalTokens = this.records.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCostUSD = this.records.reduce((sum, r) => sum + r.estimatedCostUSD, 0);
    return {
      totalTokens,
      totalCostUSD: Math.round(totalCostUSD * 1000) / 1000,
      recordCount: this.records.length,
    };
  }

  static getRecentRecords(limit: number = 20): UsageRecord[] {
    return [...this.records].reverse().slice(0, limit);
  }
}
