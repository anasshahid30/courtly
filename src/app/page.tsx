'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scale, Mic, BookOpen, BarChart3, Sparkles, Shield,
  ArrowRight, CheckCircle2, Play, Volume2, Landmark,
  Users, Building2, FileText, ChevronRight, Gavel, Award
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockDomains, mockSimulations } from '@/data/mock-data';
import { AuthModal } from '@/components/auth/AuthModal';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { speechService } from '@/lib/audio';

export default function HomePage() {
  const { openAuthModal, openOnboarding, isAuthenticated, startCourtroomSession } = useAppStore();
  const [isPlayingAudioTeaser, setIsPlayingAudioTeaser] = useState(false);

  const handlePlayVoiceTeaser = () => {
    if (isPlayingAudioTeaser) {
      speechService.cancel();
      setIsPlayingAudioTeaser(false);
    } else {
      setIsPlayingAudioTeaser(true);
      speechService.speak(
        'The High Court of Justice, Commercial Court is now in session. In the matter of Henderson v Caldwell Trading Ltd. Claimant counsel, you may proceed with your opening submissions.',
        'judge',
        () => setIsPlayingAudioTeaser(true),
        () => setIsPlayingAudioTeaser(false)
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40">
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-accent/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold shadow-xs animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Next-Gen Virtual Legal Practice Environment</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
              Practice law before you <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent italic">
                practice law.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Step into an immersive, voice-powered virtual courtroom. Argue commercial disputes, cross-examine witnesses, handle judicial inquiries, and receive instant feedback grounded in Common Law jurisprudence.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/courtroom">
                <Button size="lg" className="w-full sm:w-auto h-12 px-6 gap-2 text-sm font-semibold shadow-md bg-gradient-to-r from-primary to-primary/90 hover:opacity-95">
                  <Mic className="w-4 h-4" />
                  <span>Launch Virtual Courtroom</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6 text-sm font-medium border-border hover:bg-muted/60">
                  <span>Explore Case Library</span>
                </Button>
              </Link>
            </div>

            {/* Trust & Academic Validation */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Voice & Speech AI Synthesis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Grounded Common Law Precedents</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Structured Judicial Rubrics</span>
              </div>
            </div>
          </div>

          {/* ── HERO INTERACTIVE PREVIEW CARD ── */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl border border-border/80 bg-card/60 shadow-2xl backdrop-blur-md overflow-hidden transition-all hover:border-primary/40">
            <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-destructive/60 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/60 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/60 inline-block" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <Landmark className="w-3.5 h-3.5 text-primary" />
                  <span>High Court of Justice • Commercial Court • Claim No. CL-2025-000842</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayVoiceTeaser}
                className="h-8 gap-2 text-xs font-medium text-primary hover:bg-primary/10"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudioTeaser ? 'animate-pulse text-destructive' : ''}`} />
                <span>{isPlayingAudioTeaser ? 'Stop Audio' : 'Preview Judicial Voice'}</span>
              </Button>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">Simulated Proceeding</Badge>
                  <Badge variant="secondary" className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    Live Demo Ready
                  </Badge>
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Henderson v. Caldwell Trading Ltd
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A high-stakes breach of contract dispute involving an exclusive 3-year commercial distribution agreement. Practice opening arguments, handle judicial interruptions from Justice Vance, and tender the inspection release note into evidence.
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-primary" />
                    <span>Business & Contract Law</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span>Plaintiff / Defendant Role</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-muted/40 border border-border/80 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                  <Gavel className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">The Hon. Justice Robert Vance</div>
                  <div className="text-[10px] text-muted-foreground">Presiding Commercial Judge</div>
                </div>
                <Link href="/courtroom" className="w-full">
                  <Button size="sm" className="w-full text-xs font-semibold gap-1.5">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Enter Proceeding</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. LEGAL DOMAIN SHOWCASE ── */}
      <section className="py-16 md:py-24 border-b border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Comprehensive Legal Practice Domains
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Courtly supports rigorous simulations across core foundational and commercial legal disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {mockDomains.map((dom) => (
              <div
                key={dom.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  dom.availability === 'available'
                    ? 'border-border/80 bg-card hover:border-primary/50 hover:shadow-md cursor-pointer'
                    : 'border-border/40 bg-muted/20 opacity-70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      <Scale className="w-4 h-4" />
                    </div>
                    <Badge
                      variant={dom.availability === 'available' ? 'default' : 'outline'}
                      className="text-[9px] capitalize"
                    >
                      {dom.availability === 'available' ? 'Available' : dom.availability === 'coming_soon' ? 'Coming Soon' : 'In Dev'}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{dom.name}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {dom.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{dom.simulationCount} Simulations</span>
                  {dom.availability === 'available' && (
                    <Link href="/dashboard" className="text-primary font-medium hover:underline flex items-center gap-0.5">
                      <span>Browse</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FLAGSHIP VIRTUAL COURTROOM FEATURES ── */}
      <section className="py-16 md:py-24 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="text-xs text-primary font-semibold">Flagship Experience</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Designed for Realistic Courtroom Advocacy
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Unlike generic chatbots, Courtly models the exact procedural flow, evidentiary rules, and verbal cadence of a real court.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-border bg-card/60 space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">Voice-First Interaction</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Speak directly into your microphone. Courtly analyzes oral delivery, pacing, and clarity while AI participants respond naturally through voice synthesis.
              </p>
              <div className="text-[11px] text-primary font-medium flex items-center gap-1 pt-1">
                <span>Text fallback mode always available</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-border bg-card/60 space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Gavel className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">Active Judicial Bench & Objections</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The Judge intervenes with probing questions on statutory interpretation. Raise evidentiary objections (Hearsay, Leading, Relevance) and receive reasoned legal rulings.
              </p>
              <div className="text-[11px] text-primary font-medium flex items-center gap-1 pt-1">
                <span>Civil Evidence Act & CPR aligned</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-border bg-card/60 space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">Judicial Scorecard & Replay</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                After each hearing, review a complete rubric evaluation covering legal reasoning, witness handling, and procedural compliance with key moment bookmarks.
              </p>
              <div className="text-[11px] text-primary font-medium flex items-center gap-1 pt-1">
                <span>5-competency radar analysis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS (PEDAGOGICAL LOOP) ── */}
      <section className="py-16 md:py-24 border-b border-border/40 bg-muted/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              The 4-Step Advocacy Learning Loop
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              From case briefing to post-hearing judicial debrief, master clinical trial advocacy through structured repetition.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Review Case Dossier',
                desc: 'Analyze pleadings, witness statements, disputed facts, and statutory precedents in the Legal Workspace.',
                icon: FileText
              },
              {
                step: '02',
                title: 'Enter Simulated Court',
                desc: 'Argue your case aloud or via text against realistic opposing counsel and a watchful judicial bench.',
                icon: Mic
              },
              {
                step: '03',
                title: 'Tender Exhibits & Object',
                desc: 'Introduce contracts, challenge improper questioning, and adapt to live judicial interruptions.',
                icon: Gavel
              },
              {
                step: '04',
                title: 'Judicial Assessment',
                desc: 'Receive detailed competency scoring, scrub the timestamped replay, and track longitudinal progress.',
                icon: Award
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="p-5 rounded-xl border border-border bg-card space-y-3 relative">
                  <div className="text-2xl font-mono font-black text-primary/30">{item.step}</div>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. FOR LAW SCHOOLS & INSTITUTIONS ── */}
      <section className="py-16 md:py-24 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="text-xs font-semibold text-primary">
                For Legal Educators & Universities
              </Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Scale clinical legal education across cohorts without scaling faculty workload.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Law schools use Courtly to assign moot court exercises, standardize clinical assessment rubrics, and provide students unlimited practice hours before live courtroom clinics.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-foreground">Custom Cohort Assignments:</strong> Set specific case files, roles, and difficulty levels for entire law classes.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-foreground">Standardized Rubrics:</strong> Assess legal reasoning, evidentiary compliance, and courtroom etiquette automatically.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-foreground">RAG Document Ingestion:</strong> Upload institutional moot problem sets and custom statutory materials securely.
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="gap-2 text-xs font-semibold">
                    <Building2 className="w-4 h-4" />
                    <span>View Educator Portal Demo</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-xs text-foreground">Cohort Performance Overview</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">LLB Cohort 2025/26</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                  <div className="text-xl font-bold text-foreground">48</div>
                  <div className="text-[10px] text-muted-foreground">Active Advocates</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                  <div className="text-xl font-bold text-primary">79.4%</div>
                  <div className="text-[10px] text-muted-foreground">Avg. Score</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">184 hrs</div>
                  <div className="text-[10px] text-muted-foreground">Sim Practice</div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-foreground">Contract Law Assignment #3 Completion</span>
                  <span className="text-muted-foreground">92%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[92%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CALL TO ACTION ── */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Step into the Virtual Courtroom Today.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Gain the oral confidence, procedural mastery, and evidentiary instincts that textbooks alone cannot teach.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/courtroom">
              <Button size="lg" className="w-full sm:w-auto h-11 px-6 text-xs font-semibold gap-2">
                <Mic className="w-3.5 h-3.5" />
                <span>Begin Free Practice Session</span>
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto h-11 px-6 text-xs font-medium"
            >
              <span>Create Student Account</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AuthModal />
      <OnboardingModal />
    </div>
  );
}
