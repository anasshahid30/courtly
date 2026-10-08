import type {
  LegalDomain, Jurisdiction, Simulation, SimulationSession,
  CourtroomParticipant, ProceedingStage, TranscriptEntry,
  CaseFile, CaseParty, CaseFact, EvidenceItem, WitnessProfile,
  LegalProvision, LegalDocument, PerformanceReport, SkillScore,
  KeyMoment, StudentProfile, Notification, ResearchSession,
  TimelineEvent
} from '@/types';

// ── Current Demo User ──
export const mockStudent: StudentProfile = {
  id: 'user-1',
  email: 'alex.morgan@lawschool.edu',
  fullName: 'Alex Morgan',
  role: 'student',
  status: 'active',
  institution: 'Commonwealth Law School',
  degreeProgram: 'Bachelor of Laws (LLB)',
  studyLevel: 'Third Year',
  preferredJurisdiction: 'England & Wales',
  preferredLanguage: 'English',
  legalInterests: ['Commercial Law', 'Contract Law', 'Civil Litigation'],
  previousExperience: 'Moot court competitions, legal clinic',
  learningGoals: ['Improve cross-examination', 'Master evidence presentation', 'Strengthen oral advocacy'],
  completedSimulations: 12,
  totalPracticeHours: 28.5,
  averageScore: 74,
  currentStreak: 5,
  createdAt: '2025-09-01T00:00:00Z',
  lastActiveAt: new Date().toISOString(),
};

// ── Legal Domains ──
export const mockDomains: LegalDomain[] = [
  { id: 'dom-1', name: 'Business Law', slug: 'business-law', description: 'Commercial transactions, partnerships, corporate governance, and business disputes.', icon: 'Briefcase', availability: 'available', simulationCount: 8, difficulties: ['beginner', 'intermediate', 'advanced'], jurisdictions: ['England & Wales'], color: '#14232D' },
  { id: 'dom-2', name: 'Contract Law', slug: 'contract-law', description: 'Formation, interpretation, performance, and breach of contractual agreements.', icon: 'FileText', availability: 'available', simulationCount: 5, difficulties: ['beginner', 'intermediate'], jurisdictions: ['England & Wales'], color: '#356C91' },
  { id: 'dom-3', name: 'Corporate Law', slug: 'corporate-law', description: 'Company formation, directors\' duties, shareholder disputes, and corporate governance.', icon: 'Building2', availability: 'coming_soon', simulationCount: 0, difficulties: ['intermediate', 'advanced'], jurisdictions: ['England & Wales'], color: '#237A57' },
  { id: 'dom-4', name: 'Civil Law', slug: 'civil-law', description: 'Tort law, negligence, personal injury, and civil disputes between parties.', icon: 'Scale', availability: 'coming_soon', simulationCount: 0, difficulties: ['beginner', 'intermediate', 'advanced'], jurisdictions: ['England & Wales'], color: '#B78032' },
  { id: 'dom-5', name: 'Criminal Law', slug: 'criminal-law', description: 'Criminal offences, defences, sentencing, and criminal procedure.', icon: 'Shield', availability: 'coming_soon', simulationCount: 0, difficulties: ['beginner', 'intermediate', 'advanced'], jurisdictions: ['England & Wales'], color: '#B94B4B' },
  { id: 'dom-6', name: 'Constitutional Law', slug: 'constitutional-law', description: 'Fundamental rights, separation of powers, and constitutional principles.', icon: 'Landmark', availability: 'under_development', simulationCount: 0, difficulties: ['advanced'], jurisdictions: ['England & Wales'], color: '#667580' },
  { id: 'dom-7', name: 'Family Law', slug: 'family-law', description: 'Marriage, divorce, custody, adoption, and family-related legal matters.', icon: 'Heart', availability: 'under_development', simulationCount: 0, difficulties: ['beginner', 'intermediate'], jurisdictions: [], color: '#C7A979' },
  { id: 'dom-8', name: 'Property Law', slug: 'property-law', description: 'Land law, conveyancing, leases, and property transactions.', icon: 'Home', availability: 'under_development', simulationCount: 0, difficulties: ['intermediate'], jurisdictions: [], color: '#1D3344' },
  { id: 'dom-9', name: 'Employment Law', slug: 'employment-law', description: 'Employment rights, discrimination, unfair dismissal, and workplace disputes.', icon: 'Users', availability: 'coming_soon', simulationCount: 0, difficulties: ['beginner', 'intermediate'], jurisdictions: [], color: '#356C91' },
  { id: 'dom-10', name: 'Intellectual Property Law', slug: 'ip-law', description: 'Patents, trademarks, copyright, and protection of intellectual assets.', icon: 'Lightbulb', availability: 'under_development', simulationCount: 0, difficulties: ['advanced'], jurisdictions: [], color: '#A68B5B' },
];

