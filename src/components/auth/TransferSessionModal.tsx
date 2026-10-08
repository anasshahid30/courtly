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
import { Scale, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function TransferSessionModal() {
  const { isTransferModalOpen, closeTransferModal, transferGuestDataToAccount, guestPerformance } = useAppStore();

  const handleTransfer = () => {
    transferGuestDataToAccount();
    toast.success('Your practice simulation and provisional scores were saved to your registered student profile!');
    closeTransferModal();
  };

  return (
    <Dialog open={isTransferModalOpen} onOpenChange={(open) => !open && closeTransferModal()}>
      <DialogContent className="sm:max-w-[480px] p-6 border-border">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-lg font-serif font-bold text-foreground">
                Save Guest Practice Session?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Transfer your recent courtroom simulation into your registered student history.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 space-y-3">
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Henderson v. Caldwell Trading Ltd</span>
              <Badge variant="default" className="text-[9px]">Provisional Score: 84%</Badge>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Transferring this session will apply toward your <strong>Level 3 — Practicing Advocate</strong> milestone checklist and add to your cumulative practice hours.
            </p>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Timestamped courtroom transcript & notes preserved</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Judicial feedback from Justice Vance linked to student profile</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Calculates progress toward Level 3 Certification eligibility</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={closeTransferModal} className="text-xs">
            Discard Guest Session
          </Button>
          <Button size="sm" onClick={handleTransfer} className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold">
            <span>Transfer to My Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
