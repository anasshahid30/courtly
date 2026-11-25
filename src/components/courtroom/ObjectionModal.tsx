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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Gavel, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { courtroomService } from '@/services';
import { httpCourtroomService, getAuthToken } from '@/services/http';
import { speechService } from '@/lib/audio';

const OBJECTION_TYPES = [
  {
    code: 'leading',
    type: 'Leading the Witness',
    rule: 'CPR Part 32 / Common Law Evidence',
    description: 'Opposing counsel is putting answers directly into the witness’s mouth during direct examination.',
  },
  {
    code: 'hearsay',
    type: 'Hearsay',
    rule: 'Civil Evidence Act 1995',
    description: 'The witness is relaying an out-of-court statement without establishing statutory exception or notice.',
  },
  {
    code: 'relevance',
    type: 'Relevance',
    rule: 'CPR Rule 32.1',
    description: 'The line of questioning has no bearing on the contractual breach or mitigation in dispute.',
  },
  {
    code: 'speculation',
    type: 'Speculation',
    rule: 'Opinion Evidence Rule',
    description: 'The witness is being asked to guess or offer opinion testimony outside their personal knowledge.',
  },
  {
    code: 'argumentative',
    type: 'Argumentative / Badgering',
    rule: 'Advocacy Ethics',
    description: 'Counsel is arguing legal conclusions with the witness rather than eliciting factual evidence.',
  },
  {
    code: 'other',
    type: 'Other Procedural Objection',
    rule: 'Courtroom Procedure',
    description: 'Another procedural or evidentiary objection with specific grounds stated below.',
  },
];

