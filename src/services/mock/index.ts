// ============================================================
// COURTLY — Mock Services Implementation
// ============================================================

import {
  mockStudent, mockDomains, mockJurisdictions, mockSimulations,
  mockCaseFiles, mockDocuments, mockPerformanceReports, mockNotifications,
  mockResearchSessions
} from '@/data/mock-data';
import type {
  AuthService, SimulationService, CourtroomService,
  ResearchService, PerformanceService, NotificationService, CertificateService
} from '../interfaces';
import type {
  StudentProfile, Simulation, SimulationSession, CaseFile,
  LegalDocument, LegalCitation, ResearchMessage, ResearchSession,
  PerformanceReport, JudicialRuling, TranscriptEntry, Notification, LegalDomain, Jurisdiction
} from '@/types';

// Helper for localStorage keys
const STORAGE_KEYS = {
  USER: 'courtly_user',
  SIMULATIONS: 'courtly_simulations',
  SESSIONS: 'courtly_sessions',
  REPORTS: 'courtly_reports',
  NOTIFICATIONS: 'courtly_notifications',
  RESEARCH: 'courtly_research',
};

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
}

// ── Auth Service ──
export class MockAuthService implements AuthService {
  async getCurrentUser(): Promise<StudentProfile | null> {
    return getStorage<StudentProfile>(STORAGE_KEYS.USER, mockStudent);
  }

  async login({ email }: { email: string; password?: string }): Promise<StudentProfile> {
    const user = { ...mockStudent, email };
    setStorage(STORAGE_KEYS.USER, user);
    return user;
  }

  async register(data: Partial<StudentProfile>): Promise<StudentProfile> {
    const user: StudentProfile = {
      ...mockStudent,
      ...data,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.USER, user);
    return user;
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  async updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    const current = await this.getCurrentUser() || mockStudent;
    const updated = { ...current, ...data, lastActiveAt: new Date().toISOString() };
    setStorage(STORAGE_KEYS.USER, updated);
    return updated;
  }
}

// ── Simulation Service ──
export class MockSimulationService implements SimulationService {
  async getDomains(): Promise<LegalDomain[]> {
    return mockDomains;
  }

  async getJurisdictions(): Promise<Jurisdiction[]> {
    return mockJurisdictions;
  }

  async getSimulations(filters?: { domain?: string; difficulty?: string; search?: string }): Promise<Simulation[]> {
    let list = [...mockSimulations];
    if (filters?.domain && filters.domain !== 'all') {
      list = list.filter(s => s.legalDomain.slug === filters.domain || s.legalDomain.id === filters.domain);
    }
    if (filters?.difficulty && filters.difficulty !== 'all') {
      list = list.filter(s => s.difficulty === filters.difficulty);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q)));
    }
    return list;
  }

  async getSimulationById(id: string): Promise<Simulation | null> {
    return mockSimulations.find(s => s.id === id) || mockSimulations[0];
  }

  async getCaseFile(simulationId: string): Promise<CaseFile | null> {
    return mockCaseFiles.find(c => c.simulationId === simulationId) || mockCaseFiles[0];
  }
}

