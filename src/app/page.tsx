'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scale, Mic, BookOpen, BarChart3, Sparkles, Shield,
  ArrowRight, CheckCircle2, Play, Volume2, Landmark,
  Users, Building2, FileText, ChevronRight, Gavel, Award,
  HelpCircle, Mail, Globe2, Check, Lock, Star, Flame
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { mockDomains, mockSimulations } from '@/data/mock-data';
import { mockAdvocacyLevels, mockCertificates } from '@/data/learning-levels';
import { AuthModal } from '@/components/auth/AuthModal';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { TransferSessionModal } from '@/components/auth/TransferSessionModal';
import { speechService } from '@/lib/audio';
import { toast } from 'sonner';

export default function HomePage() {
  const { openAuthModal, openOnboarding, isAuthenticated, startCourtroomSession, loginAsGuest } = useAppStore();
  const [isPlayingAudioTeaser, setIsPlayingAudioTeaser] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    toast.success('Thank you! Your inquiry has been transmitted to Courtly academic partnerships.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-accent/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Open Guest Access • 5-Level Advocacy System • Verified Rubrics</span>
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
              Step into an immersive, voice-powered virtual courtroom. Cross-examine commercial witnesses, handle judicial interruptions under Common Law, and build certified advocacy competencies.
            </p>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/courtroom">
                <Button
                  size="lg"
                  onClick={() => loginAsGuest()}
                  className="w-full sm:w-auto h-12 px-7 gap-2 text-sm font-semibold shadow-md bg-gradient-to-r from-primary to-primary/90 hover:opacity-95"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Practicing — No Account Required</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openAuthModal('register')}
                className="w-full sm:w-auto h-12 px-6 text-sm font-medium border-border hover:bg-muted/60"
              >
                <span>Create Your Free Account</span>
              </Button>
            </div>

            {/* Trust & Open Access Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Instant Guest Access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>5-Level Learning System</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Future Certification Path</span>
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
                  <Badge variant="outline" className="text-[10px] font-mono">Open Guest Simulation</Badge>
                  <Badge variant="secondary" className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    No Sign Up Needed
                  </Badge>
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Henderson v. Caldwell Trading Ltd
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A high-stakes repudiatory breach of contract dispute under the <em>Sale of Goods Act 1979</em>. Practice opening arguments, cross-examine the supplier, raise objections against hearsay, and tender inspection notes into evidence.
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-primary" />
                    <span>Business & Contract Law</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    <span>Level 3 Benchmark</span>
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
                    <span>Enter Guest Proceeding</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FIVE-LEVEL ADVOCACY LEARNING PATH ── */}
      <section className="py-16 md:py-24 border-b border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="text-xs text-primary font-semibold">Progressive Mastery</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Courtly’s 5-Level Learning System
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Progress from courtroom etiquette to complex multi-party trials. Advancement reflects verified clinical competencies, not arbitrary timer counts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {mockAdvocacyLevels.map((lvl) => (
              <div
                key={lvl.levelNumber}
                className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-primary">LEVEL 0{lvl.levelNumber}</span>
                    <Badge variant={lvl.isCompleted ? 'default' : lvl.isUnlocked ? 'secondary' : 'outline'} className="text-[9px]">
                      {lvl.isCompleted ? 'Mastered' : lvl.isUnlocked ? 'Current' : 'Locked'}
                    </Badge>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-foreground">{lvl.title}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                    {lvl.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60 text-[10px]">
                  <div className="text-muted-foreground font-medium">Core Skills:</div>
                  <ul className="space-y-1 text-muted-foreground">
                    {lvl.requiredSkills.slice(0, 2).map((skill, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-primary font-bold">•</span>
                        <span className="line-clamp-1">{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FUTURE CERTIFICATION ROADMAP ── */}
      <section className="py-16 md:py-24 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="text-xs font-semibold text-primary">
                Verifiable Competency Roadmap
              </Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Earn structured advocacy credentials backed by standardized judicial rubrics.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Courtly bridges legal academia and professional advocacy. Once you master Level milestones and pass proctored clinical evaluations, qualify for verifiable certificates grounded in Common Law trial practice.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-foreground">Level Completion Milestones:</strong> Complete required evidentiary tenders, sustained objections, and witness examinations.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-foreground">Proctored Clinical Exit Evaluation:</strong> Pass standardized multi-issue hearings evaluated by calibrated judicial rubrics.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-foreground">Unique Verification ID:</strong> Tamper-evident credential identifiers shareable with law firms and university admissions.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button onClick={() => openAuthModal('register')} className="text-xs font-semibold gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Start Learning Journey</span>
                </Button>
              </div>
            </div>

            {/* Certificate Preview Card */}
            <div className="p-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-serif font-bold text-sm text-foreground">Courtly Certificate of Advocacy</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  Verified Sample
                </Badge>
              </div>

              <div className="space-y-1 text-center py-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Awarded to</div>
                <div className="text-lg font-serif font-bold text-foreground">Alex Morgan</div>
                <div className="text-xs text-primary font-semibold">Level 2 — Developing Advocate (Mastery)</div>
                <div className="text-[11px] text-muted-foreground pt-1">
                  Jurisdiction: England & Wales • Issue ID: CRT-2025-EW-01402
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed">
                Demonstrated superior competence in opening statements, statutory grounding under the Sale of Goods Act 1979, and formal exhibit tendering.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FREQUENTLY ASKED QUESTIONS (FAQ) ── */}
      <section className="py-16 md:py-24 border-b border-border/40 bg-muted/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="font-serif text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Everything you need to know about practicing on Courtly.</p>
          </div>

          <Accordion className="w-full space-y-3">
            <AccordionItem value="faq-1" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                Can I practice without creating an account?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Yes! Anyone can immediately enter the Virtual Courtroom, participate in available simulations, examine witnesses, tender exhibits, and view instant performance scores in Guest Mode. Registration is only required when you want to save your history and track 5-level milestones across devices.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                Which legal jurisdictions and statutes are supported?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Courtly is currently calibrated to Common Law jurisprudence, specifically <strong>England & Wales</strong> (Civil Procedure Rules, Sale of Goods Act 1979, Civil Evidence Act 1995). Federal US (FRCP/FRE) and Indian common law procedural models are under active development.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                How does the voice AI interaction work?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Courtly uses natural browser speech synthesis and voice activity recognition. The AI Judge and opposing counsel speak their dialogue aloud and interrupt with questions on statutory interpretation. You can speak directly into your microphone or toggle Text Response Mode at any time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                How are the 5 advocacy levels evaluated?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Advancement requires demonstrating specific clinical skills: sustaining evidentiary objections, cross-examining without leading, citing correct statutory provisions, and achieving passing scores on complex multi-issue hearings.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5" className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-xs font-semibold text-foreground hover:no-underline">
                Can law schools and universities assign cohort moots?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Yes. Through the Educator Portal, law faculty can assign specific cases, configure customized judicial rubrics, and monitor cohort skill completion statistics without increasing faculty workload.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ── 5. CONTACT US & ABOUT COURTLY ── */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-2xl border border-border bg-card shadow-lg space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-serif text-2xl font-bold text-foreground">Get in Touch with Academic Partnerships</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Interested in bringing Courtly to your law school, moot court society, or clinical practice program? Send us an inquiry.
              </p>
            </div>

            {contactSubmitted ? (
              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="font-semibold text-sm text-foreground">Inquiry Received</div>
                <p className="text-xs text-muted-foreground">Our academic team will respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 max-w-lg mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Your Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Prof. Eleanor Davies"
                      className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Institution Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@university.edu"
                      className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Message / Clinical Requirements</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us about your cohort size or clinical curriculum..."
                    className="w-full h-20 rounded-md border border-border bg-background p-3 text-xs text-foreground resize-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-9 text-xs font-semibold gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Institutional Inquiry</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Global Modals */}
      <AuthModal />
      <OnboardingModal />
      <TransferSessionModal />
    </div>
  );
}
