// ============================================================
// COURTLY — Service Interfaces
// ============================================================

import type {
  User, StudentProfile, EducatorProfile, Simulation, SimulationSession,
  TranscriptEntry, Objection, JudicialRuling, EvidenceItem, CaseFile,
  LegalDocument, LegalCitation, ResearchSession, ResearchMessage,
  PerformanceReport, LegalDomain, Jurisdiction, Notification, CertificateRecord
} from '@/types';

export interface AuthService {
  getCurrentUser(): Promise<StudentProfile | null>;
  login(credentials: { email: string; password?: string }): Promise<StudentProfile>;
  register(data: Partial<StudentProfile> & { password?: string }): Promise<StudentProfile>;
  logout(): Promise<void>;
  updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile>;
}

export interface SimulationService {
  getDomains(): Promise<LegalDomain[]>;
  getJurisdictions(): Promise<Jurisdiction[]>;
  getSimulations(filters?: { domain?: string; difficulty?: string; search?: string }): Promise<Simulation[]>;
  getSimulationById(id: string): Promise<Simulation | null>;
  getCaseFile(simulationId: string): Promise<CaseFile | null>;
}

export interface CourtroomService {
  createSession(simulationId: string, role?: string, difficulty?: string): Promise<SimulationSession>;
  getSession(sessionId: string): Promise<SimulationSession | null>;
  submitObjection(sessionId: string, objectionType: string, grounds: string, turnId?: number): Promise<JudicialRuling>;
  tenderEvidence(sessionId: string, evidenceId: string): Promise<boolean>;
  recordTranscript(sessionId: string, entry: Omit<TranscriptEntry, 'id' | 'timestamp'>): Promise<TranscriptEntry>;
  completeSession(sessionId: string, scores?: unknown): Promise<PerformanceReport>;
  postTurn?(sessionId: string, text: string): Promise<TranscriptEntry>;
  getTranscript?(sessionId: string): Promise<TranscriptEntry[]>;
  advanceStage?(sessionId: string): Promise<{ current_stage: number; stage: number }>;
  getReport?(sessionId: string): Promise<PerformanceReport | null>;
}

export interface ResearchService {
  getDocuments(domain?: string, query?: string): Promise<LegalDocument[]>;
  getDocumentById(id: string): Promise<LegalDocument | null>;
  searchLegalSources(query: string, domain?: string): Promise<LegalCitation[]>;
  queryAssistant(sessionId: string, prompt: string): Promise<ResearchMessage>;
  getResearchSessions(): Promise<ResearchSession[]>;
}

export interface BackendLevelProgressItem {
  level_number: number;
  level?: number;
  status: string;
  best_score: number | null;
  attempts?: number;
}

export interface BackendOverallProgress {
  levels_passed: number;
  certificate_eligible: boolean;
}

export interface BackendUserProgress {
  levels: BackendLevelProgressItem[];
  overall: BackendOverallProgress;
}

export interface PerformanceService {
  getReport(sessionId: string): Promise<PerformanceReport | null>;
  getUserReports(userId: string): Promise<PerformanceReport[]>;
  getAggregateStats(userId: string): Promise<{
    completedSimulations: number;
    totalHours: number;
    averageScore: number;
    skillAverages: Record<string, number>;
  }>;
  getProgress?(): Promise<BackendUserProgress>;
  getLevels?(): Promise<unknown>;
}

export interface CertificateService {
  claim(): Promise<CertificateRecord>;
  verify(code: string): Promise<CertificateRecord>;
}

export interface NotificationService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}