// ── Courtroom Service ──
export class MockCourtroomService implements CourtroomService {
  async createSession(simulationId: string, role: string, difficulty: string): Promise<SimulationSession> {
    const sim = mockSimulations.find(s => s.id === simulationId) || mockSimulations[0];
    const newSession: SimulationSession = {
      id: `sess-${Date.now()}`,
      simulationId: sim.id,
      userId: 'user-1',
      userRole: role || 'plaintiff_counsel',
      difficulty: difficulty || 'intermediate',
      status: 'preparing',
      currentStageIndex: 0,
      currentSpeakerId: 'part-judge',
      elapsedSeconds: 0,
      totalDuration: sim.estimatedDuration * 60,
      transcript: [],
      presentedEvidenceIds: [],
      objections: [],
      notes: '',
      startedAt: new Date().toISOString(),
    };
    const sessions = getStorage<SimulationSession[]>(STORAGE_KEYS.SESSIONS, []);
    sessions.push(newSession);
    setStorage(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  }

  async getSession(sessionId: string): Promise<SimulationSession | null> {
    const sessions = getStorage<SimulationSession[]>(STORAGE_KEYS.SESSIONS, []);
    return sessions.find(s => s.id === sessionId) || null;
  }

  async submitObjection(sessionId: string, objectionType: string, grounds: string): Promise<JudicialRuling> {
    // Intelligent contextual ruling
    const isSustained = Math.random() > 0.35;
    const ruling: JudicialRuling = {
      id: `rule-${Date.now()}`,
      objectionId: `obj-${Date.now()}`,
      ruling: isSustained ? 'sustained' : 'overruled',
      reasoning: isSustained
        ? `The objection on grounds of ${objectionType} is well-founded. Counsel will rephrase the inquiry and confine questioning to matters directly in issue under the Distribution Agreement.`
        : `Objection overruled. While close, the question establishes relevant context regarding the course of commercial dealings. Counsel may proceed.`,
      admissibilityImpact: isSustained ? 'Witness directed not to answer in the current form.' : 'Witness will answer the question.',
      scoreImpact: isSustained ? 5 : 2,
    };
    return ruling;
  }

  async tenderEvidence(sessionId: string, evidenceId: string): Promise<boolean> {
    return true;
  }

  async recordTranscript(sessionId: string, entry: Omit<TranscriptEntry, 'id' | 'timestamp'>): Promise<TranscriptEntry> {
    const fullEntry: TranscriptEntry = {
      ...entry,
      id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    return fullEntry;
  }

  async completeSession(sessionId: string): Promise<PerformanceReport> {
    const report = {
      ...mockPerformanceReports[0],
      id: `rep-${Date.now()}`,
      sessionId,
      overallScore: Math.floor(Math.random() * 15) + 75,
      completedAt: new Date().toISOString(),
    };
    const reports = getStorage<PerformanceReport[]>(STORAGE_KEYS.REPORTS, mockPerformanceReports);
    reports.unshift(report);
    setStorage(STORAGE_KEYS.REPORTS, reports);
    return report;
  }

  async postTurn(sessionId: string, text: string): Promise<TranscriptEntry> {
    return this.recordTranscript(sessionId, {
      speakerName: 'Advocate',
      speakerRole: 'learner',
      text,
    });
  }

  async getTranscript(sessionId: string): Promise<TranscriptEntry[]> {
    const session = await this.getSession(sessionId);
    return session?.transcript || [];
  }

  async advanceStage(sessionId: string): Promise<{ current_stage: number; stage: number }> {
    const session = await this.getSession(sessionId);
    const nextStage = Math.min(5, (session?.currentStageIndex || 0) + 1);
    if (session) {
      session.currentStageIndex = nextStage;
      const sessions = getStorage<SimulationSession[]>(STORAGE_KEYS.SESSIONS, []);
      const idx = sessions.findIndex(s => s.id === sessionId);
      if (idx !== -1) {
        sessions[idx].currentStageIndex = nextStage;
        setStorage(STORAGE_KEYS.SESSIONS, sessions);
      }
    }
    return { current_stage: nextStage, stage: nextStage };
  }

  async getReport(sessionId: string): Promise<PerformanceReport | null> {
    const reports = getStorage<PerformanceReport[]>(STORAGE_KEYS.REPORTS, mockPerformanceReports);
    return reports.find(r => r.sessionId === sessionId) || reports[0] || null;
  }
}

// ── Research Service ──
export class MockResearchService implements ResearchService {
  async getDocuments(domain?: string, query?: string): Promise<LegalDocument[]> {
    let docs = [...mockDocuments];
    if (domain && domain !== 'all') {
      docs = docs.filter(d => d.domainId === domain || d.legalDomain === domain);
    }
    if (query) {
      const q = query.toLowerCase();
      docs = docs.filter(d => d.title.toLowerCase().includes(q) || (d.summary || '').toLowerCase().includes(q));
    }
    return docs;
  }

  async getDocumentById(id: string): Promise<LegalDocument | null> {
    return mockDocuments.find(d => d.id === id) || mockDocuments[0];
  }

  async searchLegalSources(query: string, domain?: string): Promise<LegalCitation[]> {
    const citations: LegalCitation[] = [
      {
        id: 'cit-1',
        title: 'Sale of Goods Act 1979, s 14(2)',
        sourceName: 'UK Public General Acts 1979 c. 54',
        jurisdiction: 'England & Wales',
        year: 1979,
        citationString: 'Sale of Goods Act 1979, s 14(2)',
        relevanceScore: 0.96,
        summaryText: 'Where the seller sells goods in the course of a business, there is an implied term that the goods supplied under the contract are of satisfactory quality.',
        url: 'https://www.legislation.gov.uk/ukpga/1979/54/section/14',
      },
      {
        id: 'cit-2',
        title: 'Hadley v Baxendale [1854] EWHC J70',
        sourceName: 'Court of Exchequer',
        jurisdiction: 'England & Wales',
        year: 1854,
        citationString: '[1854] EWHC J70, (1854) 9 Exch 341',
        relevanceScore: 0.92,
        summaryText: 'Establishes the fundamental two-limb test for remoteness of damages in breach of contract claims.',
        url: 'https://www.bailii.org/ew/cases/EWHC/Exch/1854/J70.html',
      },
      {
        id: 'cit-3',
        title: 'The Golden Victory [2007] UKHL 12',
        sourceName: 'House of Lords',
        jurisdiction: 'England & Wales',
        year: 2007,
        citationString: '[2007] UKHL 12, [2007] 2 AC 353',
        relevanceScore: 0.88,
        summaryText: 'Assessment of damages for repudiatory breach of a long-term commercial charterparty.',
        url: 'https://www.bailii.org/uk/cases/UKHL/2007/12.html',
      }
    ];
    return citations;
  }

  async queryAssistant(sessionId: string, prompt: string): Promise<ResearchMessage> {
    const responses = [
      `Under Section 14(2) of the Sale of Goods Act 1979, goods supplied in the course of a business carry an implied term of satisfactory quality. In *Henderson v Caldwell*, your key contention is whether the initial batch delivered on 12 March 2025 met the contract specifications under Clause 4.2.`,
      `Regarding the mitigation of damages, *Hadley v Baxendale* establishes that Caldwell Trading had a duty to take reasonable steps to minimize their loss by seeking alternative suppliers in the open market before claiming four months of consequential lost profits.`,
      `The timing of notice under Clause 8.1 is pivotal. The contract required 14 days' written notice to remedy any alleged defect before termination. The documentary record (Exhibit C) reveals Caldwell terminated unilaterally without affording Henderson the cure period.`
    ];
    const content = responses[Math.floor(Math.random() * responses.length)];
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      citations: [
        {
          id: 'cit-1',
          title: 'Sale of Goods Act 1979, s 14',
          sourceName: 'UK Public General Acts',
          jurisdiction: 'England & Wales',
          year: 1979,
          citationString: 'Sale of Goods Act 1979, s 14',
          relevanceScore: 0.95,
          summaryText: 'Implied terms as to quality or fitness in commercial supply contracts.',
        }
      ]
    };
  }

  async getResearchSessions(): Promise<ResearchSession[]> {
    return mockResearchSessions;
  }
}

// ── Performance Service ──
export class MockPerformanceService implements PerformanceService {
  async getReport(sessionId: string): Promise<PerformanceReport | null> {
    const reports = getStorage<PerformanceReport[]>(STORAGE_KEYS.REPORTS, mockPerformanceReports);
    return reports.find(r => r.sessionId === sessionId) || reports[0];
  }