// ── Jurisdictions ──
export const mockJurisdictions: Jurisdiction[] = [
  { id: 'jur-1', name: 'England & Wales', code: 'EW', country: 'United Kingdom', legalSystem: 'Common Law', isActive: true },
  { id: 'jur-2', name: 'Federal — United States', code: 'US-FED', country: 'United States', legalSystem: 'Common Law', isActive: false },
  { id: 'jur-3', name: 'India', code: 'IN', country: 'India', legalSystem: 'Common Law', isActive: false },
];

// ── Simulations ──
export const mockSimulations: Simulation[] = [
  {
    id: 'sim-1',
    title: 'Henderson v. Caldwell Trading Ltd',
    description: 'A commercial contract dispute involving alleged breach of a supply agreement between a small manufacturer and a national distributor. The claimant seeks damages for lost revenue following early termination of a three-year distribution contract.',
    legalDomain: mockDomains[0],
    jurisdiction: mockJurisdictions[0],
    difficulty: 'intermediate',
    estimatedDuration: 45,
    availableRoles: ['plaintiff_counsel', 'defendant_counsel'],
    learningObjectives: ['Apply principles of contract interpretation', 'Present oral arguments on breach of contract', 'Handle witness examination on commercial dealings', 'Navigate procedural stages of a civil hearing'],
    proceedingType: 'Civil Trial — Contract Dispute',
    status: 'published',
    isFeatured: true,
    tags: ['contract', 'breach', 'damages', 'commercial'],
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-08-15T00:00:00Z',
  },
  {
    id: 'sim-2',
    title: 'Re: Oakwood Partners LLP — Partnership Dispute',
    description: 'A partnership dissolution dispute where one partner alleges mismanagement and breach of fiduciary duty. The hearing involves competing claims over partnership assets and the enforceability of restrictive covenants.',
    legalDomain: mockDomains[0],
    jurisdiction: mockJurisdictions[0],
    difficulty: 'advanced',
    estimatedDuration: 60,
    availableRoles: ['plaintiff_counsel', 'defendant_counsel'],
    learningObjectives: ['Argue fiduciary duty obligations', 'Cross-examine on financial records', 'Present evidence of business losses', 'Make legal submissions on partnership law'],
    proceedingType: 'Civil Trial — Partnership Dispute',
    status: 'published',
    isFeatured: true,
    tags: ['partnership', 'fiduciary duty', 'dissolution'],
    createdAt: '2025-07-10T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'sim-3',
    title: 'Graham v. Sterling Financial Services',
    description: 'A consumer protection dispute where the claimant alleges misrepresentation by a financial advisory firm regarding investment risks. Involves questions of professional negligence and duty of care in financial services.',
    legalDomain: mockDomains[1],
    jurisdiction: mockJurisdictions[0],
    difficulty: 'beginner',
    estimatedDuration: 30,
    availableRoles: ['plaintiff_counsel', 'defendant_counsel'],
    learningObjectives: ['Identify elements of misrepresentation', 'Examine witnesses on professional standards', 'Present documentary evidence', 'Structure opening and closing arguments'],
    proceedingType: 'Civil Trial — Misrepresentation',
    status: 'published',
    isFeatured: false,
    tags: ['misrepresentation', 'consumer', 'negligence'],
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-09-10T00:00:00Z',
  },
  {
    id: 'sim-4',
    title: 'Whitfield Industries Ltd v. Apex Logistics',
    description: 'A high-value commercial dispute concerning the interpretation of force majeure and limitation of liability clauses following supply chain disruptions. Both parties seek declaratory relief.',
    legalDomain: mockDomains[0],
    jurisdiction: mockJurisdictions[0],
    difficulty: 'advanced',
    estimatedDuration: 55,
    availableRoles: ['plaintiff_counsel', 'defendant_counsel'],
    learningObjectives: ['Interpret complex contractual clauses', 'Argue force majeure principles', 'Examine expert witnesses', 'Navigate High Court civil procedure'],
    proceedingType: 'Commercial Court — Contractual Interpretation',
    status: 'published',
    isFeatured: false,
    tags: ['force majeure', 'limitation', 'commercial'],
    createdAt: '2025-08-20T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'sim-5',
    title: 'Preliminary Hearing — Case Management',
    description: 'A case management conference where parties must agree on directions for trial, including disclosure obligations, witness statements, and trial timetable.',
    legalDomain: mockDomains[0],
    jurisdiction: mockJurisdictions[0],
    difficulty: 'beginner',
    estimatedDuration: 20,
    availableRoles: ['plaintiff_counsel', 'defendant_counsel'],
    learningObjectives: ['Understand case management procedures', 'Make procedural submissions', 'Respond to judicial directions', 'Negotiate trial logistics'],
    proceedingType: 'Preliminary Hearing',
    status: 'published',
    isFeatured: false,
    tags: ['procedure', 'case management', 'directions'],
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-15T00:00:00Z',
  },
];

