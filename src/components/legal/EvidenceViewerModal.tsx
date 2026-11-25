'use client';

import React, { useState } from 'react';
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
import { FileText, Sparkles, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { httpCourtroomService, getAuthToken } from '@/services/http';

export function EvidenceViewerModal() {
  const {
    isEvidenceViewerOpen,
    selectedEvidenceItem,
    closeEvidenceViewer,
    admittedEvidenceIds,
    admitEvidence,
    isCourtroomActive,
    isGuestMode,
    activeSession,
    guestSession,
    currentUser,
    selectedRole,
    addTranscriptEntry
  } = useAppStore();

  const [isTendering, setIsTendering] = useState(false);
  const [tenderError, setTenderError] = useState<string | null>(null);

  if (!selectedEvidenceItem) return null;

  const isAdmitted = admittedEvidenceIds.includes(selectedEvidenceItem.id);
  const exhibitLabel = selectedEvidenceItem.exhibitNumber || selectedEvidenceItem.referenceNumber || selectedEvidenceItem.id;
  const isRealSession = isGuestMode || process.env.NEXT_PUBLIC_USE_MOCKS === 'false';
  const activeBackendSessionId = activeSession?.id || guestSession?.id || null;

  const handleTender = async () => {
    if (isTendering || isAdmitted) return;

    if (isRealSession) {
      const token = getAuthToken();
      if (!activeBackendSessionId || !token) {
        const msg = !token
          ? 'Your session token is missing or expired. Please restart your guest session.'
          : 'No active backend session found.';
        setTenderError(msg);
        toast.error(msg);
        return;
      }

      setIsTendering(true);
      setTenderError(null);
      try {
        await httpCourtroomService.tenderEvidence(activeBackendSessionId, selectedEvidenceItem.id);
        admitEvidence(selectedEvidenceItem.id);
        toast.success(`Presented ${exhibitLabel} (${selectedEvidenceItem.title}) into the session record.`);
        closeEvidenceViewer();
      } catch (err: unknown) {
        const rawMsg = err instanceof Error ? err.message : 'Failed to present evidence.';
        let friendlyMsg = rawMsg;
        if (rawMsg.includes('HTTP 409')) {
          admitEvidence(selectedEvidenceItem.id);
          friendlyMsg = 'This exhibit has already been presented in this session.';
        } else if (rawMsg.includes('HTTP 401')) {
          friendlyMsg = 'Authentication expired or invalid. Please restart your session.';
        } else if (rawMsg.includes('HTTP 403') || rawMsg.includes('HTTP 404')) {
          friendlyMsg = 'Session not found or not authorized for your current token.';
        } else if (rawMsg.includes('HTTP 422')) {
          friendlyMsg = 'This evidence item does not belong to the active case.';
        }
        setTenderError(friendlyMsg);
        toast.error(friendlyMsg);
      } finally {
        setIsTendering(false);
      }
      return;
    }

    admitEvidence(selectedEvidenceItem.id);
    toast.success(`Tendered ${exhibitLabel} to the Court.`);

    if (isCourtroomActive) {
      addTranscriptEntry({
        id: `ev-tender-${Date.now()}`,
        speakerId: 'part-student',
        speakerName: currentUser?.fullName || 'Advocate',
        speakerRole: selectedRole === 'defendant_counsel' ? 'Defendant Counsel (You)' : 'Claimant Counsel (You)',
        text: `If I may direct the Court to ${exhibitLabel} (${selectedEvidenceItem.title}), which has now been formally tendered into the record.`,
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
              {exhibitLabel}
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
          {(selectedEvidenceItem.date || selectedEvidenceItem.source) && (
            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-3">
              {selectedEvidenceItem.date && <span>Date: {selectedEvidenceItem.date}</span>}
              {selectedEvidenceItem.date && selectedEvidenceItem.source && <span>•</span>}
              {selectedEvidenceItem.source && <span>Source: {selectedEvidenceItem.source}</span>}
            </DialogDescription>
          )}
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
          {selectedEvidenceItem.content && (
            <div className="p-4 rounded-lg bg-card border border-border/80 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground bg-muted/10 shadow-inner">
              {selectedEvidenceItem.content}
            </div>
          )}

          {/* Relevance & Legal Significance */}
          {selectedEvidenceItem.relevance && (
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evidentiary Significance in Proceedings</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {selectedEvidenceItem.relevance}
              </p>
            </div>
          )}
          {tenderError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{tenderError}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={() => { setTenderError(null); closeEvidenceViewer(); }} disabled={isTendering} className="text-xs">
            Close
          </Button>

          <div className="flex items-center gap-2">
            {isAdmitted ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Presented on Record</span>
              </div>
            ) : (
              <Button size="sm" onClick={handleTender} disabled={isTendering} className="text-xs gap-1.5 bg-primary font-semibold">
                {isTendering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                <span>{isTendering ? 'Presenting…' : 'Tender Exhibit to Court'}</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
