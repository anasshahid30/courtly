'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, Scale, AlertCircle, BookOpen, Clock, Shield } from 'lucide-react';

export function CaseFileModal() {
  const { isCaseFileModalOpen, closeCaseFileModal, activeCaseFile, activeSimulation } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  if (!activeCaseFile) return null;

  const claimantParty = activeCaseFile.parties.find((p) => {
    const r = p.role.toLowerCase();
    return r === 'plaintiff' || r === 'claimant';
  });
  const defendantParty = activeCaseFile.parties.find((p) => p.role.toLowerCase() === 'defendant');

  return (
    <Dialog open={isCaseFileModalOpen} onOpenChange={(open) => !open && closeCaseFileModal()}>
      <DialogContent className="sm:max-w-[760px] max-h-[85vh] flex flex-col p-6 border-border">
        <DialogHeader className="space-y-1 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeCaseFile.caseNumber && (
                <Badge variant="outline" className="font-mono text-xs">
                  {activeCaseFile.caseNumber}
                </Badge>
              )}
              {(activeCaseFile.court || activeCaseFile.proceedingType) && (
                <Badge variant="secondary" className="text-xs">
                  {activeCaseFile.court || activeCaseFile.proceedingType}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{activeCaseFile.jurisdiction}</span>
          </div>
          <DialogTitle className="text-xl font-serif font-bold pt-1 text-foreground">
            {activeCaseFile.title}
          </DialogTitle>
          {activeCaseFile.proceduralHistory && (
            <DialogDescription className="text-xs text-muted-foreground">
              {activeCaseFile.proceduralHistory}
            </DialogDescription>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-4 w-full h-9 bg-muted/60 p-1 my-2">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="facts" className="text-xs">Facts & Claims</TabsTrigger>
            <TabsTrigger value="witnesses" className="text-xs">Witnesses</TabsTrigger>
            <TabsTrigger value="provisions" className="text-xs">Statutes & Law</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-4 text-xs">
            {/* Tab: Overview */}
            <TabsContent value="overview" className="space-y-4 m-0">
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-2">
                <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                  Case Summary & Nature of Proceedings
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  {activeCaseFile.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Claimant / Plaintiff</span>
                    <Badge variant="outline" className="text-[10px]">Claimant</Badge>
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {claimantParty?.name || 'Not specified'}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {claimantParty?.description}
                  </p>
                  {claimantParty?.counsel && (
                    <div className="text-[11px] text-primary pt-1 font-medium">
                      Represented by: {claimantParty.counsel}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Defendant</span>
                    <Badge variant="outline" className="text-[10px]">Defendant</Badge>
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {defendantParty?.name || 'Not specified'}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {defendantParty?.description}
                  </p>
                  {defendantParty?.counsel && (
                    <div className="text-[11px] text-primary pt-1 font-medium">
                      Represented by: {defendantParty.counsel}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab: Facts */}
            <TabsContent value="facts" className="space-y-3 m-0">
              <div className="space-y-2">
                <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                  Chronological Statement of Facts
                </span>
                <div className="space-y-2">
                  {activeCaseFile.facts.map((fact) => (
                    <div key={fact.id} className="p-2.5 rounded-lg border border-border/80 bg-muted/20 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground font-mono">{fact.date}</span>
                        <Badge variant={fact.isDisputed ? 'destructive' : 'secondary'} className="text-[9px]">
                          {fact.isDisputed ? 'Disputed Fact' : 'Agreed Fact'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {fact.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab: Witnesses */}
            <TabsContent value="witnesses" className="space-y-3 m-0">
              <div className="grid grid-cols-1 gap-3">
                {activeCaseFile.witnesses.map((witness) => (
                  <div key={witness.id} className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">{witness.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {witness.party ? `Called by ${witness.party} (${witness.role})` : witness.role}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {witness.credibilityRating && (
                        <><strong>Credibility Assessment:</strong> {witness.credibilityRating} • </>
                      )}
                      {witness.background}
                    </div>
                    <div className="p-2.5 rounded bg-muted/30 border border-border/50 text-[11px] text-muted-foreground italic">
                      &ldquo;{witness.statementSummary}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tab: Statutes & Law */}
            <TabsContent value="provisions" className="space-y-3 m-0">
              <div className="space-y-2.5">
                {(activeCaseFile.provisions || activeCaseFile.applicableLaw || []).length > 0 ? (
                  (activeCaseFile.provisions || activeCaseFile.applicableLaw || []).map((prov) => (
                    <div key={prov.id} className="p-3 rounded-lg border border-border bg-card space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">{prov.statuteName || prov.title} — {prov.sectionNumber || prov.section || 'General'}</span>
                        <Badge variant="secondary" className="text-[10px]">{prov.category || 'Statute'}</Badge>
                      </div>
                      <div className="font-mono text-[11px] p-2 rounded bg-muted/30 border border-border/40 text-foreground">
                        {prov.verbatimText || prov.text}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <strong>Application:</strong> {prov.relevance || 'Applicable commercial precedent.'}
                      </p>
                    </div>
                  ))
                ) : activeCaseFile.legalIssues && activeCaseFile.legalIssues.length > 0 ? (
                  <div className="space-y-2">
                    <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                      Legal Issues in Dispute
                    </span>
                    {activeCaseFile.legalIssues.map((issue, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-border bg-card text-xs text-muted-foreground">
                        <span className="font-semibold text-primary mr-1.5">{idx + 1}.</span>
                        {issue}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-xs">No statutory provisions or legal issues listed in this dossier.</p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