// ── Case File for Sim-1 ──
export const mockCaseFile: CaseFile = {
  id: 'case-1',
  title: 'Henderson v. Caldwell Trading Ltd',
  caseNumber: 'HC-2025-003847',
  jurisdiction: 'England & Wales',
  proceedingType: 'Civil Trial — Contract Dispute',
  summary: 'Mr James Henderson, trading as Henderson Manufacturing, entered into a three-year exclusive distribution agreement with Caldwell Trading Ltd for the supply of specialist building materials across the North of England. After 14 months, Caldwell Trading Ltd terminated the agreement citing persistent delivery delays and quality complaints. Henderson disputes the termination, arguing that the alleged deficiencies were minor and did not constitute a repudiatory breach. Henderson claims £185,000 in lost revenue and consequential damages.',
  learningObjectives: ['Apply principles of contract interpretation', 'Present oral arguments on breach of contract', 'Handle witness examination on commercial dealings', 'Navigate procedural stages of a civil hearing'],
  parties: [
    { id: 'party-1', name: 'James Henderson', role: 'Claimant', description: 'Owner and sole trader of Henderson Manufacturing, a small building materials manufacturer based in Sheffield.', counsel: 'Student Advocate' },
    { id: 'party-2', name: 'Caldwell Trading Ltd', role: 'Defendant', description: 'A national building materials distributor headquartered in Manchester, with a network of 23 regional depots.', counsel: 'AI Opposing Counsel' },
  ],
  facts: [
    { id: 'fact-1', description: 'On 15 March 2023, the parties entered into a written Distribution Agreement for a term of three years.', date: '2023-03-15', isAgreed: true, isDisputed: false },
    { id: 'fact-2', description: 'The Agreement granted Caldwell exclusive distribution rights for Henderson\'s insulation products across Northern England.', isAgreed: true, isDisputed: false },
    { id: 'fact-3', description: 'Clause 8.2 of the Agreement required Henderson to maintain delivery within 14 business days of receipt of order.', isAgreed: true, isDisputed: false },
    { id: 'fact-4', description: 'Between June 2023 and April 2024, Caldwell sent 7 written complaints regarding late deliveries.', isAgreed: true, isDisputed: false },
    { id: 'fact-5', description: 'On 12 May 2024, Caldwell served notice of termination citing Clause 12.1 (material breach).', date: '2024-05-12', isAgreed: true, isDisputed: false },
    { id: 'fact-6', description: 'Henderson alleges that the delivery delays were caused by supply chain disruptions affecting the entire industry.', isAgreed: false, isDisputed: true, source: 'Claimant\'s Witness Statement' },
    { id: 'fact-7', description: 'Caldwell alleges that Henderson\'s delivery failure rate exceeded 40%, constituting a material breach.', isAgreed: false, isDisputed: true, source: 'Defendant\'s Delivery Records' },
    { id: 'fact-8', description: 'Henderson did not serve a response to Caldwell\'s final warning letter dated 22 April 2024.', date: '2024-04-22', isAgreed: false, isDisputed: true },
  ],
  legalIssues: [
    'Whether Caldwell Trading Ltd was entitled to terminate the Distribution Agreement under Clause 12.1.',
    'Whether the alleged delivery delays constituted a material or repudiatory breach of contract.',
    'Whether Henderson\'s failure to respond to the warning letter constituted acquiescence.',
    'The appropriate measure and quantum of damages if breach is established.',
  ],
  evidence: [
    { id: 'ev-1', referenceNumber: 'C1', title: 'Distribution Agreement', description: 'The original three-year distribution agreement dated 15 March 2023.', type: 'contract', admissibility: 'admitted', isBookmarked: false },
    { id: 'ev-2', referenceNumber: 'C2', title: 'Delivery Records 2023–2024', description: 'Complete delivery records showing dispatch dates, expected delivery dates, and actual delivery dates.', type: 'document', admissibility: 'admitted', isBookmarked: false },
    { id: 'ev-3', referenceNumber: 'C3', title: 'Correspondence Bundle', description: 'Email correspondence between the parties from June 2023 to May 2024 including complaint letters and responses.', type: 'correspondence', admissibility: 'admitted', isBookmarked: false },
    { id: 'ev-4', referenceNumber: 'D1', title: 'Caldwell Quality Inspection Reports', description: 'Internal quality inspection reports prepared by Caldwell\'s quality assurance team regarding Henderson products.', type: 'document', admissibility: 'pending', isBookmarked: false },
    { id: 'ev-5', referenceNumber: 'D2', title: 'Financial Loss Statement', description: 'Henderson\'s statement of financial losses including projected revenue under the remaining contract term.', type: 'financial', admissibility: 'admitted', isBookmarked: false },
    { id: 'ev-6', referenceNumber: 'D3', title: 'Termination Notice', description: 'Formal termination notice served by Caldwell on 12 May 2024 under Clause 12.1.', type: 'correspondence', admissibility: 'admitted', isBookmarked: false },
  ],
  witnesses: [
    { id: 'wit-1', name: 'James Henderson', role: 'Claimant', relationship: 'Owner of Henderson Manufacturing', knownStatements: ['Delivery delays were industry-wide', 'Quality was maintained throughout', 'Caldwell never raised concerns in person'], background: 'Experienced manufacturer with 15 years in the building materials industry.' },
    { id: 'wit-2', name: 'Sarah Caldwell', role: 'Defendant Director', relationship: 'Managing Director of Caldwell Trading Ltd', knownStatements: ['Multiple formal complaints were sent', 'Henderson failed to address quality issues', 'Termination was a last resort'], background: 'Managing Director for 8 years, oversaw the distribution agreement personally.' },
    { id: 'wit-3', name: 'Mark Thompson', role: 'Expert Witness', relationship: 'Independent logistics consultant', knownStatements: ['Industry delivery standards allow 10-15% variance', 'A 40% failure rate significantly exceeds industry norms'], background: 'Independent supply chain consultant with 20 years of experience in building materials distribution.' },
  ],
  applicableLaw: [
    { id: 'law-1', title: 'Sale of Goods Act 1979', section: 'Section 14 — Implied Terms', text: 'Where the seller sells goods in the course of a business, there is an implied term that the goods supplied under the contract are of satisfactory quality.', source: 'Sale of Goods Act 1979', jurisdiction: 'England & Wales', isBookmarked: false },
    { id: 'law-2', title: 'Unfair Contract Terms Act 1977', section: 'Section 3 — Liability in Contract', text: 'This section applies as between contracting parties where one of them deals on the other\'s written standard terms of business.', source: 'Unfair Contract Terms Act 1977', jurisdiction: 'England & Wales', isBookmarked: false },
    { id: 'law-3', title: 'Hong Kong Fir Shipping Co Ltd v Kawasaki Kisen Kaisha Ltd [1962]', text: 'Whether a breach is sufficiently serious to amount to a repudiatory breach depends on whether the breach deprives the innocent party of substantially the whole benefit of the contract.', source: 'Court of Appeal', jurisdiction: 'England & Wales', isBookmarked: false },
  ],
  timeline: [
    { id: 'tl-1', date: '2023-03-15', title: 'Distribution Agreement Signed', description: 'Parties enter into three-year exclusive distribution agreement.', type: 'filing' },
    { id: 'tl-2', date: '2023-06-22', title: 'First Complaint', description: 'Caldwell sends first formal complaint regarding late delivery of June order.', type: 'correspondence' },
    { id: 'tl-3', date: '2023-11-10', title: 'Quality Concerns Raised', description: 'Caldwell reports quality issues with a batch of insulation materials.', type: 'correspondence' },
    { id: 'tl-4', date: '2024-02-15', title: 'Performance Review Meeting', description: 'Parties meet to discuss delivery performance. No written minutes agreed.', type: 'fact' },
    { id: 'tl-5', date: '2024-04-22', title: 'Final Warning Letter', description: 'Caldwell issues formal final warning citing persistent breaches.', type: 'correspondence' },
    { id: 'tl-6', date: '2024-05-12', title: 'Termination Notice', description: 'Caldwell serves termination notice under Clause 12.1.', type: 'filing' },
    { id: 'tl-7', date: '2024-06-28', title: 'Claim Filed', description: 'Henderson files claim for damages arising from wrongful termination.', type: 'filing' },
  ],
};

