// ============================================================
// COURTLY — Comprehensive Type Definitions & 5-Level Progression
// ============================================================

export type UserRole = 'guest' | 'student' | 'educator' | 'content_reviewer' | 'administrator';
export type AccountStatus = 'active' | 'suspended' | 'pending_verification' | 'deactivated';
export type ThemeMode = 'light' | 'dark' | 'system';

export type DomainAvailability = 'available' | 'coming_soon' | 'under_development';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type InteractionMode = 'voice' | 'text';

export type SimulationStatus = 'draft' | 'under_review' | 'approved' | 'published' | 'archived';
export type SessionStatus = 'idle' | 'preparing' | 'connecting' | 'active' | 'paused' | 'reconnecting' | 'completed' | 'terminated' | 'error';
export type ParticipantStatus = 'speaking' | 'listening' | 'waiting' | 'questioning' | 'objecting';

export type DocumentLifecycle = 'uploaded' | 'pending_extraction' | 'processing' | 'indexed' | 'pending_review' | 'approved' | 'rejected' | 'archived' | 'failed';
export type VerificationStatus = 'verified' | 'unverified' | 'pending_review' | 'disputed';
export type LegalDocumentType = 'statute' | 'regulation' | 'judicial_decision' | 'textbook' | 'commentary' | 'practice_material' | 'procedural_rules';
export type LegalStatus = 'current' | 'historical' | 'superseded' | 'unverified' | 'educational_commentary';

export type AssignmentStatus = 'draft' | 'active' | 'closed' | 'archived';
export type SubscriptionTier = 'free' | 'student' | 'institution';
export type NotificationType = 'simulation' | 'assignment' | 'performance' | 'account' | 'system';
export type EvidenceAdmissibility = 'admitted' | 'objected' | 'excluded' | 'pending';

// --- 5-Level Progression & Certification Types ---

export type CertificateStatus =
  | 'not_eligible'
  | 'requirements_in_progress'
  | 'eligible_for_assessment'
  | 'assessment_pending'
  | 'passed'
  | 'issued';

export interface LevelMilestone {
  id: string;
  title: string;
  description: string;
  category: 'etiquette' | 'procedure' | 'evidence' | 'advocacy' | 'reasoning' | 'assessment';
  isCompleted: boolean;
  requiredSkillScore?: number;
}

export interface AdvocacyLevel {
  levelNumber: number; // 1 to 5
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  minPassingScore: number;
  totalRequiredSimulations: number;
  learningObjectives: string[];
  requiredSkills: string[];
  milestones: LevelMilestone[];
  assessmentRequirement: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  progressPercentage: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'advocacy' | 'milestone' | 'streak' | 'procedural' | 'evidence' | 'special';
  unlockedAt?: string;
  isUnlocked: boolean;
  progress?: { current: number; total: number };
}

export interface CertificateRecord {
  id: string;
  title: string;
  levelNumber: number;
  jurisdiction: string;
  legalDomain: string;
  status: CertificateStatus;
  issueDate?: string;
  expiryDate?: string;
  verificationId?: string;
  assessmentScore?: number;
  accreditationNote: string;
}

// --- Core User & Profiles ---

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  status: AccountStatus;
  institution?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface StudentProfile extends User {
  role: 'student' | 'educator';
  currentLevel: number; // 1 to 5
  levelTitle: string;
  degreeProgram?: string;
  studyLevel?: string;
  preferredJurisdiction?: string;
  preferredLanguage?: string;
  legalInterests: string[];
  previousExperience?: string;
  learningGoals: string[];
  completedSimulations: number;
  totalPracticeHours: number;
  averageScore: number;
  currentStreak: number;
  achievements?: Achievement[];
  certificates?: CertificateRecord[];
}

export interface EducatorProfile extends User {
  role: 'educator';
  department?: string;
  teachingRole?: string;
  subjectsTaught: string[];
  intendedUse?: string;
  totalStudents: number;
  activeCohorts: number;
}

export interface Institution {
  id: string;
  name: string;
  type: 'university' | 'law_school' | 'professional_body' | 'other';
  country?: string;
  website?: string;
}

// --- Legal Domain & Jurisdictions ---

export interface LegalDomain {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  availability: DomainAvailability;
  simulationCount: number;
  difficulties: DifficultyLevel[];
  jurisdictions: string[];
  color: string;
}

export interface Jurisdiction {
  id: string;
  name: string;
  code: string;
  country: string;
  legalSystem: string;
  isActive: boolean;
}

// --- Simulations ---

