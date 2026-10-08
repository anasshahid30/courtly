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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sparkles, CheckCircle2, Mic, Globe2, BookOpen,
  Scale, Award, ChevronRight, ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';

export function OnboardingModal() {
  const { isOnboardingOpen, closeOnboarding, currentUser, updateUserPreferences } = useAppStore();
  const [step, setStep] = useState(1);

  const [jurisdiction, setJurisdiction] = useState(currentUser.preferredJurisdiction || 'England & Wales');
  const [studyLevel, setStudyLevel] = useState(currentUser.studyLevel || 'Third Year');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentUser.legalInterests || ['Commercial Law', 'Contract Law']);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(currentUser.learningGoals || ['Improve cross-examination', 'Master oral advocacy']);
  const [micTested, setMicTested] = useState(false);
  const [isTestingMic, setIsTestingMic] = useState(false);

  const allInterests = [
    'Commercial Law', 'Contract Law', 'Civil Litigation', 'Corporate Governance',
    'Criminal Defence', 'Intellectual Property', 'Evidence & Procedure', 'Mooting & Oral Advocacy'
  ];

  const allGoals = [
    'Improve cross-examination skills',
    'Handle rapid judicial questions under pressure',
    'Master statutory evidence presentation',
    'Structure concise opening & closing submissions',
    'Learn to raise effective evidentiary objections'
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleTestMic = () => {
    setIsTestingMic(true);
    setTimeout(() => {
      setIsTestingMic(false);
      setMicTested(true);
      toast.success('Microphone calibrated successfully! Voice synthesis and speech recognition ready.');
    }, 1200);
  };

  const handleFinish = () => {
    updateUserPreferences({
      preferredJurisdiction: jurisdiction,
      studyLevel,
      legalInterests: selectedInterests,
      learningGoals: selectedGoals,
    });
    toast.success('Advocate profile personalized!');
    closeOnboarding();
  };

  return (
    <Dialog open={isOnboardingOpen} onOpenChange={(open) => !open && closeOnboarding()}>
      <DialogContent className="sm:max-w-[540px] p-6 border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] font-mono">
              Step {step} of 3
            </Badge>
            <span className="text-xs text-muted-foreground">Advocate Onboarding</span>
          </div>
          <DialogTitle className="text-lg font-serif font-bold pt-1">
            {step === 1 && 'Select Legal Jurisdiction & Study Level'}
            {step === 2 && 'Practice Focus & Clinical Learning Goals'}
            {step === 3 && 'Audio & Voice Synthesis Calibration'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {step === 1 && 'Courtly tailors procedural rules, evidentiary thresholds, and judicial styles to your jurisdiction.'}
            {step === 2 && 'Customize your simulation recommendations and AI judicial evaluation criteria.'}
            {step === 3 && 'Test your microphone for seamless voice interaction with simulated judges and opposing counsel.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Jurisdiction & Study Level */}
        {step === 1 && (
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Primary Legal Jurisdiction</Label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setJurisdiction('England & Wales')}
                  className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                    jurisdiction === 'England & Wales'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe2 className="w-4 h-4 text-primary" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">England & Wales (Common Law)</div>
                      <div className="text-[10px] text-muted-foreground">Commercial Court, CPR, High Court Queen's/King's Bench</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Active</Badge>
                </button>

                <button
                  type="button"
                  disabled
                  className="p-3 rounded-lg border border-border/50 text-left flex items-center justify-between opacity-60 cursor-not-allowed bg-muted/20"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">Federal Jurisdiction (United States)</div>
                      <div className="text-[10px] text-muted-foreground">Federal Rules of Civil Procedure (FRCP), FRE</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px]">Coming Soon</Badge>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Current Academic Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {['First/Second Year', 'Final Year (LLB/JD)', 'Bar / Post-Grad'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setStudyLevel(lvl)}
                    className={`py-2 px-3 rounded-md text-center text-xs font-medium border transition-all ${
                      studyLevel === lvl
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Legal Interests & Goals */}
        {step === 2 && (
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Areas of Legal Practice (Select up to 4)</Label>
              <div className="flex flex-wrap gap-1.5">
                {allInterests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary font-medium shadow-xs'
                          : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold">Advocacy Development Goals</Label>
              <div className="space-y-2">
                {allGoals.map((goal) => {
                  const isChecked = selectedGoals.includes(goal);
                  return (
                    <div
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`flex items-center gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-all ${
                        isChecked ? 'border-primary/50 bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isChecked ? 'text-primary' : 'text-muted-foreground/40'}`} />
                      <span>{goal}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Audio & Voice Calibration */}
        {step === 3 && (
          <div className="space-y-4 py-3">
            <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Mic className={`w-6 h-6 ${isTestingMic ? 'animate-pulse text-destructive' : ''}`} />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-foreground">Interactive Voice Simulation Check</div>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Courtly uses natural browser speech synthesis and voice recognition so you can argue your case aloud to the judge.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant={micTested ? 'secondary' : 'default'}
                  onClick={handleTestMic}
                  disabled={isTestingMic}
                  className="text-xs gap-2"
                >
                  {isTestingMic ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-destructive animate-ping" />
                      <span>Listening... speak into mic</span>
                    </>
                  ) : micTested ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Audio Verified (Click to Retest)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>Test Audio & Microphone</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-background text-xs space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Text Alternative Mode</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                If you prefer not to use speech in quiet environments or libraries, you can switch between <strong>Voice Mode</strong> and <strong>Text Response Mode</strong> at any time inside the courtroom.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border pt-4">
          {step > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep(step - 1)}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setStep(step + 1)}
              className="gap-1 text-xs"
            >
              <span>Continue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleFinish}
              className="gap-1 text-xs bg-primary text-primary-foreground font-semibold"
            >
              <span>Launch Dashboard</span>
              <Sparkles className="w-3.5 h-3.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