// ── Courtroom Participants ──
export const mockParticipants: CourtroomParticipant[] = [
  { id: 'p-judge', name: 'Hon. Justice R. Whitmore', role: 'judge', title: 'Presiding Judge', status: 'listening', isAI: true, isStudent: false },
  { id: 'p-student', name: 'Alex Morgan', role: 'plaintiff_counsel', title: 'Counsel for the Claimant', status: 'waiting', isAI: false, isStudent: true },
  { id: 'p-opposing', name: 'Ms C. Blackwell', role: 'defendant_counsel', title: 'Counsel for the Defendant', status: 'waiting', isAI: true, isStudent: false },
  { id: 'p-witness', name: 'James Henderson', role: 'witness', title: 'Claimant Witness', status: 'waiting', isAI: true, isStudent: false },
];

// ── Proceeding Stages ──
export const mockStages: ProceedingStage[] = [
  { id: 'stage-1', name: 'Court Called to Order', order: 1, description: 'The court is formally opened and the case is called.', isActive: false, isCompleted: true, availableActions: [] },
  { id: 'stage-2', name: 'Preliminary Matters', order: 2, description: 'Any preliminary applications or directions are addressed.', isActive: false, isCompleted: true, availableActions: ['request_clarification'] },
  { id: 'stage-3', name: 'Opening Statements', order: 3, description: 'Each party presents their opening statement to the court.', isActive: true, isCompleted: false, availableActions: ['submit_argument', 'refer_to_authority'] },
  { id: 'stage-4', name: 'Claimant\'s Evidence', order: 4, description: 'The claimant presents evidence and witnesses are examined.', isActive: false, isCompleted: false, availableActions: ['present_evidence', 'ask_question', 'raise_objection', 'refer_to_authority'] },
  { id: 'stage-5', name: 'Cross-Examination', order: 5, description: 'The opposing party cross-examines the claimant\'s witnesses.', isActive: false, isCompleted: false, availableActions: ['raise_objection', 'request_clarification'] },
  { id: 'stage-6', name: 'Defendant\'s Evidence', order: 6, description: 'The defendant presents evidence and witnesses.', isActive: false, isCompleted: false, availableActions: ['raise_objection', 'ask_question', 'present_evidence'] },
  { id: 'stage-7', name: 'Closing Submissions', order: 7, description: 'Each party presents closing arguments summarising their case.', isActive: false, isCompleted: false, availableActions: ['submit_argument', 'refer_to_authority'] },
  { id: 'stage-8', name: 'Judgment', order: 8, description: 'The court delivers its decision.', isActive: false, isCompleted: false, availableActions: [] },
];

