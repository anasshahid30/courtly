'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Mic,
  BookOpen,
  BarChart3,
  Clock,
  ShieldCheck,
  Play,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  FileText,
  UserPlus,
  Plus,
  Search,
  Filter,
  Users,
  Building,
  Sliders,
  ChevronRight,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { LevelSelector } from '@/components/legal/LevelSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { mockSimulations, mockPerformanceReports } from '@/data/mock-data';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    isGuestMode,
    currentLevel,
    levels,
    guestSession,
    guestPerformance,
    openAuthModal,
    startCourtroomSession,
    setActiveSimulation,
  } = useAppStore();

  const [selectedPracticeLevel, setSelectedPracticeLevel] = useState<number>(
    isGuestMode ? 1 : currentLevel
  );
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  const currentLevelObj = levels.find((l) => l.levelNumber === currentLevel) || levels[2];
  const selectedLevelObj = levels.find((l) => l.levelNumber === selectedPracticeLevel) || levels[0];

  // Filter simulations based on selected practice level
  const filteredSimulations = mockSimulations.filter((sim) => {
    if (selectedPracticeLevel === 1) return sim.difficulty === 'beginner';
    if (selectedPracticeLevel === 2) return sim.difficulty === 'beginner' || sim.difficulty === 'intermediate';
    if (selectedPracticeLevel === 3) return sim.difficulty === 'intermediate';
    return sim.difficulty === 'advanced';
  }).slice(0, 3);

  const handleLaunchSimulation = (simId?: string) => {
    const targetSim = mockSimulations.find((s) => s.id === simId) || mockSimulations[0];
    setActiveSimulation(targetSim);
    startCourtroomSession(targetSim.id);
    router.push('/courtroom');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      
      {/* ── Dashboard Sub-Header ── */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-xs sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-foreground">
                  {currentUser?.role === 'administrator'
                    ? 'Administrator Management Portal'
                    : isGuestMode || !isAuthenticated
                    ? 'Guest Practice Dashboard'
                    : `${currentUser?.fullName}'s Dashboard`}
                </h1>
                {isGuestMode && (
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5">
                    Guest Mode
                  </Badge>
                )}
                {currentUser?.role === 'administrator' && (
                  <Badge className="text-[10px] bg-primary text-primary-foreground">
                    Admin Access
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Common Law Advocacy Curriculum • England & Wales
              </p>
            </div>
          </div>

          {/* Quick Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Button
              variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="text-xs h-8 px-3 font-medium"
            >
              Dashboard
            </Button>
            <Link
              href="/courtroom"
              className="text-xs h-8 px-3 font-medium text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors"
            >
              Virtual Courtroom
            </Link>
            <Link
              href="/workspace"
              className="text-xs h-8 px-3 font-medium text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors"
            >
              Legal Workspace
            </Link>
            <Link
              href="/performance"
              className="text-xs h-8 px-3 font-medium text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors"
            >
              My Performance
            </Link>
            <Button
              variant={activeTab === 'history' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('history')}
              className="text-xs h-8 px-3 font-medium text-muted-foreground hover:text-foreground"
            >
              History
            </Button>
            {currentUser?.role === 'administrator' && (
              <Button
                variant={activeTab === 'admin' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('admin')}
                className="text-xs h-8 px-3 font-medium text-primary hover:text-primary"
              >
                Admin Portal
              </Button>
            )}
          </div>

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ══════════════════════════════════════════════════════════
            TAB: OVERVIEW (GUEST vs REGISTERED)
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* ── GUEST DASHBOARD VIEW ── */}
            {isGuestMode || !isAuthenticated ? (
              <div className="space-y-8">
                
                {/* Guest Welcome Banner */}
                <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-muted/20 space-y-4">
                  <div className="max-w-2xl space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Instant Guest Practice
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                      Welcome to Courtly
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Choose your preferred advocacy level and start practicing immediately. No account or credentials required.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Button
                      onClick={() => handleLaunchSimulation()}
                      className="text-xs font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 h-auto"
                    >
                      <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                      Start Courtroom Simulation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openAuthModal('register')}
                      className="text-xs font-medium border-border hover:bg-muted/50 px-4 py-2.5 h-auto"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-2" />
                      Save Progress (Create Free Account)
                    </Button>
                  </div>
                </div>

                {/* Level Selection Component */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Select Practice Difficulty</h3>
                      <p className="text-xs text-muted-foreground">
                        Select any level to preview matching courtroom scenarios and legal challenges.
                      </p>
                    </div>
                  </div>
                  <LevelSelector
                    selectedLevel={selectedPracticeLevel}
                    onSelectLevel={(lvl) => setSelectedPracticeLevel(lvl)}
                  />
                </div>

                {/* Recommended Simulations for Selected Level */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Recommended Simulations for Level {selectedPracticeLevel}: {selectedLevelObj.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{selectedLevelObj.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredSimulations.map((sim) => (
                      <div
                        key={sim.id}
                        className="p-5 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 shadow-xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                              {sim.domain || sim.legalDomain?.name || 'Commercial Law'}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {sim.estimatedDurationMinutes || sim.estimatedDuration || 18} mins
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground leading-snug">{sim.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{sim.description}</p>
                        </div>

                        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-primary capitalize">
                            {sim.difficulty}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleLaunchSimulation(sim.id)}
                            className="text-xs h-8 px-3"
                          >
                            <Play className="w-3 h-3 mr-1.5 fill-current" />
                            Enter Courtroom
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Guest Performance (if exists) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Recent Session Evaluation</h3>
                  {guestPerformance ? (
                    <div className="p-6 rounded-xl border border-border/80 bg-card space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                        <div>
                          <p className="text-xs font-semibold text-foreground">Session: {guestPerformance.simulationTitle}</p>
                          <p className="text-[11px] text-muted-foreground">Evaluated under English Common Law Rubric</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold font-serif text-primary">{guestPerformance.overallScore}%</span>
                          <span className="text-xs text-muted-foreground">Overall Score</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                          <span className="font-semibold text-foreground">Observed Strengths:</span>
                          <p className="text-muted-foreground">{guestPerformance.strengthsSummary || guestPerformance.strengths?.[0]}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                          <span className="font-semibold text-foreground">Areas for Improvement:</span>
                          <p className="text-muted-foreground">{guestPerformance.areasForImprovementSummary || guestPerformance.improvements?.[0]}</p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Link
                          href="/performance"
                          className="text-xs font-medium border border-border rounded-lg px-3 py-1.5 hover:bg-muted/50 transition-colors inline-flex items-center"
                        >
                          View Full Performance Scorecard
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-border/80 bg-muted/10 text-center space-y-2">
                      <p className="text-xs font-medium text-foreground">No Practice Sessions Completed Yet</p>
                      <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                        Launch a simulation above to practice oral submissions and receive instant judicial rubric scoring.
                      </p>
                    </div>
                  )}
                </div>

                {/* Save Progress Prompt */}
                <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">Want to save your simulations and track milestones?</p>
                    <p className="text-[11px] text-muted-foreground">
                      Create a free student account to retain your historical scores, research notes, and earn verifiable certificates.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openAuthModal('register')}
                    className="text-xs whitespace-nowrap"
                  >
                    Create Account
                  </Button>
                </div>

              </div>
            ) : (
              /* ── REGISTERED STUDENT DASHBOARD VIEW ── */
              <div className="space-y-8">
                
                {/* 1. Welcome & Level Progress Banner */}
                <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-muted/20 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Student Practice Portal
                      </span>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                        Welcome back, {currentUser?.fullName}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {currentUser?.institution} • {currentUser?.degreeProgram || 'LLB Law'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-muted/60 px-4 py-2.5 rounded-xl border border-border/60">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-serif text-sm font-bold text-primary">
                        L{currentLevel}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{currentUser?.levelTitle}</p>
                        <p className="text-[11px] text-muted-foreground">Level {currentLevel} of 5</p>
                      </div>
                    </div>
                  </div>

                  {/* Level Progress Bar & Next Milestone */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">Level {currentLevel} Milestone Progression</span>
                      <span className="text-primary font-semibold">{currentLevelObj.progressPercentage}% Complete</span>
                    </div>
                    <Progress value={currentLevelObj.progressPercentage} className="h-2" />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Next milestone: {currentLevelObj.milestones.find(m => !m.isCompleted)?.title || 'Final Assessment'}</span>
                      <span>Min passing score: {currentLevelObj.minPassingScore}%</span>
                    </div>
                  </div>
                </div>

                {/* 2. Quick Key Statistics (4 Clean Cards) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                    <span className="text-[11px] text-muted-foreground">Simulations Completed</span>
                    <p className="text-2xl font-bold font-serif text-foreground">{currentUser?.completedSimulations || 12}</p>
                    <span className="text-[10px] text-muted-foreground">Across 3 domains</span>
                  </div>

                  <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                    <span className="text-[11px] text-muted-foreground">Practice Hours</span>
                    <p className="text-2xl font-bold font-serif text-foreground">{currentUser?.totalPracticeHours || 28.5}h</p>
                    <span className="text-[10px] text-muted-foreground">Oral advocacy practice</span>
                  </div>

                  <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                    <span className="text-[11px] text-muted-foreground">Average Judicial Score</span>
                    <p className="text-2xl font-bold font-serif text-primary">{currentUser?.averageScore || 74}%</p>
                    <span className="text-[10px] text-muted-foreground">+6% from last term</span>
                  </div>

                  <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                    <span className="text-[11px] text-muted-foreground">Current Level</span>
                    <p className="text-2xl font-bold font-serif text-foreground">Level {currentLevel}</p>
                    <span className="text-[10px] text-muted-foreground">{currentUser?.levelTitle}</span>
                  </div>
                </div>

                {/* 3. Level Selection Component */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Learning Levels & Practice Difficulty</h3>
                      <p className="text-xs text-muted-foreground">
                        Select your active practice tier to view curriculum simulations and assessment milestones.
                      </p>
                    </div>
                  </div>
                  <LevelSelector
                    selectedLevel={selectedPracticeLevel}
                    onSelectLevel={(lvl) => setSelectedPracticeLevel(lvl)}
                  />
                </div>

                {/* 4. Continue Practicing & Recommended Simulations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Last Unfinished / Priority Simulation */}
                  <div className="lg:col-span-1 p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        Continue Practicing
                      </span>
                      <h4 className="text-base font-semibold text-foreground">
                        Henderson v Caldwell Trading Ltd
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Commercial contract dispute concerning fitness for purpose under Sale of Goods Act 1979 s.14(2).
                      </p>
                      <div className="pt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>Commercial Law</span>
                        <span>•</span>
                        <span>Stage 4 of 6</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleLaunchSimulation('sim-1')}
                      className="w-full text-xs font-semibold shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                      Resume Courtroom Hearing
                    </Button>
                  </div>

                  {/* Recommended Practice for Current Level */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Recommended Practice (Level {selectedPracticeLevel})
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredSimulations.slice(0, 2).map((sim) => (
                        <div
                          key={sim.id}
                          className="p-4 rounded-xl border border-border/60 bg-card hover:border-border transition-colors space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                                {sim.domain || sim.legalDomain?.name || 'Commercial Law'}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {sim.estimatedDurationMinutes || sim.estimatedDuration || 18}m
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-foreground">{sim.title}</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">{sim.description}</p>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLaunchSimulation(sim.id)}
                            className="w-full text-xs h-8"
                          >
                            Practice Scenario
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 5. Recent Sessions Table & Performance Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Recent Sessions List */}
                  <div className="lg:col-span-2 rounded-xl border border-border/70 bg-card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Recent Courtroom Sessions</h3>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {mockPerformanceReports.slice(0, 3).map((report) => (
                        <div
                          key={report.id}
                          className="p-3 rounded-lg border border-border/40 bg-muted/20 flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground">{report.simulationTitle}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {report.domain || 'Commercial Law'} • Completed 2026-03-08
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="font-bold font-serif text-primary text-sm">{report.overallScore}%</span>
                              <p className="text-[10px] text-muted-foreground">Rubric Score</p>
                            </div>
                            <Link
                              href="/performance"
                              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-md hover:bg-muted/60 transition-colors"
                            >
                              Review
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Summary Preview Card */}
                  <div className="rounded-xl border border-border/70 bg-card p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Advocacy Competencies</h3>
                      <div className="space-y-2.5 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">Legal Analysis</span>
                            <span className="font-medium text-foreground">82%</span>
                          </div>
                          <Progress value={82} className="h-1.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">Courtroom Etiquette</span>
                            <span className="font-medium text-foreground">90%</span>
                          </div>
                          <Progress value={90} className="h-1.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">Evidence Tendering</span>
                            <span className="font-medium text-foreground">75%</span>
                          </div>
                          <Progress value={75} className="h-1.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">Objection Handling</span>
                            <span className="font-medium text-foreground">68%</span>
                          </div>
                          <Progress value={68} className="h-1.5" />
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/performance"
                      className="w-full text-xs border border-border rounded-lg py-2 inline-flex items-center justify-center hover:bg-muted/50 transition-colors text-foreground font-medium"
                    >
                      View Full Performance Analytics
                    </Link>
                  </div>

                </div>

              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB: HISTORY
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Simulation & Session History</h2>
                <p className="text-xs text-muted-foreground">
                  Review past courtroom proceedings, transcripts, judicial rulings, and case briefs.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {mockPerformanceReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-xl border border-border/70 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {report.domain || 'Commercial Law'}
                      </span>
                      <span className="text-muted-foreground text-[11px]">Duration: 18 mins</span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">{report.simulationTitle}</h4>
                    <p className="text-muted-foreground line-clamp-1">
                      {report.strengthsSummary || report.strengths?.[0] || 'Competent legal submissions'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-bold font-serif text-primary">{report.overallScore}%</span>
                      <p className="text-[10px] text-muted-foreground">Judicial Score</p>
                    </div>
                    <Link
                      href="/performance"
                      className="text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-muted/50 transition-colors inline-flex items-center"
                    >
                      View Scorecard
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB: ADMIN PORTAL (PROTECTED / FACULTY VIEW)
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'admin' && currentUser?.role === 'administrator' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Faculty & Administration Workspace</h2>
                <p className="text-xs text-muted-foreground">
                  Manage academic cohorts, courtroom scenario parameters, statutory knowledge bases, and grading rubrics.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => toast.success('New scenario wizard opened')} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Create Simulation
                </Button>
              </div>
            </div>

            {/* Admin Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                <span className="text-[11px] text-muted-foreground">Active Students</span>
                <p className="text-2xl font-bold font-serif text-foreground">142</p>
                <span className="text-[10px] text-muted-foreground">Across 4 cohorts</span>
              </div>
              <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                <span className="text-[11px] text-muted-foreground">Published Scenarios</span>
                <p className="text-2xl font-bold font-serif text-foreground">18</p>
                <span className="text-[10px] text-muted-foreground">Common Law (UK/US)</span>
              </div>
              <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                <span className="text-[11px] text-muted-foreground">Ingested Statutes</span>
                <p className="text-2xl font-bold font-serif text-foreground">24</p>
                <span className="text-[10px] text-muted-foreground">RAG Vector Indexed</span>
              </div>
              <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                <span className="text-[11px] text-muted-foreground">System Health</span>
                <p className="text-2xl font-bold font-serif text-primary">99.4%</p>
                <span className="text-[10px] text-muted-foreground">AI Evaluation Operational</span>
              </div>
            </div>

            {/* Student Roster Table */}
            <div className="rounded-xl border border-border/70 bg-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">Student Cohort Management</h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search student or email..."
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/60 text-muted-foreground bg-muted/20">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Student Name</th>
                      <th className="py-2.5 px-3 font-medium">Institution</th>
                      <th className="py-2.5 px-3 font-medium">Level</th>
                      <th className="py-2.5 px-3 font-medium">Simulations</th>
                      <th className="py-2.5 px-3 font-medium">Avg Score</th>
                      <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-foreground">
                    <tr>
                      <td className="py-3 px-3 font-semibold">Alex Morgan</td>
                      <td className="py-3 px-3 text-muted-foreground">Commonwealth Law School</td>
                      <td className="py-3 px-3"><Badge variant="outline" className="text-[10px]">Level 3</Badge></td>
                      <td className="py-3 px-3">12</td>
                      <td className="py-3 px-3 font-semibold text-primary">74%</td>
                      <td className="py-3 px-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast.info('Viewing Alex Morgan dossier')} className="h-7 text-xs">
                          Inspect
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">Sarah Jenkins</td>
                      <td className="py-3 px-3 text-muted-foreground">King&apos;s College London</td>
                      <td className="py-3 px-3"><Badge variant="outline" className="text-[10px]">Level 4</Badge></td>
                      <td className="py-3 px-3">19</td>
                      <td className="py-3 px-3 font-semibold text-primary">88%</td>
                      <td className="py-3 px-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast.info('Viewing Sarah Jenkins dossier')} className="h-7 text-xs">
                          Inspect
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">David Chen</td>
                      <td className="py-3 px-3 text-muted-foreground">Oxford Faculty of Law</td>
                      <td className="py-3 px-3"><Badge variant="outline" className="text-[10px]">Level 2</Badge></td>
                      <td className="py-3 px-3">7</td>
                      <td className="py-3 px-3 font-semibold text-primary">69%</td>
                      <td className="py-3 px-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast.info('Viewing David Chen dossier')} className="h-7 text-xs">
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
