'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/60 bg-muted/10 text-muted-foreground text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 space-y-8">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/40">
          <div className="space-y-1.5 max-w-sm">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
                <div className="w-3 h-3 border border-primary-foreground/90 rounded-xs flex items-center justify-center">
                  <div className="w-1 h-1 bg-primary-foreground/90 rounded-xs" />
                </div>
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-foreground">
                courtly<span className="text-primary font-sans font-black">.</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Practice law before you practice law. AI-powered virtual courtroom simulations for law students and advocates.
            </p>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/#about" className="hover:text-foreground transition-colors">
              About Us
            </Link>
            <Link href="/#contact" className="hover:text-foreground transition-colors">
              Contact Us
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/courtroom" className="hover:text-foreground transition-colors">
              Virtual Courtroom
            </Link>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground/80">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <span>Educational Simulation Environment — Grounded in Common Law Jurisprudence.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Academic Integrity</span>
            <span>•</span>
            <span>© 2026 Courtly Inc. All rights reserved.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