// ── Demo Transcript ──
export const mockTranscript: TranscriptEntry[] = [
  { id: 't-1', speakerName: 'Court Clerk', speakerRole: 'clerk', timestamp: '10:00:00', text: 'All rise. The High Court is now in session. The Honourable Justice Whitmore presiding.', stage: 'Court Called to Order', type: 'procedural' },
  { id: 't-2', speakerName: 'Hon. Justice Whitmore', speakerRole: 'judge', timestamp: '10:00:15', text: 'Please be seated. We are here today for the matter of Henderson versus Caldwell Trading Limited. I have read the skeleton arguments. Counsel for the claimant, are you ready to proceed?', stage: 'Court Called to Order', type: 'speech' },
  { id: 't-3', speakerName: 'Alex Morgan', speakerRole: 'plaintiff_counsel', timestamp: '10:00:45', text: 'Yes, My Lord. The claimant is ready to proceed.', stage: 'Preliminary Matters', type: 'speech' },
  { id: 't-4', speakerName: 'Ms C. Blackwell', speakerRole: 'defendant_counsel', timestamp: '10:01:00', text: 'The defendant is also ready, My Lord.', stage: 'Preliminary Matters', type: 'speech' },
  { id: 't-5', speakerName: 'Hon. Justice Whitmore', speakerRole: 'judge', timestamp: '10:01:15', text: 'Very well. I understand there are no preliminary applications. Counsel for the claimant, you may begin your opening statement.', stage: 'Opening Statements', type: 'speech' },
  { id: 't-6', speakerName: 'Alex Morgan', speakerRole: 'plaintiff_counsel', timestamp: '10:01:45', text: 'May it please the Court. My Lord, this case concerns the wrongful termination of a three-year distribution agreement by the defendant, Caldwell Trading Limited. The claimant, Mr James Henderson, will demonstrate that Caldwell terminated the agreement without proper justification, causing substantial financial loss to his business.', stage: 'Opening Statements', type: 'speech' },
  { id: 't-7', speakerName: 'Alex Morgan', speakerRole: 'plaintiff_counsel', timestamp: '10:02:30', text: 'The evidence will show that while there were some delivery variations — as is common in the building materials industry — these did not rise to the level of material breach contemplated by Clause 12.1 of the Agreement. The defendant acted precipitously and in breach of their own contractual obligations.', stage: 'Opening Statements', type: 'speech' },
];

