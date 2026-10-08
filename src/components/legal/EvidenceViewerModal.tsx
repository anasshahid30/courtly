'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, Sparkles, Check, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function EvidenceViewerModal() {
  const {
    isEvidenceViewerOpen,
    selectedEvidenceItem,
    closeEvidenceViewer,
    admittedEvidenceIds,
    admitEvidence,
    isCourtroomActive,
    addTranscriptEntry
  } = useAppStore();

  if (!selectedEvidenceItem) return null;

  const isAdmitted = admittedEvidenceIds.includes(selectedEvidenceItem.id);

  const handleTender = () => {
    admitEvidence(selectedEvidenceItem.id);
    toast.success(`Tendered ${selectedEvidenceItem.exhibitNumber} to the Court.`);

    if (isCourtroomActive) {
      addTranscriptEntry({
        id: `ev-tender-${Date.now()}`,
        speakerId: 'part-student',
        speakerName: 'Alex Morgan',
        speakerRole: 'Claimant Counsel (You)',
        text: `My Lord, if I may direct the Court and the witness to ${selectedEvidenceItem.exhibitNumber} (${selectedEvidenceItem.title}), which has now been formally tendered into the record.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isKeyMoment: true,
      });
    }

    closeEvidenceViewer();
  };

  return (
    <Dialog open={isEvidenceViewerOpen} onOpenChange={(open) => !open && closeEvidenceViewer()}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-6 border-border">
        <DialogHeader className="space-y-1 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-mono text-xs">
              {selectedEvidenceItem.exhibitNumber}
            </Badge>
            <Badge
              variant={isAdmitted ? 'default' : 'secondary'}
              className="text-[10px] capitalize"
            >
              {isAdmitted ? 'Admitted into Evidence' : 'Marked for Identification'}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-serif font-bold pt-1 text-foreground">
            {selectedEvidenceItem.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground flex items-center gap-3">
            <span>Date: {selectedEvidenceItem.date}</span>
            <span>•</span>
            <span>Source: {selectedEvidenceItem.source}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Summary */}
          <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
              Document Summary
            </span>
            <p className="text-muted-foreground leading-relaxed">
              {selectedEvidenceItem.description}
            </p>
          </div>

          {/* Document Content / Verbatim Preview */}
          <div className="p-4 rounded-lg bg-card border border-border/80 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground bg-muted/10 shadow-inner">
            {selectedEvidenceItem.content}
          </div>

          {/* Relevance & Legal Significance */}
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evidentiary Significance in Proceedings</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {selectedEvidenceItem.relevance}
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={closeEvidenceViewer} className="text-xs">
            Close
          </Button>

          <div className="flex items-center gap-2">
            {isAdmitted ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Admitted on Record</span>
              </div>
            ) : (
              <Button size="sm" onClick={handleTender} className="text-xs gap-1.5 bg-primary font-semibold">
                <FileText className="w-3.5 h-3.5" />
                <span>Tender Exhibit to Court</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
