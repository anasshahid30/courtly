'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scale,
  Mic,
  BookOpen,
  BarChart3,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  FileText,
  Users,
  GraduationCap,
  Building2,
  Award,
  ChevronRight,
  Sparkles,
  Volume2,
  Send,
  HelpCircle,
  Clock,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();
  const { loginAsGuest, openAuthModal } = useAppStore();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleTryCourtly = () => {
    loginAsGuest();
    router.push('/dashboard');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error('Please fill in all required contact fields');
      return;
    }
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      toast.success('Thank you for reaching out. A representative will contact you shortly.');
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 600);
  };

  const learningLevels = [
    {
      num: 1,
      name: 'Foundation',
      description: 'Courtroom etiquette, fundamental procedural terms, and basic opening submissions.',
      skills: ['Judicial Forms of Address', 'Procedural Sequence', 'Basic Case Summaries'],
    },
    {
      num: 2,
      name: 'Developing Advocate',
      description: 'Structured examination-in-chief and identifying hearsay vs. relevant evidence.',
      skills: ['Non-leading Questioning', 'Relevance Testing', 'Document Identification'],
    },
    {
      num: 3,
      name: 'Practicing Advocate',
      description: 'Controlled cross-examination, dynamic objections, and tendering contested exhibits.',
      skills: ['Leading Questions', 'Impeachment with Prior Inconsistent Statements', 'Tendering Contested Exhibits'],
    },
    {
      num: 4,
      name: 'Advanced Advocate',
      description: 'Statutory interpretation, handling judicial interventions, and legal submissions.',
      skills: ['Statutory Construction', 'Managing Active Judicial Interventions', 'Closing Argument Synthesis'],
    },
    {
      num: 5,
      name: 'Courtroom Proficiency',
      description: 'Full unassisted simulated trials under realistic judicial scrutiny.',
      skills: ['Complete Multi-Stage Trial', 'Real-time Submissions', 'Comprehensive Evidentiary Mastery'],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      
      {/* ══════════════════════════════════════════════════════════
          1. HERO SECTION
         ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>AI-Powered Virtual Legal Practice Environment</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
              Practice law before you practice law.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Courtly is a virtual legal practice environment where students can experience realistic courtroom proceedings, develop advocacy skills, and track their progress through interactive simulations.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
              <Button
                size="lg"
                onClick={handleTryCourtly}
                className="w-full sm:w-auto px-8 py-6 text-sm font-semibold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <span>Try Courtly</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Link
                href="/#about"
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold border border-border rounded-lg inline-flex items-center justify-center hover:bg-muted/50 transition-colors text-foreground"
              >
                Learn More
              </Link>
            </div>

            <p className="text-xs text-muted-foreground pt-1">
              No credit card or registration required to start practicing.
            </p>
          </div>

          {/* ── Refined Courtroom Interface Preview Mockup ── */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-border/80 bg-card p-2 sm:p-3 shadow-xl shadow-primary/5">
            <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
              
              {/* Mockup Header Bar */}
              <div className="h-10 bg-muted/60 border-b border-border/60 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="ml-2 text-[11px] font-medium text-muted-foreground">
                    Henderson v Caldwell Trading Ltd — Queen&apos;s Bench Division
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Stage 4: Cross-Examination
                  </span>
                </div>
              </div>

              {/* Mockup Courtroom Canvas */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gradient-to-b from-background to-muted/10">
                
                {/* Visual Bench Scene */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-4 rounded-xl border border-border/60 bg-card/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-serif font-bold">
                        J
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">The Honourable Mr. Justice Reginald Vance</p>
                        <p className="text-[11px] text-muted-foreground">Presiding Judicial Officer</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      Attentive
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-border/50 bg-card/60 space-y-1">
                      <p className="text-[11px] font-semibold text-foreground">Eleanor Sterling KC</p>
                      <p className="text-[10px] text-muted-foreground">Opposing Counsel</p>
                      <p className="text-[11px] text-muted-foreground italic pt-1">&quot;Objection, My Lord — Counsel is assuming facts not in evidence.&quot;</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-1">
                      <p className="text-[11px] font-semibold text-primary">Student Advocate (You)</p>
                      <p className="text-[10px] text-muted-foreground">Claimant Counsel</p>
                      <p className="text-[11px] text-foreground pt-1">&quot;Respectfully, My Lord, the foundation was established in Exhibit C-1.&quot;</p>
                    </div>
                  </div>
                </div>

                {/* Live Verbatim Transcript Card */}
                <div className="rounded-xl border border-border/60 bg-card p-3.5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="text-xs font-semibold text-foreground">Live Procedural Feed</span>
                      <span className="text-[10px] text-primary font-mono">00:14:28</span>
                    </div>
                    <div className="space-y-2 text-[11px] text-muted-foreground">
                      <div className="p-2 rounded bg-muted/40 border border-border/30">
                        <span className="font-semibold text-foreground">Ruling: </span>
                        <span>Objection overruled. Proceed with the question, Counsel.</span>
                      </div>
                      <div className="p-2 rounded bg-muted/20 border border-border/20">
                        <span className="font-semibold text-foreground">Exhibit C-1: </span>
                        <span>Admitted into evidence under CPR 32.1.</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Speech Engine: Active</span>
                    <span className="text-primary font-medium">Common Law UK</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. ABOUT COURTLY SECTION
         ══════════════════════════════════════════════════════════ */}
      <section id="about" className="py-20 md:py-28 border-b border-border/40 bg-muted/5 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">About Courtly</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              A better way to prepare for legal practice.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-4">
              <p>
                Law school teaches students how to think like lawyers, analyze statutes, and draft legal briefs. Yet aspiring advocates rarely have the opportunity to stand on their feet and practice oral submissions, witness examinations, and courtroom objections before entering actual practice.
              </p>
              <p>
                Courtly bridges the gap between academic theory and courtroom reality. It provides a safe, realistic virtual practice environment where students can test arguments, refine examination techniques, and learn courtroom procedure through repeated practice.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                Every simulation is grounded in established Common Law rules of evidence, civil procedure, and judicial decorum. Students receive objective, structured feedback on their legal analysis, factual grounding, and advocacy delivery.
              </p>
              <p>
                Whether you are preparing for your first moot court competition, bar vocational assessment, or pupillage interview, Courtly gives you the confidence and experience to advocate effectively.
              </p>
            </div>
          </div>

          {/* Core Values / Pillar Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-5 rounded-xl border border-border/60 bg-card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Procedural Authenticity</h3>
              <p className="text-xs text-muted-foreground">
                Calibrated to Common Law procedural standards including Civil Procedure Rules and the Civil Evidence Act.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Volume2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Voice & Speech Advocacy</h3>
              <p className="text-xs text-muted-foreground">
                Practice through spoken argument with virtual judges and witnesses, with full text fallback support.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Objective Judicial Scoring</h3>
              <p className="text-xs text-muted-foreground">
                Immediate rubric-grounded evaluations detailing advocacy strengths, legal accuracy, and areas for improvement.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. COURTLY FEATURES
         ══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-b border-border/40 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Platform Capabilities</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Comprehensive tools for advocacy development
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything required to prepare, practice, and evaluate legal advocacy in one intuitive platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: Virtual Courtroom */}
            <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Mic className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-foreground">Virtual Courtroom</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter realistic proceedings with interactive virtual judges, opposing counsel, and witnesses. Present opening statements, examine witnesses, tender exhibits, and respond to objections under live procedural rules.
                </p>
              </div>
            </div>

            {/* Feature 2: Legal Workspace */}
            <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-foreground">Legal Workspace</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Access statutory texts, foundational judicial precedents, and case law with pinpoint citations. Prepare argument outlines, organize notes, and conduct source-grounded legal research.
                </p>
              </div>
            </div>

            {/* Feature 3: Performance Tracking */}
            <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-foreground">Performance Tracking</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Evaluate session outcomes with multi-competency rubric analytics. Review detailed judicial feedback on legal analysis, etiquette, evidence handling, objection timing, and vocal delivery.
                </p>
              </div>
            </div>

            {/* Feature 4: Learning Levels */}
            <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-foreground">Progressive Learning Levels</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Advance through five structured tiers of advocacy proficiency. Build core procedural skills at lower levels before tackling high-pressure multi-issue trials.
                </p>
              </div>
            </div>

            {/* Feature 5: Case Preparation */}
            <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-foreground">Case Preparation</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Review complete case files containing undisputed facts, witness statements, contractual exhibits, and disputed legal issues before stepping up to the podium.
                </p>
              </div>
            </div>

            {/* Feature 6: Diverse Practice Modes */}
            <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-foreground">Focused Practice Modes</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Target specific skills with dedicated modules for witness cross-examination drills, rapid-fire objection practice, opening submissions, and judicial dialogue.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. HOW COURTLY WORKS
         ══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-b border-border/40 bg-muted/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Simple Workflow</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              How Courtly works
            </h2>
            <p className="text-sm text-muted-foreground">
              Step from legal theory to practical advocacy in four straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-xl border border-border/60 bg-card space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                1
              </div>
              <h3 className="text-sm font-semibold text-foreground">Choose a Level</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select your practice difficulty from Level 1 (Foundation) through Level 5 (Courtroom Proficiency).
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                2
              </div>
              <h3 className="text-sm font-semibold text-foreground">Select a Simulation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pick a case scenario across commercial, contract, civil, or statutory practice areas and review case briefs.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                3
              </div>
              <h3 className="text-sm font-semibold text-foreground">Enter the Courtroom</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Speak directly with the judge and witnesses using natural voice interaction or text fallback.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                4
              </div>
              <h3 className="text-sm font-semibold text-foreground">Review Performance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive instant judicial scorecards, actionable feedback, and skill breakdown metrics.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. LEARNING LEVELS BREAKDOWN
         ══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-b border-border/40 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Structured Curriculum</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Advocacy Progression System
            </h2>
            <p className="text-sm text-muted-foreground">
              Build your courtroom skills through five progressive tiers calibrated to Common Law advocacy standards.
            </p>
          </div>

          <div className="space-y-4">
            {learningLevels.map((lvl) => (
              <div
                key={lvl.num}
                className="p-5 rounded-xl border border-border/60 bg-card hover:border-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-serif text-sm font-bold text-foreground shrink-0 border border-border/80">
                    L{lvl.num}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{lvl.name}</h3>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        Level {lvl.num}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{lvl.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:max-w-xs">
                  {lvl.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-center text-xs text-muted-foreground max-w-xl mx-auto">
            <p>
              Visitors can practice any level immediately in <strong>Guest Mode</strong>. Registered students unlock formal milestone tracking and future accredited certifications.
            </p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. WHO IS COURTLY FOR?
         ══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-b border-border/40 bg-muted/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Audience</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Designed for the legal education community
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-xl border border-border/60 bg-card space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Law Students</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prepare for moot court competitions, trial advocacy assessments, and pupillage interviews with repeatable simulations.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Aspiring Advocates</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Refine examination technique, objection instincts, and courtroom presence in a realistic, pressure-free setting.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Legal Educators</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Assign structured courtroom exercises, track cohort progression, and benchmark student advocacy competencies.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Universities</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Equip legal faculties with standardized experiential learning tools that bridge academic law with professional practice.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7. WHY CREATE AN ACCOUNT?
         ══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-b border-border/40 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card to-muted/20 p-8 sm:p-10 space-y-8">
            
            <div className="space-y-2 text-center max-w-xl mx-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Account Benefits</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Enhance your practice with a student account
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Courtly is fully accessible to guests. Creating a free student account unlocks permanent tracking and advanced learning features.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/40">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Save Practice History</p>
                  <p className="text-muted-foreground">Keep permanent records of all courtroom sessions, transcripts, and scores.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/40">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Longitudinal Progress</p>
                  <p className="text-muted-foreground">Track skill improvement over time across 5 core advocacy competencies.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/40">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Save Legal Research</p>
                  <p className="text-muted-foreground">Store case notes, statutory citations, and argument briefs in your workspace.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/40">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Verifiable Certifications</p>
                  <p className="text-muted-foreground">Work toward structured milestone completions and credential recognition.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                onClick={() => openAuthModal('register')}
                className="px-8 py-5 text-xs font-semibold shadow-xs"
              >
                Create Your Free Account
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          8. FREQUENTLY ASKED QUESTIONS
         ══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-b border-border/40 bg-muted/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">FAQ</span>
            <h2 className="font-serif text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Everything you need to know about practicing on Courtly.</p>
          </div>

          <Accordion className="w-full space-y-3">
            <AccordionItem value="faq-1" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                What is Courtly?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Courtly is an AI-powered virtual legal practice platform designed for law students and legal educators. It provides interactive, realistic courtroom proceedings where students can examine witnesses, present arguments, raise objections, and receive structured performance feedback.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                Can I use Courtly without creating an account?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Yes. Anyone can immediately enter the Virtual Courtroom, participate in simulations, examine witnesses, tender exhibits, and view instant performance scores in Guest Mode without registering.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                How does the virtual courtroom work?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                The courtroom simulates a six-stage Common Law hearing with interactive AI judges, opposing counsel, and witnesses. You can speak directly using your microphone or submit arguments via text. The virtual participants respond dynamically according to evidence and procedural rules.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                How do learning levels work?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Courtly features five progressive advocacy tiers ranging from Level 1 (Foundation) to Level 5 (Courtroom Proficiency). Difficulty increases gradually with higher levels introducing hostile witnesses, rapid objections, and complex statutory interpretation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                Can I choose my practice difficulty?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Yes. Both guests and registered students can select any practice level to explore courtroom scenarios at their desired challenge level.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-6" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                Is my progress saved?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                In Guest Mode, session data is stored temporarily in your browser. Registered students have all simulations, transcripts, scores, and research permanently saved to their account profile.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-7" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                What legal areas and jurisdictions are supported?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Courtly is primarily calibrated to Common Law jurisprudence, featuring commercial transactions, contract disputes, civil litigation, and sale of goods statutes (England & Wales). Additional jurisdictions and subject domains are under continuous expansion.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-8" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                Will Courtly offer certificates?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Yes. A verifiable certification framework is integrated into the 5-level curriculum. Students who successfully complete formal level assessments will be eligible for digital credentials with unique verification identifiers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-9" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                Is Courtly a substitute for professional legal advice?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                No. Courtly is strictly an educational simulation and practice platform designed for academic training. It does not provide legal representation, formal legal advice, or live dispute resolution services.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          9. FINAL CALL TO ACTION
         ══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-b border-border/40 bg-background text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Your courtroom journey starts here.
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Experience realistic legal simulations, develop practical advocacy skills, and prepare for the courtroom with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={handleTryCourtly}
              className="w-full sm:w-auto px-8 py-5 text-xs font-semibold shadow-xs"
            >
              <span>Try Courtly</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-8 py-5 text-xs font-semibold border-border hover:bg-muted/50"
            >
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          10. CONTACT US SECTION
         ══════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-20 md:py-28 border-b border-border/40 bg-muted/5 scroll-mt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Get In Touch</span>
            <h2 className="font-serif text-3xl font-bold text-foreground">Contact Us</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Have questions about Courtly for your law school or academic cohort? Send us a message.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4 p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Your Name *</Label>
                <Input
                  type="text"
                  placeholder="e.g. Professor Sarah Jenkins"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Email Address *</Label>
                <Input
                  type="email"
                  placeholder="name@university.edu"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Subject</Label>
              <Input
                type="text"
                placeholder="e.g. Institutional Inquiry for Faculty of Law"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Message *</Label>
              <Textarea
                placeholder="Tell us about your requirements, cohort size, or specific inquiries..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={4}
                className="text-xs resize-none"
                required
              />
            </div>

            <Button type="submit" disabled={isSubmittingContact} className="w-full text-xs font-semibold h-9">
              <Send className="w-3.5 h-3.5 mr-2" />
              {isSubmittingContact ? 'Sending Inquiry...' : 'Send Message'}
            </Button>
          </form>

        </div>
      </section>

    </div>
  );
}
