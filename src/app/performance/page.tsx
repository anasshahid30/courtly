'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award, BarChart3, Clock, CheckCircle2, AlertCircle,
  Gavel, Sparkles, Download, RotateCcw, ArrowRight,
  TrendingUp, Scale, FileText, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPerformanceReports, mockCaseFiles } from '@/data/mock-data';
import { toast } from 'sonner';

export default function PerformancePage() {
  const { activeSimulation, startCourtroomSession } = useAppStore();
  const [selectedReport, setSelectedReport] = useState(mockPerformanceReports[0]);
  const [activeTab, setActiveTab] = useState('overview');

  const radarData = (selectedReport.skillScores || selectedReport.skills || []).map((s) => ({
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
    toast.success('Judicial Assessment Report exported as PDF (Demo)');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      
      {/* ── TOP HEADER / EVALUATION SUMMARY ── */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono">
                  Evaluation Report
                </Badge>
                <Badge className="bg-emerald-600 text-white text-[10px]">
                  First Class Honours (84/100)
                </Badge>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {selectedReport.simulationTitle}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span>Advocate: <strong>Alex Morgan</strong></span>
                <span>•</span>
                <span>Role: Claimant Counsel</span>
                <span>•</span>
                <span>Completed on 1 October 2025</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="text-xs gap-1.5 border-border">
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </Button>
              <Link href="/courtroom">
                <Button size="sm" onClick={() => startCourtroomSession()} className="text-xs font-semibold gap-1.5 bg-primary shadow-xs">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Proceeding</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Overall Judicial Score</span>
              <div className="text-3xl font-bold text-primary">{selectedReport.overallScore}%</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+6% vs cohort average</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Hearing Duration</span>
              <div className="text-3xl font-bold text-foreground">{selectedReport.durationMinutes}m</div>
              <div className="text-[10px] text-muted-foreground">6 Procedural Stages</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Advocacy Distinction</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">High Commendation</div>
              <div className="text-[10px] text-muted-foreground">Exemplary evidentiary handling</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Competency Breakdown & Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: 5-Competency Radar Chart */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-serif text-base font-bold text-foreground">Advocate Competency Radar</h3>
              <Badge variant="outline" className="text-[10px]">5 Legal Dimensions</Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="var(--border)" />
                  <Radar
                    name="Student Score"
                    dataKey="score"
                    stroke="#14232D"
                    fill="#356C91"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Longitudinal Practice Progression */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-serif text-base font-bold text-foreground">Longitudinal Progress</h3>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+16% Growth</span>
              </div>
            </div>

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
          </div>
        </div>

        {/* Detailed Judicial Rubric & Key Moments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Judge's Detailed Rubric & Feedback */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Feedback from Justice Vance */}
            <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-primary">
                <Gavel className="w-4 h-4" />
                <span>Judicial Comments from The Hon. Justice Robert Vance</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "{selectedReport.judicialFeedback}"
              </p>
            </div>

            {/* Strengths & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Demonstrated Strengths</span>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {selectedReport.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>Areas for Refinement</span>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {selectedReport.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Individual Competency Scores */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Detailed Competency Scoring Rubric
              </h4>
              <div className="space-y-3">
                {(selectedReport.skillScores || selectedReport.skills || []).map((score, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-foreground">{score.skillCategory || score.name}</span>
                      <span className="font-bold text-primary">{score.score} / {score.maxScore || 100}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(score.score / (score.maxScore || 100)) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{score.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Key Moments & Procedural Highlights */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Key Moments in Proceeding
              </h4>
              <div className="space-y-3">
                {selectedReport.keyMoments.map((moment, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{moment.title || 'Proceeding Event'}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{moment.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {moment.description}
                    </p>
                    <div className="pt-1 text-[10px] text-primary font-medium">
                      Impact: {(moment.scoreImpact ?? 5) > 0 ? `+${moment.scoreImpact ?? 5}` : (moment.scoreImpact ?? 0)} pts on judicial scoring
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card text-center space-y-3">
              <h4 className="font-serif font-bold text-sm text-foreground">Ready for the Next Simulation?</h4>
              <p className="text-xs text-muted-foreground">
                Apply today's judicial feedback to the partnership dispute in *Re: Oakwood Partners LLP*.
              </p>
              <Link href="/dashboard" className="block">
                <Button className="w-full text-xs font-semibold gap-1.5">
                  <span>Return to Practice Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