// ── Performance Report for Sim-1 ──
export const mockPerformanceReport: PerformanceReport = {
  id: 'perf-1',
  sessionId: 'session-1',
  simulationTitle: 'Henderson v. Caldwell Trading Ltd',
  overallScore: 84,
  durationMinutes: 45,
  isDemo: true,
  judicialFeedback: 'Claimant counsel presented a well-structured argument on wrongful repudiation, successfully highlighting the Defendant’s failure to afford the 14-day contractual cure period under Clause 8.1. Oral delivery was authoritative and evidentiary objections were raised with precision.',
  skills: [
    { id: 'sk-1', name: 'Legal Reasoning', skillCategory: 'Legal Reasoning', score: 88, maxScore: 100, description: 'Ability to identify and apply relevant legal principles.', feedback: 'Strong application of repudiatory breach thresholds.' },
    { id: 'sk-2', name: 'Argument Structure', skillCategory: 'Oral Fluency', score: 82, maxScore: 100, description: 'Clarity and logical organisation of legal arguments.', feedback: 'Well-paced opening and clear closing submissions.' },
    { id: 'sk-3', name: 'Oral Advocacy', skillCategory: 'Oral Advocacy', score: 80, maxScore: 100, description: 'Effective courtroom communication and persuasion.', feedback: 'Strong courtroom presence and formal register.' },
    { id: 'sk-4', name: 'Procedural Compliance', skillCategory: 'Procedural Compliance', score: 92, maxScore: 100, description: 'Understanding and adherence to court procedures.', feedback: 'Excellent exhibit tender under Civil Evidence Act.' },
    { id: 'sk-5', name: 'Evidence Handling', skillCategory: 'Evidence Handling', score: 85, maxScore: 100, description: 'Effective presentation and challenge of evidence.', feedback: 'Effectively admitted the signed inspection release note.' },
  ],
  skillScores: [
    { skillCategory: 'Legal Reasoning', score: 88, maxScore: 100, feedback: 'Strong application of repudiatory breach thresholds.' },
    { skillCategory: 'Evidence Handling', score: 85, maxScore: 100, feedback: 'Effectively admitted the signed inspection release note.' },
    { skillCategory: 'Oral Fluency', score: 79, maxScore: 100, feedback: 'Well-paced opening and clear closing submissions.' },
    { skillCategory: 'Procedural Compliance', score: 92, maxScore: 100, feedback: 'Excellent exhibit tender under Civil Evidence Act.' },
    { skillCategory: 'Bench Responsiveness', score: 85, maxScore: 100, feedback: 'Handled judge questions on Sale of Goods Act adeptly.' },
  ],
  strengths: [
    'Authoritative opening statement defining repudiatory breach',
    'Effective cross-examination on mitigation duty under Hadley v Baxendale',
    'Prompt objection sustained against speculative witness testimony',
    'Accurate statutory citation of Sale of Goods Act 1979 s 14(2)',
  ],
  improvements: [
    'Provide more granular calculation of the £145,000 lost profits quantum',
    'Anticipate defense arguments regarding industry delivery tolerances earlier in submissions',
  ],
  keyMoments: [
    { id: 'km-1', timestamp: '10:01:45', type: 'opening', title: 'Opening Submissions Delivered', description: 'Framed the claim as wrongful termination under Clause 8.1.', scoreImpact: 10 },
    { id: 'km-2', timestamp: '10:15:30', type: 'evidence', title: 'Exhibit B Formally Tendered', description: 'Tendered signed warehouse inspection report without objection.', scoreImpact: 8 },
    { id: 'km-3', timestamp: '10:22:00', type: 'objection', title: 'Hearsay Objection Sustained', description: 'Successfully objected to opposing counsel questioning regarding warehouse rumors.', scoreImpact: 5 },
    { id: 'km-4', timestamp: '10:48:00', type: 'judge_question', title: 'Addressed Judge on Mitigation', description: 'Persuasively applied Hadley v Baxendale two-limb test.', scoreImpact: 6 },
  ],
  completedAt: '2025-10-01T11:15:00Z',
};

export const mockPerformanceReports: PerformanceReport[] = [mockPerformanceReport];

