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
import { Scale, AlertTriangle, Sparkles, Gavel, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { courtroomService } from '@/services';
import { speechService } from '@/lib/audio';

const OBJECTION_TYPES = [
  {
    type: 'Leading the Witness',
    rule: 'CPR Part 32 / Common Law Evidence',
    description: 'Opposing counsel is putting answers directly into the witness’s mouth during direct examination.',
  },
  {
    type: 'Hearsay',
    rule: 'Civil Evidence Act 1995',
    description: 'The witness is relaying an out-of-court statement without establishing statutory exception or notice.',
  },
  {
    type: 'Relevance',
    rule: 'CPR Rule 32.1',
    description: 'The line of questioning has no bearing on the contractual breach or mitigation in dispute.',
  },
  {
    type: 'Speculation',
    rule: 'Opinion Evidence Rule',
    description: 'The witness is being asked to guess or offer opinion testimony outside their personal knowledge.',
  },
  {
    type: 'Argumentative / Badgering',
    rule: 'Advocacy Ethics',
    description: 'Counsel is arguing legal conclusions with the witness rather than eliciting factual evidence.',
  },
];

export function ObjectionModal() {
  const {
    isObjectionModalOpen,
    closeObjectionModal,
    addTranscriptEntry,
    setRecentRuling,
    setActiveSpeaker,
    speechSynthesisEnabled
  } = useAppStore();

  const [selectedType, setSelectedType] = useState(OBJECTION_TYPES[0].type);
  const [grounds, setGrounds] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Add student's objection to live transcript
    const objectionText = `Objection, My Lord. Grounds: ${selectedType}. ${grounds ? grounds : 'Counsel’s question is improper at this stage.'}`;
    addTranscriptEntry({
      id: `obj-tr-${Date.now()}`,
      speakerId: 'part-student',
      speakerName: 'Alex Morgan',
      speakerRole: 'Claimant Counsel (You)',
      text: objectionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isKeyMoment: true,
    });

    closeObjectionModal();
    toast.info('Objection submitted to the Bench...');

    // 2. Simulate AI Judge consideration and live judicial ruling
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
        speakerName: 'The Hon. Justice Robert Vance',
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
        toast.success('Objection Sustained by Justice Vance (+5 points)');
      } else {
        toast.warning('Objection Overruled by Justice Vance');
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
              Submissions in Support (Optional)
            </Label>
            <Textarea
              id="grounds-note"
              value={grounds}
              onChange={(e) => setGrounds(e.target.value)}
              placeholder="e.g. My Lord, the witness is being invited to speculate on market conditions outside her knowledge..."
              className="text-xs h-18 resize-none"
            />
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={closeObjectionModal} className="text-xs">
              Withdraw
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Submit Objection to Bench</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
