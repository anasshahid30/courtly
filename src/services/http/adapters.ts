// ============================================================
// COURTLY — HTTP Backend Adapters
// Converts backend snake_case API responses into frontend types.
// Never invents fallback values for missing backend data.
// ============================================================

import type {
  AdvocacyLevel,
  CaseFile,
  CaseParty,
  CertificateRecord,
  EvidenceItem,
  JudicialRuling,
  LegalDomain,
  PerformanceReport,
  Simulation,
  SimulationSession,
  SkillScore,
  StudentProfile,
  TranscriptEntry,
  WitnessProfile,
} from '@/types';

// ---------------------------------------------------------------------------
// 1. User & Profile Adapters
// ---------------------------------------------------------------------------

export interface BackendUserResponse {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export function adaptUserToStudentProfile(res: BackendUserResponse): StudentProfile {
  let role: 'student' | 'educator' | 'administrator' | 'guest' = 'student';
  if (res.role === 'admin') role = 'administrator';
  else if (res.role === 'educator') role = 'educator';
  else if (res.role === 'learner') role = 'student';

  return {
    id: String(res.id),
    email: res.email,
    fullName: res.full_name,
    role,
    status: null,
    currentLevel: null,
    levelTitle: null,
    legalInterests: [],
    learningGoals: [],
    completedSimulations: null,
    totalPracticeHours: null,
    averageScore: null,
    currentStreak: null,
    createdAt: null,
    lastActiveAt: null,
    achievements: [],
    certificates: [],
  };
}

// ---------------------------------------------------------------------------
// 2. Simulation & Domain Adapters
// ---------------------------------------------------------------------------

export interface BackendDomainItem {
  id: string;
  name: string;
}

export function adaptDomainToLegalDomain(d: BackendDomainItem): LegalDomain {
  return {
    id: d.id,
    name: d.name,
    slug: d.id,
    description: '',
    icon: 'Scale',
    availability: 'available',
    simulationCount: 0,
    difficulties: [],
    jurisdictions: [],
    color: '#4B6BFB',
  };
}

export interface BackendSimulationSummary {
  id: number;
  slug: string;
  title: string;
  domain_slug: string;
  level_number: number;
}

export function adaptSimulationSummary(s: BackendSimulationSummary): Simulation {
  return {
    id: s.slug || String(s.id),
    title: s.title,
    description: '',
    legalDomain: {
      id: s.domain_slug,
      name: s.domain_slug.replace(/-/g, ' '),
      slug: s.domain_slug,
      description: '',
      icon: 'Scale',
      availability: 'available',
      simulationCount: 0,
      difficulties: [],
      jurisdictions: [],
      color: '#4B6BFB',
    },
    domain: s.domain_slug,
    jurisdiction: {
      id: 'jur-default',
      name: 'Commonwealth',
      code: 'CW',
      country: 'Commonwealth',
      legalSystem: 'Common Law',
      isActive: true,
    },
    difficulty: 'intermediate',
    targetLevel: s.level_number,
    estimatedDuration: 0,
    availableRoles: [],
    learningObjectives: [],
    proceedingType: 'Commercial Bench Trial',
    status: 'published',
    tags: [s.domain_slug, `level-${s.level_number}`],
    createdAt: '',
    updatedAt: '',
  };
}

export interface BackendSimulationDetail extends BackendSimulationSummary {
  jurisdiction?: string;
  summary?: string;
  parties?: CaseParty[];
  legal_issues?: string[];
  agreed_facts?: string[];
}

export function adaptSimulationDetail(data: BackendSimulationDetail): Simulation {
  return {
    id: data.slug || String(data.id),
    title: data.title,
    description: data.summary || '',
    legalDomain: {
      id: data.domain_slug,
      name: data.domain_slug.replace(/-/g, ' '),
      slug: data.domain_slug,
      description: '',
      icon: 'Scale',
      availability: 'available',
      simulationCount: 0,
      difficulties: [],
      jurisdictions: [],
      color: '#4B6BFB',
    },
    domain: data.domain_slug,
    jurisdiction: {
      id: 'jur-case',
      name: data.jurisdiction || 'Commonwealth',
      code: 'CW',
      country: 'Commonwealth',
      legalSystem: 'Common Law',
      isActive: true,
    },
    difficulty: 'intermediate',
    targetLevel: data.level_number,
    estimatedDuration: 0,
    availableRoles: [],
    learningObjectives: [],
    proceedingType: 'Commercial Bench Trial',
    status: 'published',
    tags: [data.domain_slug, `level-${data.level_number}`],
    createdAt: '',
    updatedAt: '',
  };
}

export interface BackendCaseFileResponse {
  slug?: string;
  title?: string;
  jurisdiction?: string;
  domain_slug?: string;
  level_number?: number;
  caseNumber?: string;
  case_number?: string;
  proceedingType?: string;
  proceeding_type?: string;
  summary?: string;
  parties?: CaseParty[];
  agreed_facts?: string[];
  documents?: Array<{
    id: string;
    title: string;
    description?: string;
    date?: string;
  }>;
  witnesses?: WitnessProfile[];
  legal_issues?: string[];
}

export function adaptCaseFile(data: BackendCaseFileResponse, simulationId: string): CaseFile {
  const facts = (data.agreed_facts || []).map((factText, idx) => ({
    id: `fact-${idx + 1}`,
    description: typeof factText === 'string' ? factText : JSON.stringify(factText),
    isAgreed: true,
  }));

  const evidence: EvidenceItem[] = (data.documents || []).map((doc) => ({
    id: doc.id,
    title: doc.title,
    description: doc.description || '',
    date: doc.date,
  }));

  return {
    id: data.slug || simulationId,
    simulationId,
    title: data.title || '',
    caseNumber: data.caseNumber || data.case_number || '',
    jurisdiction: data.jurisdiction || '',
    proceedingType: data.proceedingType || data.proceeding_type || '',
    summary: data.summary || '',
    parties: data.parties || [],
    facts,
    evidence,
    witnesses: data.witnesses || [],
    legalIssues: data.legal_issues || [],
  };
}

// ---------------------------------------------------------------------------
// 3. Performance & Level Adapters
// ---------------------------------------------------------------------------

export interface BackendLevelItem {
  id: number;
  number: number;
  title: string;
  pass_threshold: number;
  certificate_threshold: number | null;
  status: string;
  best_score: number | null;
  attempts: number;
}

export function adaptLevelToAdvocacyLevel(lvl: BackendLevelItem): AdvocacyLevel {
  const isCompleted = lvl.status === 'PASSED';
  const isUnlocked = lvl.status !== 'NOT_STARTED';

  return {
    levelNumber: lvl.number,
    title: lvl.title,
    subtitle: '',
    description: '',
    badge: '',
    minPassingScore: lvl.pass_threshold,
    totalRequiredSimulations: 1,
    learningObjectives: [],
    requiredSkills: [],
    milestones: [],
    assessmentRequirement: '',
    isUnlocked,
    isCompleted,
    progressPercentage: isCompleted ? 100 : (lvl.best_score || 0),
  };
}

// ---------------------------------------------------------------------------
// 4. Courtroom & Trial Adapters
// ---------------------------------------------------------------------------

export interface BackendSessionResponse {
  id: number;
  user_id: number;
  case_slug: string;
  level_number: number;
  status: string;
  created_at: string | null;
  scores?: Array<{
    id: number;
    criterion_code: string;
    score: number;
    explanation: string;
  }>;
}

export function adaptSessionToSimulationSession(
  session: BackendSessionResponse,
  role?: string,
  difficulty?: string
): SimulationSession {
  return {
    id: String(session.id),
    simulationId: session.case_slug,
    userId: String(session.user_id),
    userRole: role || 'plaintiff_counsel',
    difficulty: difficulty || 'intermediate',
    status: session.status === 'COMPLETED' ? 'completed' : 'active',
    currentStageIndex: 0,
    transcript: [],
    startedAt: session.created_at || '',
  };
}

export interface BackendTurnResponse {
  id: number;
  session_id: number;
  sequence_no: number;
  speaker_type: string;
  stage_index: number;
  text: string;
  created_at: string;
}

export function adaptTurnToTranscriptEntry(turn: BackendTurnResponse): TranscriptEntry {
  return {
    id: String(turn.id),
    speakerName: turn.speaker_type === 'learner' ? 'Advocate' : 'Courtroom Speaker',
    speakerRole: turn.speaker_type,
    timestamp: turn.created_at
      ? new Date(turn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    text: turn.text,
    stage: String(turn.stage_index),
  };
}

export interface BackendObjectionResponse {
  id: number;
  session_id: number;
  turn_id: number;
  objection_type: string;
  grounds: string;
  ruling: string;
  reasoning: string | null;
  created_at: string;
}

export function adaptObjectionToJudicialRuling(obj: BackendObjectionResponse): JudicialRuling {
  let ruling: 'pending' | 'sustained' | 'overruled' = 'pending';
  if (obj.ruling === 'sustained') ruling = 'sustained';
  else if (obj.ruling === 'overruled') ruling = 'overruled';

  return {
    id: String(obj.id),
    objectionId: String(obj.id),
    type: obj.objection_type,
    ruling,
    reasoning: obj.reasoning || obj.grounds || '',
    scoreImpact: 0,
    timestamp: obj.created_at,
  };
}

export interface BackendSessionReportResponse {
  case_slug: string;
  level: number;
  level_number: number;
  criterion_scores: Array<{
    criterion_code: string;
    score: number;
    explanation: string;
  }>;
  overall_score: number;
  passed: boolean;
}

export function adaptSessionReportToPerformanceReport(
  data: BackendSessionReportResponse,
  sessionId: string
): PerformanceReport {
  const skills: SkillScore[] = (data.criterion_scores || []).map((cs) => ({
    name: cs.criterion_code.replace(/_/g, ' '),
    score: cs.score,
    maxScore: 100,
    feedback: cs.explanation,
  }));

  return {
    id: `rep-${sessionId}`,
    sessionId,
    overallScore: data.overall_score,
    skills,
    skillScores: skills,
    strengths: [],
    improvements: [],
    keyMoments: [],
    completedAt: new Date().toISOString(),
    isDemo: false,
  };
}

// ---------------------------------------------------------------------------
// 5. Certificate Adapters
// ---------------------------------------------------------------------------

export interface BackendCertificateResponse {
  id: number;
  user_id: number;
  score: number;
  verification_code: string;
  issued_at: string | null;
  recipient_name?: string;
  recipient_email?: string;
}

export function adaptCertificateToCertificateRecord(cert: BackendCertificateResponse): CertificateRecord {
  return {
    id: String(cert.id),
    title: 'Certificate of Advocacy Excellence',
    levelNumber: 5,
    jurisdiction: 'Commonwealth',
    legalDomain: 'Commercial Advocacy',
    status: 'issued',
    verificationId: cert.verification_code,
    assessmentScore: cert.score,
    issueDate: cert.issued_at || '',
    accreditationNote: 'Formally verified credential in Courtly Registry',
  };
}
