'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scale, Mic, MicOff, Volume2, VolumeX, Play, Pause,
  RotateCcw, Gavel, FileText, ChevronRight, CheckCircle2,
  Users, AlertTriangle, Sparkles, BookOpen, Send, Clock,
  ArrowRight, Shield, Award, HelpCircle, Loader2, RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ObjectionModal } from '@/components/courtroom/ObjectionModal';
import { EvidenceViewerModal } from '@/components/legal/EvidenceViewerModal';
import { CaseFileModal } from '@/components/legal/CaseFileModal';
import { speechService } from '@/lib/audio';
import { toast } from 'sonner';
// Always use the real HTTP simulation service to fetch the case dossier,
// regardless of the global mock/HTTP toggle — the case file must come from
// the backend, never from the Henderson mock data.
import { httpSimulationService, httpCourtroomService, getAuthToken } from '@/services/http';
import { COURTROOM_SCRIPT } from '@/data/courtroom-script';
import type { CaseFile } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Nova Systems neutral courtroom script (no Henderson-specific content)
// Used for guest / backend-linked sessions.  Dialogue refers to the case by
// its real title and uses generic role labels until AI turn integration is live.
// ─────────────────────────────────────────────────────────────────────────────
const NOVA_STAGE_NAMES = [
  'Preliminary Submissions',
  'Claimant Opening Submissions',
  'Examination-in-Chief',
  'Cross-Examination',
  'Closing Submissions',
  'Judicial Determination',
];

const NOVA_STAGE_DESCRIPTIONS = [
  'Formal appearance, procedural housekeeping, and identification of the key issues in dispute.',
  'Setting out the legal theory, the material breach of the Master Freight Agreement, and the resulting damages.',
  'Leading the first witness through their direct evidence regarding the damaged optical sensors.',
  'Opposing counsel cross-examines the witness; opportunities to raise evidentiary objections.',
  'Synthesising evidence, addressing force majeure and mitigation arguments, and concluding advocacy.',
  'The presiding judge delivers oral reasons and enters judgment.',
];