export const mockCaseFiles: CaseFile[] = [
  {
    ...mockCaseFile,
    simulationId: 'sim-1',
    court: 'High Court of Justice (Commercial Court)',
    proceduralHistory: 'Commercial contract claim regarding breach of exclusive 3-year supply agreement.',
    provisions: [
      {
        id: 'prov-1',
        statuteName: 'Sale of Goods Act 1979',
        sectionNumber: 'Section 14(2)',
        category: 'Statutory Implied Term',
        verbatimText: 'Where the seller sells goods in the course of a business, there is an implied term that the goods supplied under the contract are of satisfactory quality.',
        relevance: 'Central to Caldwell’s defense that goods were defective on 12 March 2025.',
      },
      {
        id: 'prov-2',
        statuteName: 'Hadley v Baxendale [1854]',
        sectionNumber: 'Common Law Precedent',
        category: 'Remoteness of Damages',
        verbatimText: 'Where two parties have made a contract which one of them has broken, the damages which the other party ought to receive in respect of such breach should be such as may fairly and reasonably be considered either arising naturally.',
        relevance: 'Establishes Henderson’s entitlement to £145,000 consequential lost profits.',
      }
    ],
    evidence: [
      {
        id: 'ev-1',
        exhibitNumber: 'Exhibit A',
        referenceNumber: 'C1',
        title: 'Exclusive Distribution Agreement (15 Jan 2024)',
        date: '15 January 2024',
        source: 'Executed Contract by Henderson & Caldwell Trading',
        description: 'The formal 3-year distribution contract governing supply benchmarks, quality standards, and termination notice.',
        content: `EXCLUSIVE DISTRIBUTION AGREEMENT\nDate: 15 January 2024\nParties: (1) Henderson Precision Engineering (Supplier)\n(2) Caldwell Trading Ltd (Distributor)\n\nClause 4.2 (Calibration): In the event of minor variance in component tolerance, the Supplier shall be afforded 48 hours to recalibrate before any claim for defect may arise.\n\nClause 8.1 (Termination for Breach): Either party may terminate immediately upon 14 days prior written notice specifying the remedy required.`,
        relevance: 'Proves Caldwell breached the mandatory 14-day cure notice requirement before terminating.',
      },
      {
        id: 'ev-2',
        exhibitNumber: 'Exhibit B',
        referenceNumber: 'C2',
        title: 'Signed Warehouse Inspection Release Form',
        date: '14 March 2025',
        source: 'Caldwell Central Depot QA Department',
        description: 'Inspection release note signed by Caldwell confirming recalibrated batch was received in full satisfaction.',
        content: `CALDWELL TRADING LTD — QUALITY ASSURANCE\nDate: 14 March 2025\nBatch ID: HPE-VALVE-2025-03\nStatus: FULLY RECALIBRATED & ACCEPTED\nSigned: T. Evans (Chief Quality Inspector)`,
        relevance: 'Demonstrates the alleged 12 March defect was cured and accepted by the Defendant.',
      },
    ],
  },
];

// ── Research Sessions ──
export const mockResearchSessions: ResearchSession[] = [
  {
    id: 'res-1',
    title: 'Sale of Goods Act & Repudiatory Breach Analysis',
    jurisdiction: 'England & Wales',
    legalDomain: 'Contract Law',
    isSaved: true,
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2025-10-01T10:30:00Z',
    messages: [
      {
        id: 'rm-1',
        role: 'user',
        content: 'What constitutes a repudiatory breach under English commercial supply contracts?',
        timestamp: '10:00 AM',
      },
      {
        id: 'rm-2',
        role: 'assistant',
        content: 'Under English law, as established in Hong Kong Fir Shipping [1962], a breach is repudiatory if it deprives the innocent party of substantially the whole benefit of the contract.',
        timestamp: '10:01 AM',
      },
    ],
  },
];

// ── Notifications ──
export const mockNotifications: Notification[] = [
  { id: 'n-1', type: 'simulation', title: 'New Simulation Available', message: 'Whitfield Industries v. Apex Logistics is now available for practice.', isRead: false, actionUrl: '/courtroom', createdAt: '2025-10-08T09:00:00Z', timestamp: '10m ago' },
  { id: 'n-2', type: 'performance', title: 'Performance Report Ready', message: 'Your evaluation for Henderson v. Caldwell Trading Ltd is ready to review.', isRead: false, actionUrl: '/performance', createdAt: '2025-10-07T14:30:00Z', timestamp: '1h ago' },
  { id: 'n-3', type: 'system', title: 'Platform Update', message: 'New practice modes are now available in the Practice Studio.', isRead: true, createdAt: '2025-10-05T10:00:00Z', timestamp: '2d ago' },
  { id: 'n-4', type: 'account', title: 'Welcome to Courtly', message: 'Complete your profile to get personalised simulation recommendations.', isRead: true, actionUrl: '/dashboard', createdAt: '2025-09-01T00:00:00Z', timestamp: '1w ago' },
];

