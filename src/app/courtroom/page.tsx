'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scale, Mic, MicOff, Volume2, VolumeX, Play, Pause,
  RotateCcw, Gavel, FileText, ChevronRight, CheckCircle2,
  Users, AlertTriangle, Sparkles, BookOpen, Send, Clock,
  ArrowRight, Shield, Award, HelpCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COURTROOM_SCRIPT } from '@/data/courtroom-script';
import { mockCaseFiles, mockSimulations } from '@/data/mock-data';
import { ObjectionModal } from '@/components/courtroom/ObjectionModal';
import { EvidenceViewerModal } from '@/components/legal/EvidenceViewerModal';
import { CaseFileModal } from '@/components/legal/CaseFileModal';
import { speechService } from '@/lib/audio';
import { toast } from 'sonner';

export default function CourtroomPage() {
  const router = useRouter();
  const {
    activeSimulation,
    activeCaseFile,
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
    resetCourtroomSession
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [scriptLineIndex, setScriptLineIndex] = useState(0);
  const [rightPanelTab, setRightPanelTab] = useState<'transcript' | 'evidence' | 'notes'>('transcript');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isCourtroomActive && !isCourtroomPaused) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCourtroomActive, isCourtroomPaused, tickTimer]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveTranscript]);

  const currentStageData = COURTROOM_SCRIPT[courtroomStage] || COURTROOM_SCRIPT[0];

  // Advance scripted line
  const handleNextScriptLine = () => {
    if (scriptLineIndex < currentStageData.lines.length) {
      const line = currentStageData.lines[scriptLineIndex];
      setActiveSpeaker(line.speakerId);

      addTranscriptEntry({
        id: `tr-${courtroomStage}-${scriptLineIndex}-${Date.now()}`,
        speakerId: line.speakerId,
        speakerName: line.speakerName,
        speakerRole: line.speakerRole,
        text: line.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isKeyMoment: line.isKeyMoment,
      });

      if (speechSynthesisEnabled && !isMicMuted) {
        setIsSpeaking(true);
        speechService.speak(
          line.text,
          line.audioVoiceRole,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }

      setScriptLineIndex(prev => prev + 1);
    } else {
      if (courtroomStage < COURTROOM_SCRIPT.length - 1) {
        advanceStage();
        setScriptLineIndex(0);
        toast.info(`Advancing to Stage: ${COURTROOM_SCRIPT[courtroomStage + 1].stageName}`);
      } else {
        toast.success('Simulation Proceeding Complete! Generating Judicial Scorecard...');
        setTimeout(() => {
          router.push('/performance');
        }, 1200);
      }
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setActiveSpeaker('part-student');
    addTranscriptEntry({
      id: `student-tr-${Date.now()}`,
      speakerId: 'part-student',
      speakerName: 'Alex Morgan',
      speakerRole: 'Claimant Counsel (You)',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isKeyMoment: true,
    });

    setInputText('');

    // Trigger AI response after short pause
    setTimeout(() => {
      handleNextScriptLine();
    }, 1000);
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

  const caseData = activeCaseFile || mockCaseFiles[0];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background text-foreground overflow-hidden">
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* VIEW A: COURTROOM SETUP & CASE DOSSIER MODE                  */}
      {/* ════════════════════════════════════════════════════════════ */}
      {!isCourtroomActive ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="space-y-2 border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {caseData.caseNumber}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {caseData.court}
              </Badge>
              <span className="text-xs text-muted-foreground">• {caseData.jurisdiction}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              {caseData.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {caseData.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Role & Audio Settings */}
            <div className="space-y-6">
              
              {/* Role Selection */}
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
                      Represent Henderson Precision Engineering. Prove repudiatory breach and entitlement to £145,000 lost profits.
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
                      Represent Caldwell Trading Ltd. Argue delivery of defective goods justified immediate contract cancellation.
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
                onClick={() => startCourtroomSession()}
                className="w-full h-12 text-sm font-semibold gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-md"
              >
                <Gavel className="w-4 h-4" />
                <span>Enter Courtroom & Begin Hearing</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Middle & Right Column: Core Dossier & Evidence Preview */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Pleadings Summary */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    Core Pleadings & Agreed Facts
                  </span>
                  <Button variant="ghost" size="sm" onClick={openCaseFileModal} className="h-7 text-xs text-primary">
                    View Full Docket
                  </Button>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <strong className="text-foreground">Contract Date:</strong> 15 January 2024 — Exclusive 3-year supply agreement for specialized precision micro-valves.
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <strong className="text-foreground">Disputed Incident:</strong> 12 March 2025 — Initial batch variance rectified within 48h. Caldwell terminated on 20 April without giving 14 days cure notice.
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <strong className="text-foreground">Governing Law:</strong> Sale of Goods Act 1979 (s 14) • Common Law Breach of Contract & Remoteness (<em>Hadley v Baxendale</em>).
                  </div>
                </div>
              </div>

              {/* Key Exhibits Ready to Tender */}
              <div className="space-y-3">
                <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                  Admissible Exhibits in Case Bundle
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {caseData.evidence.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openEvidenceViewer(item)}
                      className="p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-mono text-[10px]">{item.exhibitNumber}</Badge>
                        <span className="text-[10px] text-muted-foreground">{item.date}</span>
                      </div>
                      <div className="font-semibold text-xs text-foreground line-clamp-1">{item.title}</div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
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
                    <span className="font-bold text-xs text-foreground">{currentStageData.stageName}</span>
                    <Badge variant="outline" className="text-[9px] font-mono">Stage {courtroomStage + 1}/6</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">
                    {currentStageData.stageDescription}
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
                        <div className="text-xs font-bold text-foreground">The Hon. Justice Robert Vance</div>
                        <div className="text-[10px] text-muted-foreground">Presiding Commercial Judge</div>
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
                
                {/* Opposing Counsel Podium */}
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
                        ED
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">Eleanor Davies KC</div>
                        <div className="text-[10px] text-muted-foreground">Defendant Counsel</div>
                      </div>
                    </div>
                    {activeSpeakerId === 'part-opp-counsel' && (
                      <Badge variant="destructive" className="text-[9px] animate-pulse">
                        Speaking
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Witness Box */}
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
                        DH
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">David Henderson</div>
                        <div className="text-[10px] text-muted-foreground">Claimant Witness</div>
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
                        AM
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-foreground">Alex Morgan (You)</div>
                        <div className="text-[10px] text-muted-foreground">Claimant Counsel Podium</div>
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
              
              {/* Action Buttons: Next Dialogue Step, Objection, Tender Evidence, Case File */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleNextScriptLine}
                    className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Next Proceeding Step</span>
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

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEvidenceViewer(caseData.evidence[0])}
                    className="text-xs gap-1.5 border-border"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tender Exhibit</span>
                  </Button>
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

              {/* Text Submission / Voice Input Form */}
              <form onSubmit={handleStudentSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Type your submission to the Court (or click 'Next Proceeding Step')..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="h-10 text-xs pl-3 pr-10"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputText.trim()}
                    className="absolute right-1 top-1 h-8 w-8 text-primary-foreground"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* ── RIGHT COLLAPSIBLE DOCK: TRANSCRIPT & EVIDENCE ── */}
          <div className="w-full lg:w-96 flex flex-col bg-card/50 border-t lg:border-t-0 lg:border-l border-border h-72 lg:h-auto overflow-hidden">
            
            <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-3 h-10 w-full rounded-none border-b border-border bg-muted/40 p-1">
                <TabsTrigger value="transcript" className="text-xs">Live Transcript</TabsTrigger>
                <TabsTrigger value="evidence" className="text-xs">Exhibits</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs">Precedents</TabsTrigger>
              </TabsList>

              {/* TAB 1: LIVE TRANSCRIPT */}
              <TabsContent value="transcript" className="flex-1 overflow-y-auto p-3 space-y-3 m-0 text-xs">
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
                <div ref={transcriptEndRef} />
              </TabsContent>

              {/* TAB 2: ADMITTED EXHIBITS */}
              <TabsContent value="evidence" className="flex-1 overflow-y-auto p-3 space-y-2.5 m-0 text-xs">
                <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-2">
                  Admitted Court Exhibits
                </div>
                {caseData.evidence.map((item) => {
                  const isAdmitted = admittedEvidenceIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => openEvidenceViewer(item)}
                      className="p-3 rounded-lg border border-border bg-background hover:border-primary/40 cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-foreground text-xs">{item.exhibitNumber}</span>
                        <Badge variant={isAdmitted ? 'default' : 'secondary'} className="text-[9px]">
                          {isAdmitted ? 'Admitted' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="font-medium text-foreground">{item.title}</div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>
                  );
                })}
              </TabsContent>

              {/* TAB 3: LEGAL PRECEDENTS */}
              <TabsContent value="notes" className="flex-1 overflow-y-auto p-3 space-y-3 m-0 text-xs">
                <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-2">
                  Governing Statutes & Precedents
                </div>
                {(caseData.provisions || caseData.applicableLaw || []).map((prov) => (
                  <div key={prov.id} className="p-3 rounded-lg border border-border bg-background space-y-1">
                    <span className="font-semibold text-primary">{prov.statuteName || prov.title} — {prov.sectionNumber || prov.section || 'General'}</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{prov.relevance || prov.text || 'Governing precedent.'}</p>
                  </div>
                ))}
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