export default function CourtroomPage() {
  const router = useRouter();
  const {
    activeSimulation,
    activeCaseFile,
    activeSession,
    guestSession,
    setActiveCaseFile,
    setActiveSession,
    setLiveTranscript,
    setAdmittedEvidenceIds,
    setRecordedObjections,
    recordedObjections,
    isGuestMode,
    isAuthenticated,
    selectedRole,
    selectedDifficulty,
    isVoiceMode,
    isMicMuted,
    speechSynthesisEnabled,
    courtroomStage,
    isCourtroomActive,
    isCourtroomPaused,
    activeSpeakerId,
    liveTranscript,
    admittedEvidenceIds,
    sessionTimerSeconds,
    setSelectedRole,
    setSelectedDifficulty,
    setVoiceMode,
    setMicMuted,
    setSpeechSynthesisEnabled,
    startCourtroomSession,
    pauseCourtroomSession,
    resumeCourtroomSession,
    advanceStage,
    setCourtroomStage,
    setActiveSpeaker,
    addTranscriptEntry,
    openObjectionModal,
    openEvidenceViewer,
    openCaseFileModal,
    tickTimer,
    resetCourtroomSession,
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);
  const [turnError, setTurnError] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'transcript' | 'evidence' | 'notes'>('transcript');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const activeBackendSessionId = activeSession?.id || guestSession?.id || null;

  // Determine whether we are in a guest session (or live HTTP mode) that needs
  // the actual backend case dossier rather than the static mock demo.
  const isRealSession = isGuestMode || process.env.NEXT_PUBLIC_USE_MOCKS === 'false';
  // The canonical case slug used for all backend sessions at Level 1.
  const FOUNDATION_SLUG = 'contract_breach_demo';

  // ── Case Dossier Loading State ──────────────────────────────────────────────
  const [isDossierLoading, setIsDossierLoading] = useState(isRealSession);
  const [dossierError, setDossierError] = useState<string | null>(null);
  const [fetchedDossier, setFetchedDossier] = useState<CaseFile | null>(null);

  const loadDossierFromBackend = async () => {
    const slug =
      activeSimulation?.id && !activeSimulation.id.startsWith('sim-')
        ? activeSimulation.id
        : FOUNDATION_SLUG;
    const dossier = await httpSimulationService.getCaseFile(slug);
    if (!dossier) {
      throw new Error('The case dossier could not be retrieved from the server.');
    }
    return dossier;
  };

  // ── Retry handler for error state ───────────────────────────────────────────
  const fetchDossier = async () => {
    setIsDossierLoading(true);
    setDossierError(null);
    try {
      const dossier = await loadDossierFromBackend();
      setFetchedDossier(dossier);
      setActiveCaseFile(dossier);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error retrieving case dossier.';
      setDossierError(msg);
    } finally {
      setIsDossierLoading(false);
    }
  };

  useEffect(() => {
    if (!isRealSession) return;
    let isCancelled = false;

    async function run() {
      try {
        const dossier = await loadDossierFromBackend();
        if (!isCancelled) {
          setFetchedDossier(dossier);
          setActiveCaseFile(dossier);
          setDossierError(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : 'Unknown error retrieving case dossier.';
          setDossierError(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsDossierLoading(false);
        }
      }
    }

    run();
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRealSession, activeSimulation?.id]);

  // ── Timer interval ──────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isCourtroomActive && !isCourtroomPaused) {
      interval = setInterval(() => { tickTimer(); }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isCourtroomActive, isCourtroomPaused, tickTimer]);

  // ── Auto-scroll transcript ──────────────────────────────────────────────────
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveTranscript]);

  // ── Determine active dossier ────────────────────────────────────────────────
  // For real sessions: use the fetched backend dossier (or the store's activeCaseFile
  // if it's already been set). For demo/mock flows: rely on the store's activeCaseFile.
  const caseData: CaseFile | null = isRealSession
    ? (fetchedDossier || activeCaseFile)
    : activeCaseFile;

  // ── Derive participant details from real case data ──────────────────────────
  const claimantParty = caseData?.parties?.find(
    (p) => p.role === 'Claimant' || p.role.toLowerCase().includes('claimant')
  );
  const defendantParty = caseData?.parties?.find(
    (p) => p.role === 'Defendant' || p.role.toLowerCase().includes('defendant')
  );
  // Primary witness is the first witness in the dossier
  const primaryWitness = caseData?.witnesses?.[0] ?? null;
  // For Nova Systems the first witness is the claimant's witness; second is defendant's
  const witness1 = caseData?.witnesses?.[0] ?? null;
  const witness2 = caseData?.witnesses?.[1] ?? null;

  // ── Stage metadata ──────────────────────────────────────────────────────────
  // For real/guest sessions use the Nova Systems stage names; for mock/demo use imported script
  const currentStageName = isRealSession
    ? (NOVA_STAGE_NAMES[courtroomStage] || NOVA_STAGE_NAMES[0])
    : (COURTROOM_SCRIPT[courtroomStage]?.stageName || NOVA_STAGE_NAMES[0]);
  const currentStageDesc = isRealSession
    ? (NOVA_STAGE_DESCRIPTIONS[courtroomStage] || NOVA_STAGE_DESCRIPTIONS[0])
    : (COURTROOM_SCRIPT[courtroomStage]?.stageDescription || NOVA_STAGE_DESCRIPTIONS[0]);

  // ── Sync persisted transcript, evidence & objections when a real session is active ──
  useEffect(() => {
    if (!isRealSession || !activeBackendSessionId || !getAuthToken()) return;
    let isCancelled = false;

    async function syncSessionRecords() {
      try {
        const [persistedTurns, presentedIds, objections] = await Promise.all([
          httpCourtroomService.getTranscript(activeBackendSessionId!),
          httpCourtroomService.getPresentedEvidence(activeBackendSessionId!),
          httpCourtroomService.getObjections(activeBackendSessionId!),
        ]);
        if (!isCancelled) {
          setLiveTranscript(persistedTurns);
          setAdmittedEvidenceIds(presentedIds);
          setRecordedObjections(objections);
        }
      } catch {
        // Non-fatal on initial sync; action-level errors surface explicitly
      }
    }

    syncSessionRecords();
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRealSession, activeBackendSessionId]);

  // ── Handle entering the courtroom (after dossier load) ─────────────────────
  const handleEnterCourtroom = async () => {
    if (isRealSession && !fetchedDossier && !activeCaseFile) {
      toast.error('Case dossier has not loaded yet. Please wait or retry.');
      return;
    }

    if (isRealSession && !activeBackendSessionId && getAuthToken()) {
      try {
        const slug =
          activeSimulation?.id && !activeSimulation.id.startsWith('sim-')
            ? activeSimulation.id
            : FOUNDATION_SLUG;
        const created = await httpCourtroomService.createSession(
          slug,
          selectedRole,
          selectedDifficulty
        );
        setActiveSession(created);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unable to start backend trial session.';
        toast.error(msg);
        return;
      }
    }

    startCourtroomSession();
  };

  // ── Student submit ──────────────────────────────────────────────────────────
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSubmittingTurn) return;

    if (isRealSession) {
      const token = getAuthToken();
      if (!activeBackendSessionId || !token) {
        const msg = !token
          ? 'Your session token is missing or expired. Please sign in or restart your guest session.'
          : 'No active backend session found. Please return to the dashboard and launch the simulation again.';
        setTurnError(msg);
        toast.error(msg);
        return;
      }

      setIsSubmittingTurn(true);
      setTurnError(null);
      setActiveSpeaker('part-student');

      try {
        const savedTurn = await httpCourtroomService.postTurn(activeBackendSessionId, trimmed);
        addTranscriptEntry(savedTurn);
        setInputText('');
      } catch (err: unknown) {
        const rawMsg = err instanceof Error ? err.message : 'Failed to submit argument.';
        let friendlyMsg = rawMsg;
        if (rawMsg.includes('HTTP 401')) {
          friendlyMsg = 'Authentication expired or invalid. Please sign in or restart your guest session.';
        } else if (rawMsg.includes('HTTP 404')) {
          friendlyMsg = 'Trial session not found or not owned by your current session.';
        } else if (rawMsg.includes('HTTP 409')) {
          friendlyMsg = 'This trial session is already completed and can no longer accept new arguments.';
        }
        setTurnError(friendlyMsg);
        toast.error(friendlyMsg);
      } finally {
        setIsSubmittingTurn(false);
      }
      return;
    }

    // Non-guest demo flow: preserve existing local mock behavior
    setActiveSpeaker('part-student');
    addTranscriptEntry({
      id: `student-tr-${Date.now()}`,
      speakerId: 'part-student',
      speakerName: 'You (Advocate)',
      speakerRole: selectedRole === 'plaintiff_counsel' ? 'Claimant Counsel' : 'Defendant Counsel',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isKeyMoment: true,
    });

    setInputText('');
    setTimeout(() => {
      setActiveSpeaker('part-judge');
      addTranscriptEntry({
        id: `judge-ack-${Date.now()}`,
        speakerId: 'part-judge',
        speakerName: 'Presiding Judge',
        speakerRole: 'Commercial Court Judge',
        text: 'Submission noted for the record. Continue, Counsel.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isKeyMoment: false,
      });
      setActiveSpeaker('part-student');
    }, 1200);
  };

  const handleFinishProceeding = () => {
    speechService.cancel();
    toast.success('Proceeding concluded. Reviewing performance evaluation...');
    router.push('/performance');
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // ── Witness avatar initials ─────────────────────────────────────────────────
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING STATE — waiting for real dossier
  // ═══════════════════════════════════════════════════════════════════════════
  if (isRealSession && isDossierLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center bg-background text-foreground gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">Retrieving case dossier…</p>
        <p className="text-xs text-muted-foreground">Loading Nova Systems v. Solis Logistics</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR STATE — backend unavailable or dossier missing
  // ═══════════════════════════════════════════════════════════════════════════
  if (isRealSession && dossierError && !fetchedDossier && !activeCaseFile) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center bg-background text-foreground gap-6 max-w-md mx-auto text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-foreground">Case Dossier Unavailable</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Unable to retrieve the Nova Systems v. Solis Logistics case file from the server.
          </p>
          <p className="text-xs text-muted-foreground font-mono bg-muted/60 rounded px-3 py-2 mt-2">
            {dossierError}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDossier}
            className="gap-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-xs"
          >
            Return to Dashboard
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Ensure the backend server is running at{' '}
          <span className="font-mono">{process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background text-foreground overflow-hidden">

      {/* ════════════════════════════════════════════════════════════ */}
      {/* VIEW A: COURTROOM SETUP & CASE DOSSIER MODE                  */}
      {/* ════════════════════════════════════════════════════════════ */}
      {!isCourtroomActive ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8">

          {/* Header — real case title */}
          <div className="space-y-2 border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {caseData?.caseNumber || 'Level 1 · Foundation'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {caseData?.proceedingType || 'Commercial Bench Trial'}
              </Badge>
              <span className="text-xs text-muted-foreground">• {caseData?.jurisdiction || 'Demo Jurisdiction'}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              {caseData?.title || 'Nova Systems v. Solis Logistics'}
            </h1>
            {caseData?.summary ? (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {caseData.summary}
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                A commercial dispute arising from a delayed and damaged shipment of optical sensors.
                Nova Systems Ltd (Claimant) seeks damages from Solis Logistics Corp (Defendant) for
                breach of the Master Freight Agreement.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Role & Audio Settings */}
            <div className="space-y-6">

              {/* Role Selection — derived from real parties */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Select Your Advocacy Role
                </span>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('plaintiff_counsel')}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                      selectedRole === 'plaintiff_counsel'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-foreground">Claimant / Plaintiff Counsel</div>
                      <Badge variant="default" className="text-[9px]">Recommended</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {claimantParty
                        ? `Represent ${claimantParty.name}. ${claimantParty.description}`
                        : 'Represent Nova Systems Ltd. Prove material breach of the freight agreement and claim damages.'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('defendant_counsel')}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                      selectedRole === 'defendant_counsel'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-foreground">Defendant Counsel</div>
                      <Badge variant="outline" className="text-[9px]">Alternative</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {defendantParty
                        ? `Represent ${defendantParty.name}. ${defendantParty.description}`
                        : 'Represent Solis Logistics Corp. Argue force majeure and absence of timely notice.'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Judicial Rigor & Difficulty
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedDifficulty(lvl)}
                      className={`py-2 px-3 rounded-lg border text-center text-xs font-medium capitalize transition-all ${
                        selectedDifficulty === lvl
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio & Interaction Mode */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Mic className="w-4 h-4 text-primary" />
                    <span>Voice Interaction Mode</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isVoiceMode}
                    onChange={(e) => setVoiceMode(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  When enabled, you speak into your microphone and the AI Judge responds via natural speech synthesis.
                </p>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Speech Audio Out</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSpeechSynthesisEnabled(!speechSynthesisEnabled)}
                    className="h-7 px-2 text-xs gap-1"
                  >
                    {speechSynthesisEnabled ? <Volume2 className="w-3.5 h-3.5 text-primary" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>{speechSynthesisEnabled ? 'Enabled' : 'Muted'}</span>
                  </Button>
                </div>
              </div>

              {/* Start Proceeding Button */}
              <Button
                size="lg"
                onClick={handleEnterCourtroom}
                disabled={isRealSession && isDossierLoading}
                className="w-full h-12 text-sm font-semibold gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-md"
              >
                {isRealSession && isDossierLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Loading Dossier…</span></>
                ) : (
                  <><Gavel className="w-4 h-4" /><span>Enter Courtroom & Begin Hearing</span><ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>

            {/* Middle & Right Column: Core Dossier & Evidence Preview */}
            <div className="lg:col-span-2 space-y-6">

              {/* Parties */}
              {caseData?.parties && caseData.parties.length > 0 && (
                <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                  <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    Parties to the Proceedings
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {caseData.parties.map((party) => (
                      <div key={party.id} className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px]">{party.role}</Badge>
                          <span className="font-semibold text-xs text-foreground">{party.name}</span>
                        </div>
                        {party.description && (
                          <p className="text-[11px] text-muted-foreground">{party.description}</p>
                        )}
                        {party.counsel && (
                          <p className="text-[11px] text-muted-foreground">Counsel: {party.counsel}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pleadings Summary — real agreed facts */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    Agreed Facts & Chronology
                  </span>
                  <Button variant="ghost" size="sm" onClick={openCaseFileModal} className="h-7 text-xs text-primary">
                    View Full Docket
                  </Button>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  {caseData?.facts && caseData.facts.length > 0 ? (
                    caseData.facts.map((fact) => (
                      <div key={fact.id} className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                        {fact.isAgreed && (
                          <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider mr-2">Agreed ·</span>
                        )}
                        {fact.description}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No agreed facts available from the backend dossier.</p>
                  )}
                </div>
              </div>

              {/* Legal Issues */}
              {caseData?.legalIssues && caseData.legalIssues.length > 0 && (
                <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                  <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    Key Legal Issues in Dispute
                  </span>
                  <ul className="space-y-2">
                    {caseData.legalIssues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] shrink-0">
                          {idx + 1}
                        </span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Witnesses */}
              {caseData?.witnesses && caseData.witnesses.length > 0 && (
                <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                  <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    Witnesses Scheduled to Give Evidence
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {caseData.witnesses.map((w) => (
                      <div key={w.id} className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                        <div className="font-semibold text-xs text-foreground">{w.name}</div>
                        <div className="text-[10px] text-primary font-medium">{w.role}</div>
                        {w.background && <p className="text-[11px] text-muted-foreground">{w.background}</p>}
                        {(w.statementSummary) && (
                          <p className="text-[11px] text-muted-foreground italic">&ldquo;{w.statementSummary}&rdquo;</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Exhibits Ready to Tender */}
              {caseData?.evidence && caseData.evidence.length > 0 && (
                <div className="space-y-3">
                  <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    Exhibits in Case Bundle
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {caseData.evidence.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openEvidenceViewer(item)}
                        className="p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {item.exhibitNumber || item.referenceNumber || item.id}
                          </Badge>
                          {item.date && <span className="text-[10px] text-muted-foreground">{item.date}</span>}
                        </div>
                        <div className="font-semibold text-xs text-foreground line-clamp-1">{item.title}</div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (

        /* ════════════════════════════════════════════════════════════ */
        /* VIEW B: LIVE VIRTUAL COURTROOM PROCEEDING INTERFACE          */
        /* ════════════════════════════════════════════════════════════ */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* ── LEFT / MAIN COURTROOM STAGE ── */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-border bg-background">

            {/* Proceeding Top Control Bar */}
            <div className="p-3 sm:px-6 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between gap-4">

              {/* Stage Tracker */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-serif font-bold text-sm">
                  {courtroomStage + 1}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">{currentStageName}</span>
                    <Badge variant="outline" className="text-[9px] font-mono">Stage {courtroomStage + 1}/6</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">
                    {currentStageDesc}
                  </p>
                </div>
              </div>

              {/* Timer & Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted font-mono text-xs font-semibold text-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{formatTimer(sessionTimerSeconds)}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => isCourtroomPaused ? resumeCourtroomSession() : pauseCourtroomSession()}
                  className="h-8 w-8 text-muted-foreground"
                >
                  {isCourtroomPaused ? <Play className="w-4 h-4 text-emerald-500 fill-current" /> : <Pause className="w-4 h-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSpeechSynthesisEnabled(!speechSynthesisEnabled)}
                  className="h-8 w-8 text-muted-foreground"
                >
                  {speechSynthesisEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-destructive" />}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleFinishProceeding}
                  className="text-xs h-8 gap-1.5 border-border hover:bg-destructive/10 hover:text-destructive"
                >
                  <span>Conclude</span>
                </Button>
              </div>
            </div>

            {/* ── 3D-STYLE VIRTUAL BENCH & PARTICIPANT PODIUMS ── */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 flex flex-col justify-between">

              {/* Row 1: THE JUDICIAL BENCH (Presiding Judge) */}
              <div className="flex justify-center">
                <div
                  className={`w-full max-w-lg p-4 rounded-2xl border transition-all ${
                    activeSpeakerId === 'part-judge'
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-2 ring-primary/40'
                      : 'border-border bg-card/80 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        <Gavel className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">Presiding Judge</div>
                        <div className="text-[10px] text-muted-foreground">Commercial Court</div>
                      </div>
                    </div>
                    {activeSpeakerId === 'part-judge' && (
                      <Badge className="bg-primary text-primary-foreground text-[9px] animate-pulse">
                        Speaking to Court
                      </Badge>
                    )}
                  </div>

                  {/* Audio Waveform Animation when Judge speaks */}
                  {activeSpeakerId === 'part-judge' && (
                    <div className="flex items-center justify-center gap-1 py-2">
                      {[16, 28, 12, 32, 20, 36, 14, 24, 30, 18].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h}px` }}
                          className="w-1 bg-primary rounded-full animate-bounce"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: OPPOSING COUNSEL & WITNESS BOX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">

                {/* Opposing Counsel Podium — generic role, no invented name */}
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    activeSpeakerId === 'part-opp-counsel'
                      ? 'border-destructive bg-destructive/10 shadow-md ring-2 ring-destructive/40'
                      : 'border-border bg-card/80 opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-destructive/15 text-destructive flex items-center justify-center font-bold text-xs">
                        OC
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {selectedRole === 'plaintiff_counsel'
                            ? (defendantParty?.counsel || 'Defendant Counsel')
                            : (claimantParty?.counsel || 'Claimant Counsel')}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {selectedRole === 'plaintiff_counsel' ? 'Defendant Counsel' : 'Claimant Counsel'}
                        </div>
                      </div>
                    </div>
                    {activeSpeakerId === 'part-opp-counsel' && (
                      <Badge variant="destructive" className="text-[9px] animate-pulse">
                        Speaking
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Witness Box — real witness from dossier */}
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    activeSpeakerId === 'part-witness'
                      ? 'border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/40'
                      : 'border-border bg-card/80 opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold text-xs">
                        {witness1 ? getInitials(witness1.name) : 'W'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {witness1?.name || 'Witness'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {witness1?.role || 'Witness Box'}
                        </div>
                      </div>
                    </div>
                    {activeSpeakerId === 'part-witness' && (
                      <Badge className="bg-amber-500 text-white text-[9px] animate-pulse">
                        Giving Evidence
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: STUDENT ADVOCATE PODIUM (You) */}
              <div className="flex justify-center">
                <div
                  className={`w-full max-w-md p-3.5 rounded-xl border text-center transition-all ${
                    activeSpeakerId === 'part-student'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/40'
                      : 'border-border bg-card/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                        YO
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-foreground">You (Advocate)</div>
                        <div className="text-[10px] text-muted-foreground">
                          {selectedRole === 'plaintiff_counsel' ? 'Claimant Counsel Podium' : 'Defendant Counsel Podium'}
                        </div>
                      </div>
                    </div>
                    {activeSpeakerId === 'part-student' && (
                      <Badge className="bg-emerald-600 text-white text-[9px]">
                        At the Lectern
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── BOTTOM ADVOCACY ACTION DOCK ── */}
            <div className="p-3 sm:p-4 border-t border-border bg-card/80 backdrop-blur-md space-y-3">

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => advanceStage()}
                    disabled={courtroomStage >= 5}
                    className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Advance Stage</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={openObjectionModal}
                    className="text-xs font-semibold gap-1.5 shadow-xs"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>Raise Objection</span>
                  </Button>

                  {caseData?.evidence && caseData.evidence.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEvidenceViewer(caseData.evidence[0])}
                      className="text-xs gap-1.5 border-border"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Tender Exhibit</span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openCaseFileModal}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1" />
                    <span>Docket</span>
                  </Button>
                </div>
              </div>

              {turnError && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{turnError}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setTurnError(null)}
                    className="text-[10px] underline hover:opacity-80 shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Text Submission Form */}
              <form onSubmit={handleStudentSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Type your submission to the Court…"
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (turnError) setTurnError(null);
                    }}
                    disabled={isSubmittingTurn}
                    className="h-10 text-xs pl-3 pr-10"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputText.trim() || isSubmittingTurn}
                    className="absolute right-1 top-1 h-8 w-8 text-primary-foreground"
                  >
                    {isSubmittingTurn ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* ── RIGHT COLLAPSIBLE DOCK: TRANSCRIPT & EVIDENCE ── */}
          <div className="w-full lg:w-96 flex flex-col bg-card/50 border-t lg:border-t-0 lg:border-l border-border h-72 lg:h-auto overflow-hidden">

            <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as 'transcript' | 'evidence' | 'notes')} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-3 h-10 w-full rounded-none border-b border-border bg-muted/40 p-1">
                <TabsTrigger value="transcript" className="text-xs">Live Transcript</TabsTrigger>
                <TabsTrigger value="evidence" className="text-xs">Exhibits</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs">Witnesses</TabsTrigger>
              </TabsList>

              {/* TAB 1: LIVE TRANSCRIPT */}
              <TabsContent value="transcript" className="flex-1 overflow-y-auto p-3 space-y-3 m-0 text-xs">
                {liveTranscript.length === 0 && (
                  <p className="text-center text-muted-foreground text-[11px] py-6">
                    The transcript will appear here as the proceeding progresses.
                  </p>
                )}
                {liveTranscript.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-xl border space-y-1 ${
                      entry.speakerId === 'part-judge'
                        ? 'border-primary/30 bg-primary/5'
                        : entry.speakerId === 'part-student'
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : entry.speakerId === 'part-opp-counsel'
                        ? 'border-destructive/30 bg-destructive/5'
                        : 'border-amber-500/30 bg-amber-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-foreground">{entry.speakerName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{entry.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {entry.text}
                    </p>
                    {entry.isKeyMoment && (
                      <div className="pt-1 flex items-center gap-1 text-[9px] font-semibold text-primary">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Recorded as Key Moment in Evaluation</span>
                      </div>
                    )}
                  </div>
                ))}

                {recordedObjections.length > 0 && (
                  <div className="pt-2 border-t border-border space-y-2">
                    <div className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
                      Recorded Objections ({recordedObjections.length})
                    </div>
                    {recordedObjections.map((obj) => (
                      <div key={obj.id} className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground capitalize">{obj.type}</span>
                          <Badge variant="outline" className="text-[9px] capitalize">{obj.ruling}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{obj.reasoning}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div ref={transcriptEndRef} />
              </TabsContent>

              {/* TAB 2: ADMITTED EXHIBITS — real dossier documents */}
              <TabsContent value="evidence" className="flex-1 overflow-y-auto p-3 space-y-2.5 m-0 text-xs">
                <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-2">
                  Case Bundle Exhibits
                </div>
                {(!caseData?.evidence || caseData.evidence.length === 0) ? (
                  <p className="text-muted-foreground text-[11px] italic">No exhibits available in the case bundle.</p>
                ) : (
                  caseData.evidence.map((item) => {
                    const isAdmitted = admittedEvidenceIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => openEvidenceViewer(item)}
                        className="p-3 rounded-lg border border-border bg-background hover:border-primary/40 cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-foreground text-xs">
                            {item.exhibitNumber || item.referenceNumber || item.id}
                          </span>
                          <Badge variant={isAdmitted ? 'default' : 'secondary'} className="text-[9px]">
                            {isAdmitted ? 'Admitted' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="font-medium text-foreground">{item.title}</div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                    );
                  })
                )}
              </TabsContent>

              {/* TAB 3: WITNESSES — real witness profiles */}
              <TabsContent value="notes" className="flex-1 overflow-y-auto p-3 space-y-3 m-0 text-xs">
                <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-2">
                  Witness Profiles
                </div>
                {(!caseData?.witnesses || caseData.witnesses.length === 0) ? (
                  <p className="text-muted-foreground text-[11px] italic">No witness information available.</p>
                ) : (
                  caseData.witnesses.map((w) => (
                    <div key={w.id} className="p-3 rounded-lg border border-border bg-background space-y-1">
                      <div className="font-semibold text-foreground">{w.name}</div>
                      <span className="text-[10px] font-medium text-primary">{w.role}</span>
                      {w.background && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{w.background}</p>
                      )}
                      {w.statementSummary && (
                        <p className="text-[11px] text-muted-foreground italic">&ldquo;{w.statementSummary}&rdquo;</p>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {/* Global Courtroom Modals */}
      <ObjectionModal />
      <EvidenceViewerModal />
      <CaseFileModal />
    </div>
  );
}
