'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Gavel,
  Sparkles,
  Download,
  RotateCcw,
  TrendingUp,
  Shield,
  Layers,
  ChevronRight,
  ExternalLink,
  UserPlus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockPerformanceReports } from '@/data/mock-data';
import { toast } from 'sonner';

export default function PerformancePage() {
  const {
    activeSimulation,
    startCourtroomSession,
    isGuestMode,
    isAuthenticated,
    guestPerformance,
    openAuthModal,
    levels,
    currentLevel,
    certificates,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'skills' | 'levels'>('overview');
  const [selectedReport, setSelectedReport] = useState(
    guestPerformance || mockPerformanceReports[0]
  );

  const radarData = (selectedReport.skillScores || selectedReport.skills || []).map((s: any) => ({
    skill: s.skillCategory || s.name || 'Advocacy',
    score: s.score,
    maxScore: s.maxScore || 100,
  }));

  const historyData = [
    { session: 'Sim 1', score: 68 },
    { session: 'Sim 2', score: 72 },
    { session: 'Sim 3', score: 75 },
    { session: 'Sim 4', score: 79 },
    { session: 'Sim 5', score: 84 },
  ];

  const handleExportPDF = () => {
    toast.success('Judicial Assessment Report exported as PDF');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      
      {/* ── Sub-Header & Navigation Tabs ── */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-xs sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-foreground">
                  {isGuestMode ? 'Guest Session Performance' : 'Advocacy Performance & Judicial Rubrics'}
                </h1>
                {isGuestMode && (
                  <Badge variant="outline" className="text-[10px] text-primary">
                    Provisional
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Common Law Bench Evaluation • Five Core Advocacy Competencies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="text-xs h-8 px-3 font-medium"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'sessions' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('sessions')}
              className="text-xs h-8 px-3 font-medium"
            >
              Sessions
            </Button>
            <Button
              variant={activeTab === 'skills' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('skills')}
              className="text-xs h-8 px-3 font-medium"
            >
              Skills Rubric
            </Button>
            <Button
              variant={activeTab === 'levels' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('levels')}
              className="text-xs h-8 px-3 font-medium"
            >
              Levels & Roadmap
            </Button>
          </div>

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Guest Mode Notice */}
        {isGuestMode && (
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">Viewing Provisional Guest Scorecard</p>
              <p className="text-muted-foreground">
                Create a free student account to retain your historical scores and track longitudinal progress across sessions.
              </p>
            </div>
            <Button size="sm" onClick={() => openAuthModal('register')} className="text-xs shrink-0">
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Save Progress
            </Button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 1: OVERVIEW
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Top Score Summary Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-gradient-to-r from-card to-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Evaluation Report
                  </Badge>
                  <span className="text-xs text-muted-foreground">• {selectedReport.domain}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                  {selectedReport.simulationTitle}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Presiding: The Honourable Mr. Justice Reginald Vance • 6 Procedural Stages
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold font-serif text-primary">
                    {selectedReport.overallScore}%
                  </div>
                  <span className="text-xs text-muted-foreground">Judicial Benchmark</span>
                </div>
                <Link
                  href="/courtroom"
                  className="text-xs bg-primary text-primary-foreground font-semibold px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Practice Again
                </Link>
              </div>
            </div>

            {/* Visual Charts: Radar & Progression */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Radar Chart */}
              <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="text-sm font-semibold text-foreground">Advocate Competency Dimensions</h3>
                  <Badge variant="outline" className="text-[10px]">5 Core Skills</Badge>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} stroke="var(--border)" />
                      <Radar
                        name="Student Score"
                        dataKey="score"
                        stroke="#14232D"
                        fill="#356C91"
                        fillOpacity={0.35}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Longitudinal Practice Trend (or Guest Empty State) */}
              <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="text-sm font-semibold text-foreground">Longitudinal Score Trend</h3>
                  {!isGuestMode && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      +16% Historical Improvement
                    </span>
                  )}
                </div>

                {!isGuestMode ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="session" stroke="var(--muted-foreground)" fontSize={11} />
                        <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                        <Bar dataKey="score" fill="#14232D" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 border border-dashed border-border/60 rounded-xl bg-muted/10">
                    <p className="text-xs font-semibold text-foreground">Historical Progression Locked</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                      Register a free student account to log recurring sessions and graph your long-term advocacy score trajectory.
                    </p>
                    <Button size="sm" variant="outline" onClick={() => openAuthModal('register')} className="text-xs mt-2">
                      Create Account
                    </Button>
                  </div>
                )}
              </div>

            </div>

            {/* Judicial Comments & Rubric Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Judicial Feedback */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-primary">
                    <Gavel className="w-4 h-4" />
                    <span>Judicial Remarks from Mr. Justice Reginald Vance</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    &quot;{selectedReport.judicialFeedback || 'Counsel demonstrated thorough command of the factual record and appropriately anchored the claim under Section 14(2) of the Sale of Goods Act 1979. Cross-examination was focused and respectful of procedural bounds.'}&quot;
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Demonstrated Strengths</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {(selectedReport.strengths || [
                        'Precise statutory citation under CPR 32',
                        'Effective foundation before tendering Exhibit C-1',
                        'Maintained judicial decorum during objections',
                      ]).map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                      <AlertCircle className="w-4 h-4" />
                      <span>Areas for Refinement</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {(selectedReport.improvements || [
                        'Anticipate hearsay objections when questioning witnesses on third-party emails',
                        'Tighten closing submissions to prioritize proximate causation',
                      ]).map((imp: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Export */}
              <div className="rounded-xl border border-border/70 bg-card p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Scorecard Actions
                  </h3>
                  <div className="space-y-2 text-xs">
                    <Button variant="outline" size="sm" onClick={handleExportPDF} className="w-full justify-start text-xs h-8">
                      <Download className="w-3.5 h-3.5 mr-2" />
                      Export Evaluation PDF
                    </Button>
                    <Link
                      href="/courtroom"
                      className="w-full justify-start text-xs h-8 border border-border rounded-md px-3 hover:bg-muted/50 transition-colors inline-flex items-center text-foreground"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-2" />
                      Retake Simulation
                    </Link>
                    <Link
                      href="/workspace"
                      className="w-full justify-start text-xs h-8 border border-border rounded-md px-3 hover:bg-muted/50 transition-colors inline-flex items-center text-foreground"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-2" />
                      Research Cited Precedents
                    </Link>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                  Evaluation calibrated to English Common Law advocacy benchmarks.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: SESSIONS
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Historical Courtroom Sessions</h2>
            <div className="space-y-3">
              {mockPerformanceReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-xl border border-border/70 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{report.domain || 'Commercial Law'}</Badge>
                      <span className="text-[11px] text-muted-foreground">Duration: {report.durationMinutes || 18}m</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{report.simulationTitle}</h3>
                    <p className="text-muted-foreground">{report.strengthsSummary || report.strengths?.[0] || 'Competent legal submissions'}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-bold font-serif text-primary">{report.overallScore}%</span>
                      <p className="text-[10px] text-muted-foreground">Judicial Score</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setActiveTab('overview');
                      }}
                      className="text-xs h-8"
                    >
                      Inspect Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: SKILLS RUBRIC
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'skills' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Detailed 5-Competency Rubric Scoring</h2>

            <div className="space-y-4">
              {(selectedReport.skillScores || selectedReport.skills || []).map((score: any, i: number) => (
                <div key={i} className="p-5 rounded-xl border border-border/70 bg-card space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground text-sm">{score.skillCategory || score.name}</span>
                    <span className="font-bold text-primary text-sm">{score.score} / {score.maxScore || 100}</span>
                  </div>
                  <Progress value={(score.score / (score.maxScore || 100)) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    {score.feedback || 'Demonstrated sound comprehension of relevant procedural standards.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 4: LEVELS & CERTIFICATION ROADMAP
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'levels' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">5-Level Advocacy Progression & Certifications</h2>
              <p className="text-xs text-muted-foreground">
                Structured competency progression from Foundation Advocate to Courtroom Proficiency.
              </p>
            </div>

            <div className="space-y-4">
              {levels.map((lvl) => (
                <div
                  key={lvl.levelNumber}
                  className="p-5 rounded-xl border border-border/70 bg-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-serif text-xs font-bold text-primary">
                        L{lvl.levelNumber}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-foreground">{lvl.title}</h3>
                        <p className="text-[11px] text-muted-foreground">{lvl.subtitle}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Passing Score: {lvl.minPassingScore}%
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {lvl.milestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${m.isCompleted ? 'text-primary' : 'text-muted-foreground/40'}`} />
                        <span>{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