export function ObjectionModal() {
  const {
    isObjectionModalOpen,
    closeObjectionModal,
    addTranscriptEntry,
    addRecordedObjection,
    setRecentRuling,
    setActiveSpeaker,
    speechSynthesisEnabled,
    isGuestMode,
    activeSession,
    guestSession,
    liveTranscript,
    currentUser,
    selectedRole,
  } = useAppStore();

  const [selectedType, setSelectedType] = useState(OBJECTION_TYPES[0].type);
  const [grounds, setGrounds] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isRealSession = isGuestMode || process.env.NEXT_PUBLIC_USE_MOCKS === 'false';
  const activeBackendSessionId = activeSession?.id || guestSession?.id || null;
  const selectedOption = OBJECTION_TYPES.find((o) => o.type === selectedType) || OBJECTION_TYPES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isRealSession) {
      const trimmedGrounds = grounds.trim();
      if (!trimmedGrounds) {
        setSubmitError('Please provide the legal grounds supporting your objection.');
        return;
      }

      const token = getAuthToken();
      if (!activeBackendSessionId || !token) {
        const msg = !token
          ? 'Your session token is missing or expired. Please restart your guest session.'
          : 'No active backend session found.';
        setSubmitError(msg);
        toast.error(msg);
        return;
      }

      // Find the latest persisted numeric turn ID from the transcript
      const persistedTurns = liveTranscript.filter((entry) => /^\d+$/.test(entry.id));
      const latestTurn = persistedTurns[persistedTurns.length - 1];
      if (!latestTurn) {
        const msg = 'Submit at least one courtroom turn to the record before raising an objection.';
        setSubmitError(msg);
        toast.error(msg);
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const recorded = await httpCourtroomService.submitObjection(
          activeBackendSessionId,
          selectedOption.code,
          trimmedGrounds,
          Number(latestTurn.id)
        );
        addRecordedObjection(recorded);
        setRecentRuling(recorded);
        setGrounds('');
        closeObjectionModal();
        toast.success(`Objection (${selectedOption.type}) recorded — status: pending.`);
      } catch (err: unknown) {
        const rawMsg = err instanceof Error ? err.message : 'Failed to record objection.';
        let friendlyMsg = rawMsg;
        if (rawMsg.includes('HTTP 401')) {
          friendlyMsg = 'Authentication expired or invalid. Please restart your session.';
        } else if (rawMsg.includes('HTTP 403') || rawMsg.includes('HTTP 404')) {
          friendlyMsg = 'Session not found or not authorized for your current token.';
        } else if (rawMsg.includes('HTTP 409')) {
          friendlyMsg = 'This trial session is already completed and cannot accept objections.';
        } else if (rawMsg.includes('HTTP 422')) {
          friendlyMsg = 'Invalid objection details or target turn.';
        }
        setSubmitError(friendlyMsg);
        toast.error(friendlyMsg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Non-guest demo flow: preserve existing mock behavior
    setIsSubmitting(true);
    const judgeName = 'The Hon. Justice Robert Vance';
    const judgeShort = 'Justice Vance';

    const objectionText = `Objection, My Lord. Grounds: ${selectedType}. ${grounds ? grounds : 'Counsel’s question is improper at this stage.'}`;
    addTranscriptEntry({
      id: `obj-tr-${Date.now()}`,
      speakerId: 'part-student',
      speakerName: currentUser?.fullName || 'Alex Morgan',
      speakerRole: selectedRole === 'defendant_counsel' ? 'Defendant Counsel (You)' : 'Claimant Counsel (You)',
      text: objectionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isKeyMoment: true,
    });

    closeObjectionModal();
    toast.info('Objection submitted to the Bench...');

    setTimeout(async () => {
      const ruling = await courtroomService.submitObjection('sess-1', selectedType, grounds);
      setRecentRuling(ruling);
      setActiveSpeaker('part-judge');

      const judgeRulingText = ruling.ruling === 'sustained'
        ? `Objection sustained. ${ruling.reasoning}`
        : `Objection overruled. ${ruling.reasoning}`;

      addTranscriptEntry({
        id: `ruling-tr-${Date.now()}`,
        speakerId: 'part-judge',
        speakerName: judgeName,
        speakerRole: 'Presiding Judge',
        text: judgeRulingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isKeyMoment: true,
      });

      if (speechSynthesisEnabled) {
        speechService.speak(judgeRulingText, 'judge', () => {
          setActiveSpeaker('part-judge');
        }, () => {
          setActiveSpeaker('part-opp-counsel');
        });
      }

      if (ruling.ruling === 'sustained') {
        toast.success(`Objection Sustained by ${judgeShort}`);
      } else {
        toast.warning(`Objection Overruled by ${judgeShort}`);
      }

      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Dialog open={isObjectionModalOpen} onOpenChange={(open) => !open && closeObjectionModal()}>
      <DialogContent className="sm:max-w-[540px] p-6 border-border">
        <DialogHeader className="space-y-1 pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
              <Gavel className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-serif font-bold text-foreground">
              Raise Evidentiary Objection
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Intervene before the Judge to challenge improper questions, inadmissible hearsay, or procedural violations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">Objection Grounds</Label>
            <div className="space-y-2">
              {OBJECTION_TYPES.map((obj) => (
                <button
                  key={obj.type}
                  type="button"
                  onClick={() => setSelectedType(obj.type)}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all ${
                    selectedType === obj.type
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{obj.type}</span>
                    <Badge variant="outline" className="text-[9px] font-mono">{obj.rule}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{obj.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="grounds-note" className="text-xs font-semibold text-foreground">
              Submissions in Support {isRealSession ? '(Required)' : '(Optional)'}
            </Label>
            <Textarea
              id="grounds-note"
              value={grounds}
              onChange={(e) => {
                setGrounds(e.target.value);
                if (submitError) setSubmitError(null);
              }}
              disabled={isSubmitting}
              placeholder="State the evidentiary basis for your objection..."
              className="text-xs h-18 resize-none"
            />
          </div>

          {submitError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => { setSubmitError(null); closeObjectionModal(); }} disabled={isSubmitting} className="text-xs">
              Withdraw
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gavel className="w-3.5 h-3.5" />}
              <span>{isSubmitting ? 'Recording…' : 'Submit Objection to Bench'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
