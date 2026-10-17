// ============================================================
// COURTLY — HTTP Performance Service
// ============================================================

import { apiFetch } from './client';
import {
  adaptSessionReportToPerformanceReport,
  type BackendLevelItem,
  type BackendSessionReportResponse,
} from './adapters';
import type { PerformanceService } from '../interfaces';
import type { PerformanceReport } from '@/types';

export interface BackendLevelProgressItem {
  level_number: number;
  level: number;
  status: string;
  best_score: number | null;
  attempts: number;
}

export interface BackendOverallProgress {
  levels_passed: number;
  certificate_eligible: boolean;
}

export interface BackendUserProgress {
  levels: BackendLevelProgressItem[];
  overall: BackendOverallProgress;
}

export class HttpPerformanceService implements PerformanceService {
  async getProgress(): Promise<BackendUserProgress> {
    return apiFetch<BackendUserProgress>('/api/v1/me/progress');
  }

  async getLevels(): Promise<BackendLevelItem[]> {
    return apiFetch<BackendLevelItem[]>('/api/v1/levels');
  }

  async getReport(sessionId: string): Promise<PerformanceReport | null> {
    try {
      const data = await apiFetch<BackendSessionReportResponse>(`/api/v1/sessions/${sessionId}/report`);
      return adaptSessionReportToPerformanceReport(data, sessionId);
    } catch {
      return null;
    }
  }

  async getUserReports(userId: string): Promise<PerformanceReport[]> {
    return [];
  }

  async getAggregateStats(userId: string): Promise<{
    completedSimulations: number;
    totalHours: number;
    averageScore: number;
    skillAverages: Record<string, number>;
  }> {
    try {
      const progress = await this.getProgress();
      const passedCount = progress.overall.levels_passed;
      const validScores = progress.levels
        .map((l) => l.best_score)
        .filter((s): s is number => typeof s === 'number');

      const avgScore = validScores.length
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : 0;

      const skillAverages: Record<string, number> = {
        'Legal Reasoning': avgScore,
        'Oral Advocacy': avgScore,
        'Evidence Handling': avgScore,
        'Procedural Compliance': avgScore,
      };

      return {
        completedSimulations: passedCount,
        totalHours: Number((passedCount * 0.75).toFixed(1)),
        averageScore: avgScore,
        skillAverages,
      };
    } catch {
      return {
        completedSimulations: 0,
        totalHours: 0,
        averageScore: 0,
        skillAverages: {},
      };
    }
  }
}

export const httpPerformanceService = new HttpPerformanceService();
