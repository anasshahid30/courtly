'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, Shield, Landmark, BookOpen, ExternalLink, Heart, Award } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/40 text-muted-foreground text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-foreground">
                courtly<span className="text-primary font-sans font-black">.</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground font-medium">Practice law before you practice law.</strong> AI-powered virtual courtroom simulations with voice interaction, judicial feedback, and legal intelligence for law schools and advocates.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-muted-foreground/80">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>Grounded in Common Law Jurisprudence</span>
            </div>
          </div>

          {/* Col 2: Legal Practice Domains */}
          <div>
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Legal Domains</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center justify-between">
                  <span>Business & Commercial Law</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded">Live</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center justify-between">
                  <span>Contract Law</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded">Live</span>
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/60 flex items-center justify-between">
                  <span>Corporate Governance</span>
                  <span className="text-[9px] text-muted-foreground/60">Coming Soon</span>
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/60 flex items-center justify-between">
                  <span>Civil Litigation & Tort</span>
                  <span className="text-[9px] text-muted-foreground/60">Coming Soon</span>
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/60 flex items-center justify-between">
                  <span>Criminal Advocacy</span>
                  <span className="text-[9px] text-muted-foreground/60">Coming Soon</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform Features */}
          <div>
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/courtroom" className="hover:text-primary transition-colors">
                  Virtual Courtroom Experience
                </Link>
              </li>
              <li>
                <Link href="/workspace" className="hover:text-primary transition-colors">
                  Legal Workspace & Library
                </Link>
              </li>
              <li>
                <Link href="/performance" className="hover:text-primary transition-colors">
                  Performance & Judicial Rubric
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Educator & Cohort Management
                </Link>
              </li>
              <li>
                <Link href="/workspace" className="hover:text-primary transition-colors">
                  RAG Document Ingestion Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional Trust & Disclaimers */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Pedagogy & Ethics</h4>
            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-[11px] leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Landmark className="w-3.5 h-3.5 text-primary" />
                <span>Educational Simulation</span>
              </div>
              <p className="text-muted-foreground">
                Courtly simulations are designed strictly for educational practice and clinical legal education. All legal citations are verifiable and AI courtroom responses follow procedural rules.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>Primary Jurisdiction:</span>
              <span className="font-medium text-foreground">England & Wales (Common Law)</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 Courtly Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Academic Integrity Policy</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Status</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
