'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scale, Mic, BookOpen, BarChart3, Search, Filter,
  Play, Clock, Award, Flame, CheckCircle2, ChevronRight,
  Building2, Users, FilePlus, Sparkles, Database, Shield,
  ArrowUpRight, AlertCircle, RefreshCw, UploadCloud, Gavel,
  Lock, Check, Star, UserCheck, ArrowRight, UserPlus
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDomains, mockSimulations, mockPerformanceReports } from '@/data/mock-data';
import { mockAdvocacyLevels, mockAchievements, mockCertificates } from '@/data/learning-levels';
import { AuthModal } from '@/components/auth/AuthModal';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { CaseFileModal } from '@/components/legal/CaseFileModal';
import { TransferSessionModal } from '@/components/auth/TransferSessionModal';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    isGuestMode,
    currentLevel,
    levelProgressPercentage,
    levels,
    achievements,
    certificates,
    updateMilestoneStatus,
    setActiveSimulation,
    startCourtroomSession,
    openCaseFileModal,
    openOnboarding,
    openAuthModal,
    loginAsStudent
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<string>('journey');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState(3);

  // Filtered simulations
  const filteredSimulations = mockSimulations.filter((sim) => {
    const matchesSearch =
      sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDomain = selectedDomain === 'all' || sim.legalDomain.slug === selectedDomain || sim.legalDomain.id === selectedDomain;
    const matchesDiff = selectedDifficulty === 'all' || sim.difficulty === selectedDifficulty;
    return matchesSearch && matchesDomain && matchesDiff;
  });

  const handleLaunchSim = (sim: typeof mockSimulations[0]) => {
    setActiveSimulation(sim);
    startCourtroomSession(sim.id);
    router.push('/courtroom');
  };

  const handleInspectCase = (sim: typeof mockSimulations[0]) => {
    setActiveSimulation(sim);
    openCaseFileModal();
  };

  const currentLevelData = levels.find((l) => l.levelNumber === currentLevel) || levels[2];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* 1. GUEST MODE HEADER OR REGISTERED STUDENT PROFILE STRIP    */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="border-b border-border bg-card/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* GUEST MODE BANNER */}
          {(!isAuthenticated || isGuestMode) ? (
            <div className="p-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-mono">
                    Guest Mode
                  </Badge>
                  <span className="text-xs text-muted-foreground">Temporary Browser Session</span>
                </div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  Welcome to Courtly Virtual Legal Practice
                </h1>
                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  You are exploring in open guest access. Try simulations and receive instant judicial scoring. <strong>Save your progress</strong> by creating a free account to unlock persistent level milestones.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => openAuthModal('register')}
                  className="gap-1.5 text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account & Save</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loginAsStudent()}
                  className="gap-1.5 text-xs border-border"
                >
                  <span>Demo Student Profile</span>
                </Button>
              </div>
            </div>
          ) : (
            
            /* REGISTERED STUDENT PROFILE HEADER */
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                      Welcome back, {currentUser.fullName}
                    </h1>
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-mono">
                      Level {currentLevel}: {currentLevelData.title}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{currentUser.institution || 'Commonwealth Law School'}</span>
                    <span>•</span>
                    <span>{currentUser.degreeProgram || 'LLB Third Year'}</span>
                    <span>•</span>
                    <span className="text-primary font-medium">{currentUser.preferredJurisdiction || 'England & Wales'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openOnboarding}
                    className="text-xs border-border gap-1.5"
                  >
                    <span>Practice Goals</span>
                  </Button>
                  <Link href="/courtroom">
                    <Button size="sm" className="text-xs font-semibold gap-1.5 bg-primary shadow-xs">
                      <Mic className="w-3.5 h-3.5" />
                      <span>Launch Courtroom</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 4 Core Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Current Level</span>
                    <div className="text-lg font-bold text-primary flex items-center gap-1">
                      <span>Level 0{currentLevel}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{levelProgressPercentage}% to Level {currentLevel + 1}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Practice Hours</span>
                    <div className="text-lg font-bold text-foreground">{currentUser.totalPracticeHours}h</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+3.2h this week</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Advocate Average</span>
                    <div className="text-lg font-bold text-primary">{currentUser.averageScore}%</div>
                    <div className="text-[10px] text-muted-foreground">First Class Honours</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Gavel className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Advocacy Streak</span>
                    <div className="text-lg font-bold text-amber-500 flex items-center gap-1">
                      <span>{currentUser.currentStreak} Days</span>
                      <Flame className="w-4 h-4 fill-current" />
                    </div>
                    <div className="text-[10px] text-muted-foreground">Active practice record</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN DASHBOARD CONTENT TABS                              */}
      {/* ════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="journey" className="text-xs gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>My Learning Journey</span>
              </TabsTrigger>
              <TabsTrigger value="simulations" className="text-xs gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Practice Simulations</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Session History</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Achievements</span>
              </TabsTrigger>
              <TabsTrigger value="certificates" className="text-xs gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Certifications</span>
              </TabsTrigger>
              {currentUser.role === 'educator' && (
                <TabsTrigger value="educator" className="text-xs gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Educator Portal</span>
                </TabsTrigger>
              )}
            </TabsList>

            <div className="text-xs text-muted-foreground hidden sm:block">
              Jurisdiction: <strong>England & Wales</strong>
            </div>
          </div>

          {/* ════ TAB 1: 5-LEVEL LEARNING JOURNEY ════ */}
          <TabsContent value="journey" className="space-y-8 m-0">
            
            {/* Level Selector Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {levels.map((lvl) => {
                const isCurrent = lvl.levelNumber === currentLevel;
                const isSelected = selectedLevelFilter === lvl.levelNumber;
                return (
                  <button
                    key={lvl.levelNumber}
                    type="button"
                    onClick={() => setSelectedLevelFilter(lvl.levelNumber)}
                    className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-xs'
                        : 'border-border bg-card hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-primary">LEVEL 0{lvl.levelNumber}</span>
                      <Badge
                        variant={lvl.isCompleted ? 'default' : lvl.isUnlocked ? 'secondary' : 'outline'}
                        className="text-[9px]"
                      >
                        {lvl.isCompleted ? 'Completed' : lvl.isUnlocked ? 'Active' : 'Locked'}
                      </Badge>
                    </div>
                    <div className="font-serif font-bold text-xs text-foreground line-clamp-1">{lvl.title}</div>
                    <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${lvl.progressPercentage}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Level Deep-Dive Breakdown */}
            {(() => {
              const activeLevelView = levels.find((l) => l.levelNumber === selectedLevelFilter) || levels[2];
              return (
                <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground text-xs font-mono">
                          Level {activeLevelView.levelNumber}
                        </Badge>
                        <h3 className="font-serif text-xl font-bold text-foreground">
                          {activeLevelView.title} — {activeLevelView.subtitle}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{activeLevelView.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-primary">{activeLevelView.progressPercentage}% Complete</div>
                      <div className="text-[10px] text-muted-foreground">Min. Passing Threshold: {activeLevelView.minPassingScore}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Milestones Checklist */}
                    <div className="space-y-3">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Required Clinical Milestones
                      </span>
                      <div className="space-y-2">
                        {activeLevelView.milestones.map((m) => (
                          <div
                            key={m.id}
                            className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                              m.isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-muted/20'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                m.isCompleted ? 'bg-emerald-500 text-white' : 'border border-muted-foreground/40 text-muted-foreground'
                              }`}>
                                {m.isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[9px]">○</span>}
                              </div>
                              <div className="space-y-0.5">
                                <div className="font-semibold text-foreground">{m.title}</div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">{m.description}</p>
                              </div>
                            </div>

                            <Badge variant="outline" className="text-[9px] capitalize shrink-0">
                              {m.category}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Demonstrated Competencies & Practice Trigger */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                          Demonstrated Competencies
                        </span>
                        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                          {activeLevelView.requiredSkills.map((skill, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-foreground">Clinical Exit Assessment Requirement:</div>
                          <p className="text-[11px] text-muted-foreground">{activeLevelView.assessmentRequirement}</p>
                        </div>
                        <Link href="/courtroom" className="block">
                          <Button size="sm" className="w-full text-xs font-semibold gap-1.5">
                            <Mic className="w-3.5 h-3.5" />
                            <span>Launch Level {activeLevelView.levelNumber} Practice Simulation</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </TabsContent>

          {/* ════ TAB 2: PRACTICE SIMULATIONS ════ */}
          <TabsContent value="simulations" className="space-y-6 m-0">
            
            {/* Search & Domain Filter Bar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Search simulations by case name, statute, topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="h-9 px-3 rounded-md border border-border bg-card text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Domain Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => setSelectedDomain('all')}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                    selectedDomain === 'all'
                      ? 'bg-primary text-primary-foreground border-primary font-medium shadow-xs'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  All Practice Areas
                </button>
                {mockDomains.map((dom) => (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => setSelectedDomain(dom.slug)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all shrink-0 flex items-center gap-1.5 ${
                      selectedDomain === dom.slug
                        ? 'bg-primary text-primary-foreground border-primary font-medium shadow-xs'
                        : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <span>{dom.name}</span>
                    {dom.availability !== 'available' && (
                      <span className="text-[9px] opacity-70">({dom.availability === 'coming_soon' ? 'Soon' : 'Dev'})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSimulations.map((sim) => (
                <div
                  key={sim.id}
                  className="rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-medium capitalize">
                        {sim.legalDomain.name}
                      </Badge>
                      <Badge
                        variant={sim.difficulty === 'beginner' ? 'secondary' : sim.difficulty === 'intermediate' ? 'default' : 'destructive'}
                        className="text-[10px] capitalize"
                      >
                        {sim.difficulty}
                      </Badge>
                    </div>

                    <h4 className="font-serif text-base font-bold text-foreground leading-snug">
                      {sim.title}
                    </h4>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {sim.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {sim.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {sim.estimatedDuration} mins
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInspectCase(sim)}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Case File
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleLaunchSim(sim)}
                        className="h-8 text-xs gap-1 font-semibold"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Enter</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ════ TAB 3: SESSION HISTORY ════ */}
          <TabsContent value="history" className="space-y-4 m-0">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/20 font-semibold text-xs text-foreground flex items-center justify-between">
                <span>Completed Courtroom Proceedings & Transcripts</span>
                <span className="text-[10px] text-muted-foreground font-normal">All transcripts preserved</span>
              </div>

              <div className="divide-y divide-border text-xs">
                {[
                  { title: 'Henderson v Caldwell Trading Ltd', role: 'Claimant Counsel', date: 'Yesterday, 14:30', score: 84, duration: '45 mins', result: 'Judgment for Claimant' },
                  { title: 'Henderson v Caldwell Trading Ltd (Trial Run)', role: 'Claimant Counsel', date: '3 Oct 2025', score: 78, duration: '40 mins', result: 'Evaluated' },
                  { title: 'Whitfield Industries v Apex Logistics', role: 'Defendant Counsel', date: '28 Sep 2025', score: 81, duration: '35 mins', result: 'Settled' },
                ].map((item, i) => (
                  <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground text-sm">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.role} • {item.date} • {item.duration}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-primary text-sm">{item.score}% Score</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">{item.result}</div>
                      </div>
                      <Link href="/performance">
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          View Report
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ════ TAB 4: ACHIEVEMENTS ════ */}
          <TabsContent value="achievements" className="space-y-6 m-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    ach.isUnlocked
                      ? 'border-border bg-card shadow-xs'
                      : 'border-border/40 bg-muted/20 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      ach.isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <Badge variant={ach.isUnlocked ? 'default' : 'outline'} className="text-[9px] capitalize">
                      {ach.isUnlocked ? 'Unlocked' : 'In Progress'}
                    </Badge>
                  </div>
                  <div className="font-serif font-bold text-sm text-foreground">{ach.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ach.description}</p>
                  {ach.unlockedAt && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                      Unlocked on {ach.unlockedAt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ════ TAB 5: CERTIFICATIONS ROADMAP ════ */}
          <TabsContent value="certificates" className="space-y-6 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-2xl border border-border bg-card space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        Level {cert.levelNumber} Credential
                      </Badge>
                      <Badge
                        variant={cert.status === 'issued' ? 'default' : cert.status === 'requirements_in_progress' ? 'secondary' : 'outline'}
                        className="text-[10px] capitalize"
                      >
                        {cert.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <h4 className="font-serif font-bold text-base text-foreground">{cert.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cert.accreditationNote}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 border border-border text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jurisdiction:</span>
                      <span className="font-medium text-foreground">{cert.jurisdiction}</span>
                    </div>
                    {cert.verificationId && (
                      <div className="flex justify-between font-mono">
                        <span className="text-muted-foreground">Verification ID:</span>
                        <span className="text-primary font-bold">{cert.verificationId}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Global Modals */}
      <AuthModal />
      <OnboardingModal />
      <CaseFileModal />
      <TransferSessionModal />
    </div>
  );
}