export interface Simulation {
  id: string;
  title: string;
  description: string;
  legalDomain: LegalDomain;
  jurisdiction: Jurisdiction;
  difficulty: DifficultyLevel;
  targetLevel?: number;
  estimatedDuration: number;
  availableRoles: string[];
  learningObjectives: string[];
  proceedingType: string;
  status: SimulationStatus;
  isFeatured?: boolean;
  isGuestEligible?: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SimulationSession {
  id: string;
  simulationId: string;
  simulation?: Simulation;
  userId: string;
  isGuestSession?: boolean;
  userRole: string;
  difficulty: string;
  status: SessionStatus;
  currentStageIndex?: number;
  currentSpeakerId?: string;
  elapsedSeconds?: number;
  totalDuration?: number;
  duration?: number;
  transcript: TranscriptEntry[];
  presentedEvidenceIds?: string[];
  objections?: Objection[];
  notes?: string;
  startedAt: string;
  endedAt?: string;
  currentStage?: ProceedingStage;
  performanceReport?: PerformanceReport;
  configuration?: any;
}

export interface CourtroomParticipant {
  id: string;
  name: string;
  role: string;
  title?: string;
  status?: ParticipantStatus;
  avatarUrl?: string;
  isAI?: boolean;
  isStudent?: boolean;
}

export interface ProceedingStage {
  id: string;
  name: string;
  order: number;
  description: string;
  isActive?: boolean;
  isCompleted?: boolean;
  availableActions?: string[];
}

export interface TranscriptEntry {
  id: string;
  speakerId?: string;
  speakerName: string;
  speakerRole: string;
  timestamp: string;
  text: string;
  stage?: string;
  type?: string;
  isKeyMoment?: boolean;
}

export interface Objection {
  id: string;
  type: string;
  raisedBy?: string;
  explanation?: string;
  ruling?: 'sustained' | 'overruled' | 'pending';
  judgeResponse?: string;
  timestamp?: string;
}

export interface JudicialRuling {
  id: string;
  objectionId?: string;
  type?: string;
  ruling: 'sustained' | 'overruled';
  reasoning: string;
  admissibilityImpact?: string;
  scoreImpact: number;
  timestamp?: string;
}

// --- Evidence & Case Files ---

export interface EvidenceItem {
  id: string;
  referenceNumber?: string;
  exhibitNumber?: string;
  title: string;
  description: string;
  type?: string;
  admissibility?: EvidenceAdmissibility;
  fileUrl?: string;
  content?: string;
  notes?: string;
  source?: string;
  date?: string;
  relevance?: string;
  isBookmarked?: boolean;
}

export interface CaseParty {
  id: string;
  name: string;
  role: string;
  description: string;
  counsel?: string;
}

export interface CaseFact {
  id: string;
  description: string;
  date?: string;
  isAgreed?: boolean;
  isDisputed?: boolean;
  source?: string;
}

export interface WitnessProfile {
  id: string;
  name: string;
  role: string;
  relationship?: string;
  knownStatements?: string[];
  background: string;
  credibilityRating?: string;
  statementSummary?: string;
  party?: string;
}

export interface LegalProvision {
  id: string;
  title?: string;
  statuteName?: string;
  section?: string;
  sectionNumber?: string;
  text?: string;
  verbatimText?: string;
  source?: string;
  jurisdiction?: string;
  category?: string;
  relevance?: string;
  isBookmarked?: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type?: string;
}

export interface CaseFile {
  id: string;
  simulationId?: string;
  title: string;
  caseNumber: string;
  court?: string;
  jurisdiction: string;
  proceduralHistory?: string;
  proceedingType: string;
  summary: string;
  parties: CaseParty[];
  facts: CaseFact[];
  legalIssues?: string[];
  evidence: EvidenceItem[];
  witnesses: WitnessProfile[];
  applicableLaw?: LegalProvision[];
  provisions?: LegalProvision[];
  learningObjectives?: string[];
  timeline?: TimelineEvent[];
}

// --- Documents & Research ---

export interface LegalDocument {
  id: string;
  title: string;
  sourceType: LegalDocumentType;
  jurisdiction: string;
  legalDomain: string;
  domainId?: string;
  author?: string;
  issuingAuthority?: string;
  publicationDate?: string;
  year?: number | string;
  effectiveDate?: string;
  version?: string;
  verificationStatus: VerificationStatus;
  legalStatus: LegalStatus;
  lastReviewedDate?: string;
  fileUrl?: string;
  pageCount?: number;
  lifecycle: DocumentLifecycle;
  tags: string[];
  summary?: string;
  citation?: string;
  fullText?: string;
}

export interface LegalCitation {
  id: string;
  title: string;
  sourceName: string;
  jurisdiction: string;
  year: number;
  citationString: string;
  relevanceScore: number;
  summaryText: string;
  url?: string;
}

export interface ResearchMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: LegalCitation[];
}

export interface ResearchSession {
  id: string;
  title: string;
  jurisdiction: string;
  legalDomain: string;
  messages: ResearchMessage[];
  createdAt: string;
  updatedAt: string;
  isSaved?: boolean;
}

// --- Performance ---

export interface SkillScore {
  id?: string;
  name?: string;
  skillCategory?: string;
  score: number;
  maxScore: number;
  description?: string;
  feedback?: string;
}

export interface KeyMoment {
  id: string;
  title?: string;
  timestamp: string;
  type?: string;
  description: string;
  assessment?: string;
  scoreImpact?: number;
}

export interface PerformanceReport {
  id: string;
  sessionId: string;
  simulationTitle?: string;
  overallScore: number;
  durationMinutes?: number;
  judicialFeedback?: string;
  isGuestReport?: boolean;
  provisionalLevelRecommendation?: string;
  skills?: SkillScore[];
  skillScores?: SkillScore[];
  strengths: string[];
  improvements: string[];
  missedOpportunities?: string[];
  proceduralMistakes?: string[];
  strongArguments?: string[];
  weakArguments?: string[];
  suggestedExercises?: string[];
  keyMoments: KeyMoment[];
  completedAt: string;
  isDemo: boolean;
}

// --- Notifications ---

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  timestamp?: string;
}