  async getUserReports(userId: string): Promise<PerformanceReport[]> {
    return getStorage<PerformanceReport[]>(STORAGE_KEYS.REPORTS, mockPerformanceReports);
  }

  async getAggregateStats(userId: string) {
    const reports = await this.getUserReports(userId);
    const totalHours = reports.reduce((acc, r) => acc + (r.durationMinutes || 45) / 60, 0);
    const avgScore = reports.length ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / reports.length) : 75;
    return {
      completedSimulations: reports.length,
      totalHours: Number(totalHours.toFixed(1)),
      averageScore: avgScore,
      skillAverages: {
        'Legal Reasoning': 84,
        'Evidence Handling': 80,
        'Oral Advocacy': 78,
        'Procedural Compliance': 90,
        'Judicial Responsiveness': 82,
      }
    };
  }

  async getProgress() {
    return {
      levels: [
        { level_number: 1, level: 1, status: 'PASSED', best_score: 88, attempts: 1 },
        { level_number: 2, level: 2, status: 'PASSED', best_score: 91, attempts: 2 },
        { level_number: 3, level: 3, status: 'IN_PROGRESS', best_score: 79, attempts: 1 },
        { level_number: 4, level: 4, status: 'NOT_STARTED', best_score: null, attempts: 0 },
        { level_number: 5, level: 5, status: 'NOT_STARTED', best_score: null, attempts: 0 },
      ],
      overall: {
        levels_passed: 2,
        certificate_eligible: false,
      },
    };
  }

