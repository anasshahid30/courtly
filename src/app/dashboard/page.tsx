'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scale, Mic, BookOpen, BarChart3, Search, Filter,
  Play, Clock, Award, Flame, CheckCircle2, ChevronRight,
  Building2, Users, FilePlus, Sparkles, Database, Shield,
  ArrowUpRight, AlertCircle, RefreshCw, UploadCloud, Gavel
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDomains, mockSimulations, mockPerformanceReports } from '@/data/mock-data';
import { AuthModal } from '@/components/auth/AuthModal';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { CaseFileModal } from '@/components/legal/CaseFileModal';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    setActiveSimulation,
    startCourtroomSession,
    openCaseFileModal,
    openOnboarding
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'practice' | 'educator' | 'admin'>('practice');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Filtered simulations
  const filteredSimulations = mockSimulations.filter((sim) => {
    const matchesSearch =
      sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      
      {/* ── TOP HEADER / STUDENT PROFILE STRIP ── */}
      <div className="border-b border-border bg-card/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* User Greeting & Degree info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                  Welcome back, {currentUser.fullName}
                </h1>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {currentUser.role}
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

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openOnboarding}
                className="text-xs border-border gap-1.5"
              >
                <span>Edit Goals</span>
              </Button>
              <Link href="/courtroom">
                <Button size="sm" className="text-xs font-semibold gap-1.5 bg-primary shadow-xs">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Launch Virtual Courtroom</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Practice Hours</span>
                <div className="text-xl font-bold text-foreground">{currentUser.totalPracticeHours}h</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+3.2h this week</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Advocate Average</span>
                <div className="text-xl font-bold text-primary">{currentUser.averageScore}%</div>
                <div className="text-[10px] text-muted-foreground">First Class Honours</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Simulations Done</span>
                <div className="text-xl font-bold text-foreground">{currentUser.completedSimulations}</div>
                <div className="text-[10px] text-muted-foreground">3 pending review</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Gavel className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Practice Streak</span>
                <div className="text-xl font-bold text-amber-500 flex items-center gap-1">
                  <span>{currentUser.currentStreak} Days</span>
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div className="text-[10px] text-muted-foreground">Personal best: 8 days</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN DASHBOARD CONTENT AREA ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs (Student Practice / Educator / Knowledge Admin) */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="practice" className="text-xs gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Student Practice Hub</span>
              </TabsTrigger>
              <TabsTrigger value="educator" className="text-xs gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Educator Portal</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-xs gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Platform & RAG Admin</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="text-xs text-muted-foreground hidden sm:block">
              Jurisdiction: <strong>England & Wales</strong>
            </div>
          </div>

          {/* ════ TAB 1: STUDENT PRACTICE HUB ════ */}
          <TabsContent value="practice" className="space-y-8 m-0">
            
            {/* Featured Recommended Simulation Banner */}
            <div className="p-6 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground text-[10px]">Recommended For You</Badge>
                  <Badge variant="outline" className="text-[10px]">Contract Law • Intermediate</Badge>
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Henderson v. Caldwell Trading Ltd
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Commercial trial simulation focusing on repudiatory breach of contract and mitigation under <em>Hadley v Baxendale</em>. Includes cross-examination of the supplier and formal tender of technical inspection notes.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 45 mins</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 2 Counsel Roles</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Voice Ready
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                <Button
                  onClick={() => handleLaunchSim(mockSimulations[0])}
                  className="gap-2 text-xs font-semibold bg-primary text-primary-foreground shadow-sm"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Launch Proceeding</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleInspectCase(mockSimulations[0])}
                  className="gap-2 text-xs border-border hover:bg-muted/60"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Inspect Case File</span>
                </Button>
              </div>
            </div>

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

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
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

          {/* ════ TAB 2: EDUCATOR PORTAL ════ */}
          <TabsContent value="educator" className="space-y-6 m-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Cohort Management & Moot Assignments</h3>
                <p className="text-xs text-muted-foreground">Monitor student simulation completions, rubrics, and clinical performance.</p>
              </div>
              <Button size="sm" onClick={() => toast.info('Assignment creator opened (Demo)')} className="gap-1.5 text-xs">
                <FilePlus className="w-3.5 h-3.5" />
                <span>Create New Assignment</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">LLB Commercial Clinic (2025)</span>
                  <Badge variant="default" className="text-[10px]">Active</Badge>
                </div>
                <div className="text-2xl font-bold text-foreground">34 / 36</div>
                <p className="text-[11px] text-muted-foreground">Students completed *Henderson v Caldwell*</p>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[94%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Contract Law Moot Cohort B</span>
                  <Badge variant="secondary" className="text-[10px]">Due in 3 days</Badge>
                </div>
                <div className="text-2xl font-bold text-foreground">18 / 25</div>
                <p className="text-[11px] text-muted-foreground">Average Oral Advocacy Score: 81.2%</p>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[72%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Advocacy Competition Prelims</span>
                  <Badge variant="outline" className="text-[10px]">Scheduled</Badge>
                </div>
                <div className="text-2xl font-bold text-foreground">12 Teams</div>
                <p className="text-[11px] text-muted-foreground">Scoring rubric calibrated to Bar Standards Board</p>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[50%]" />
                </div>
              </div>
            </div>

            {/* Student Score Distribution Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/20 font-semibold text-xs text-foreground">
                Recent Student Simulation Submissions
              </div>
              <div className="divide-y divide-border text-xs">
                {[
                  { name: 'Alex Morgan', sim: 'Henderson v Caldwell', score: 84, time: '2 hours ago', status: 'Evaluated' },
                  { name: 'Sarah Jenkins', sim: 'Henderson v Caldwell', score: 91, time: '4 hours ago', status: 'Evaluated' },
                  { name: 'Marcus Sterling', sim: 'Re: Oakwood Partners', score: 76, time: 'Yesterday', status: 'Evaluated' },
                  { name: 'Priya Sharma', sim: 'Henderson v Caldwell', score: 88, time: 'Yesterday', status: 'Evaluated' },
                ].map((item, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                        {item.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{item.name}</div>
                        <div className="text-[11px] text-muted-foreground">{item.sim}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-foreground">{item.score}%</div>
                        <div className="text-[10px] text-muted-foreground">{item.time}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ════ TAB 3: PLATFORM & RAG KNOWLEDGE ADMIN ════ */}
          <TabsContent value="admin" className="space-y-6 m-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Legal Knowledge Base & RAG Indexing Studio</h3>
                <p className="text-xs text-muted-foreground">Manage statutory corpus, chunking embeddings, and citation verification metrics.</p>
              </div>
              <Button size="sm" onClick={() => toast.success('Re-indexed Common Law Corpus successfully!')} className="gap-1.5 text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Index Statutory Corpus</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Indexed Provisions</span>
                <div className="text-2xl font-bold text-foreground">1,420</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">100% verified against Legislation.gov.uk</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Judicial Precedents</span>
                <div className="text-2xl font-bold text-foreground">380 Cases</div>
                <p className="text-[11px] text-muted-foreground">BAILII & UK Supreme Court indexed</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Citation Accuracy</span>
                <div className="text-2xl font-bold text-primary">99.8%</div>
                <p className="text-[11px] text-muted-foreground">Strict zero-hallucination verification</p>
              </div>
            </div>

            {/* Document Ingestion Zone */}
            <div className="p-8 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all text-center space-y-3 bg-muted/10">
              <UploadCloud className="w-10 h-10 text-primary mx-auto" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-foreground">Upload Legal Problem Sets or Statutory Briefs</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Drag and drop PDF pleadings, markdown case briefs, or statutory extracts to generate new simulation dockets automatically.
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => toast.info('File selector opened (Demo)')} className="text-xs">
                Browse Files
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Global Modals */}
      <AuthModal />
      <OnboardingModal />
      <CaseFileModal />
    </div>
  );
}