// ── Legal Documents ──
export const mockDocuments: LegalDocument[] = [
  {
    id: 'doc-1',
    title: 'Sale of Goods Act 1979',
    sourceType: 'statute',
    jurisdiction: 'England & Wales',
    legalDomain: 'Contract Law',
    domainId: 'contract-law',
    issuingAuthority: 'Parliament of the United Kingdom',
    publicationDate: '1979-01-01',
    year: 1979,
    version: 'Current',
    verificationStatus: 'verified',
    legalStatus: 'current',
    lifecycle: 'approved',
    tags: ['sale', 'goods', 'contract', 'implied terms'],
    pageCount: 48,
    citation: '1979 c. 54 (UK)',
    summary: 'The primary statute governing sales of goods in England & Wales. Implies statutory terms regarding satisfactory quality, fitness for purpose, and description.',
    fullText: `Sale of Goods Act 1979 (1979 c. 54)\nSection 14: Implied terms about quality or fitness.\n(1) Except as provided by this section and section 15 below and subject to any other enactment, there is no implied term about the quality or fitness for any particular purpose of goods supplied under a contract of sale.\n(2) Where the seller sells goods in the course of a business, there is an implied term that the goods supplied under the contract are of satisfactory quality.\n(2A) For the purposes of this Act, goods are of satisfactory quality if they meet the standard that a reasonable person would regard as satisfactory, taking account of any description of the goods, the price (if relevant) and all the other relevant circumstances.`,
  },
  {
    id: 'doc-2',
    title: 'Hadley v Baxendale [1854] EWHC J70',
    sourceType: 'judicial_decision',
    jurisdiction: 'England & Wales',
    legalDomain: 'Contract Law',
    domainId: 'contract-law',
    issuingAuthority: 'Court of Exchequer',
    publicationDate: '1854-02-23',
    year: 1854,
    version: 'Leading Case',
    verificationStatus: 'verified',
    legalStatus: 'current',
    lifecycle: 'approved',
    tags: ['damages', 'remoteness', 'loss of profits'],
    pageCount: 14,
    citation: '[1854] EWHC J70, (1854) 9 Exch 341',
    summary: 'Leading English contract law case establishing the landmark two-limb rule governing remoteness of damages in breach of contract.',
    fullText: `Hadley & Anor v Baxendale & Ors [1854] EWHC J70\nJudgment of Baron Alderson:\n"Where two parties have made a contract which one of them has broken, the damages which the other party ought to receive in respect of such breach of contract should be such as may fairly and reasonably be considered either arising naturally, i.e., according to the usual course of things, from such breach of contract itself, or such as may reasonably be supposed to have been in the contemplation of both parties, at the time they made the contract, as the probable result of the breach of it."`,
  },
  {
    id: 'doc-3',
    title: 'Unfair Contract Terms Act 1977',
    sourceType: 'statute',
    jurisdiction: 'England & Wales',
    legalDomain: 'Contract Law',
    domainId: 'contract-law',
    issuingAuthority: 'Parliament of the United Kingdom',
    publicationDate: '1977-01-01',
    year: 1977,
    version: 'Current',
    verificationStatus: 'verified',
    legalStatus: 'current',
    lifecycle: 'approved',
    tags: ['unfair', 'exclusion', 'limitation', 'reasonableness'],
    pageCount: 32,
    citation: '1977 c. 50 (UK)',
    summary: 'Regulates contract terms that exclude or limit liability in business-to-business transactions under the requirement of reasonableness.',
    fullText: `Unfair Contract Terms Act 1977 (1977 c. 50)\nSection 3: Liability arising in contract.\n(1) This section applies as between contracting parties where one of them deals on the other's written standard terms of business.\n(2) As against that party, the other cannot by reference to any contract term:\n(a) when himself in breach of contract, exclude or restrict any liability of his in respect of the breach; or\n(b) claim to be entitled to render a contractual performance substantially different from that which was reasonably expected of him, except in so far as the contract term satisfies the requirement of reasonableness.`,
  },
];

// ── Session History ──
export const mockSessionHistory: Partial<SimulationSession>[] = [
  { id: 'session-1', simulationId: 'sim-1', simulation: mockSimulations[0], userId: 'user-1', status: 'completed', duration: 2700, startedAt: '2025-10-01T10:00:00Z', endedAt: '2025-10-01T10:45:00Z', transcript: mockTranscript, performanceReport: mockPerformanceReport },
];

// ── Performance History (for charts) ──
export const mockPerformanceHistory = [
  { date: 'Sep 1', score: 58, reasoning: 55, advocacy: 60, procedure: 50, evidence: 52 },
  { date: 'Sep 8', score: 62, reasoning: 60, advocacy: 65, procedure: 55, evidence: 58 },
  { date: 'Sep 15', score: 65, reasoning: 63, advocacy: 68, procedure: 60, evidence: 60 },
  { date: 'Sep 22', score: 68, reasoning: 66, advocacy: 70, procedure: 62, evidence: 64 },
  { date: 'Sep 28', score: 71, reasoning: 70, advocacy: 74, procedure: 65, evidence: 66 },
  { date: 'Oct 1', score: 74, reasoning: 78, advocacy: 80, procedure: 68, evidence: 65 },
];