  async getLevels() {
    return [
      { id: 1, number: 1, title: 'Level 1: Fundamentals of Advocacy', pass_threshold: 85, certificate_threshold: null, status: 'PASSED', best_score: 88, attempts: 1 },
      { id: 2, number: 2, title: 'Level 2: Evidence & Cross-Examination', pass_threshold: 85, certificate_threshold: null, status: 'PASSED', best_score: 91, attempts: 2 },
      { id: 3, number: 3, title: 'Level 3: Procedural Mastery', pass_threshold: 85, certificate_threshold: null, status: 'IN_PROGRESS', best_score: 79, attempts: 1 },
      { id: 4, number: 4, title: 'Level 4: Appellate Advocacy', pass_threshold: 85, certificate_threshold: null, status: 'NOT_STARTED', best_score: null, attempts: 0 },
      { id: 5, number: 5, title: 'Level 5: Advanced Commercial Court', pass_threshold: 85, certificate_threshold: 90, status: 'NOT_STARTED', best_score: null, attempts: 0 },
    ];
  }
}

// ── Notification Service ──
export class MockNotificationService implements NotificationService {
  async getNotifications(): Promise<Notification[]> {
    return getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, mockNotifications);
  }

  async markAsRead(id: string): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map(n => n.id === id ? { ...n, isRead: true } : n);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  async markAllAsRead(): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map(n => ({ ...n, isRead: true }));
    setStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }
}

// ── Certificate Service ──
export class MockCertificateService implements CertificateService {
  async claim() {
    return {
      id: 'cert-1',
      title: 'Certificate of Advocacy Excellence',
      levelNumber: 5,
      jurisdiction: 'Commonwealth',
      legalDomain: 'Commercial Advocacy',
      status: 'issued' as const,
      issueDate: new Date().toISOString(),
      verificationId: 'MOCK-CERT-CODE-1234',
      assessmentScore: 92.5,
      accreditationNote: 'Issued by Courtly Virtual Courtroom',
      verification_code: 'MOCK-CERT-CODE-1234',
      score: 92.5,
    };
  }

  async verify(code: string) {
    return {
      id: 'cert-1',
      title: 'Verified Certificate of Advocacy Excellence',
      levelNumber: 5,
      jurisdiction: 'Commonwealth',
      legalDomain: 'Commercial Advocacy',
      status: 'issued' as const,
      issueDate: new Date().toISOString(),
      verificationId: code,
      assessmentScore: 92.5,
      accreditationNote: 'Formally verified credential in Courtly Registry',
      recipient_name: 'Alex Morgan',
      recipient_email: 'alex.morgan@law.edu',
      verification_code: code,
      score: 92.5,
    };
  }
}

// Service instances export
export const authService = new MockAuthService();
export const simulationService = new MockSimulationService();
export const courtroomService = new MockCourtroomService();
export const researchService = new MockResearchService();
export const performanceService = new MockPerformanceService();
export const notificationService = new MockNotificationService();
export const certificateService = new MockCertificateService();
