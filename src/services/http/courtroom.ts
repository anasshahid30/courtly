// ============================================================
// COURTLY — HTTP Courtroom Service
// ============================================================

import { apiFetch } from './client';
import {
  adaptSessionToSimulationSession,
  adaptTurnToTranscriptEntry,
  adaptObjectionToJudicialRuling,
  adaptSessionReportToPerformanceReport,
  type BackendSessionResponse,
  type BackendTurnResponse,
  type BackendObjectionResponse,
  type BackendSessionReportResponse,
} from './adapters';
import type { CourtroomService } from '../interfaces';
import type {
  JudicialRuling,
  PerformanceReport,
  SimulationSession,
  TranscriptEntry,
} from '@/types';

interface BackendStageAdvanceResponse {
  current_stage: number;
  stage: number;
}

interface BackendPresentedEvidenceResponse {
  id: number;
  session_id: number;
  evidence_id: string;
  title: string;
  presented_at: string;
}

export class HttpCourtroomService implements CourtroomService {
  async createSession(
    simulationId: string,
    role?: string,
    difficulty?: string
  ): Promise<SimulationSession> {
    const data = await apiFetch<BackendSessionResponse>('/api/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ case_slug: simulationId }),
    });

    return adaptSessionToSimulationSession(data, role, difficulty);
  }

  async getSession(sessionId: string): Promise<SimulationSession | null> {
    try {
      const data = await apiFetch<BackendSessionResponse>(`/api/v1/sessions/${sessionId}`);
      return adaptSessionToSimulationSession(data);
    } catch {
      return null;
    }
  }

  async postTurn(sessionId: string, text: string): Promise<TranscriptEntry> {
    const data = await apiFetch<BackendTurnResponse>(`/api/v1/sessions/${sessionId}/turns`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });

    return adaptTurnToTranscriptEntry(data);
  }

  async getTranscript(sessionId: string): Promise<TranscriptEntry[]> {
    const list = await apiFetch<BackendTurnResponse[]>(`/api/v1/sessions/${sessionId}/turns`);
    return list.map(adaptTurnToTranscriptEntry);
  }

  async submitObjection(
    sessionId: string,
    objectionType: string,
    grounds: string,
    turnId?: number
  ): Promise<JudicialRuling> {
    if (!turnId) {
      throw new Error('A persisted courtroom turn ID is required to raise an objection.');
    }

    const data = await apiFetch<BackendObjectionResponse>(
      `/api/v1/sessions/${sessionId}/objections`,
      {
        method: 'POST',
        body: JSON.stringify({
          turn_id: turnId,
          objection_type: objectionType,
          grounds,
        }),
      }
    );

    return adaptObjectionToJudicialRuling(data);
  }

  async getObjections(sessionId: string): Promise<JudicialRuling[]> {
    const list = await apiFetch<BackendObjectionResponse[]>(
      `/api/v1/sessions/${sessionId}/objections`
    );
    return list.map(adaptObjectionToJudicialRuling);
  }

  async advanceStage(sessionId: string): Promise<BackendStageAdvanceResponse> {
    return apiFetch<BackendStageAdvanceResponse>(`/api/v1/sessions/${sessionId}/advance`, {
      method: 'POST',
    });
  }

  async getReport(sessionId: string): Promise<PerformanceReport | null> {
    try {
      const data = await apiFetch<BackendSessionReportResponse>(`/api/v1/sessions/${sessionId}/report`);
      return adaptSessionReportToPerformanceReport(data, sessionId);
    } catch {
      return null;
    }
  }

  async tenderEvidence(sessionId: string, evidenceId: string): Promise<boolean> {
    await apiFetch<BackendPresentedEvidenceResponse>(
      `/api/v1/sessions/${sessionId}/evidence`,
      {
        method: 'POST',
        body: JSON.stringify({ evidence_id: evidenceId }),
      }
    );
    return true;
  }

  async getPresentedEvidence(sessionId: string): Promise<string[]> {
    const list = await apiFetch<BackendPresentedEvidenceResponse[]>(
      `/api/v1/sessions/${sessionId}/evidence`
    );
    return list.map((item) => item.evidence_id);
  }

  async recordTranscript(
    sessionId: string,
    entry: Omit<TranscriptEntry, 'id' | 'timestamp'>
  ): Promise<TranscriptEntry> {
    return this.postTurn(sessionId, entry.text);
  }

  async completeSession(sessionId: string, scores?: unknown): Promise<PerformanceReport> {
    if (scores) {
      await apiFetch(`/api/v1/sessions/${sessionId}/complete`, {
        method: 'POST',
        body: JSON.stringify(scores),
      });
    }

    const report = await this.getReport(sessionId);
    if (!report) {
      throw new Error(`Report not available yet for session ${sessionId}`);
    }
    return report;
  }
}

export const httpCourtroomService = new HttpCourtroomService();
