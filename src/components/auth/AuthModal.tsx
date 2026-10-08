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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Scale, Lock, Mail, User, ShieldCheck, Sparkles,
  Building, Eye, EyeOff, CheckCircle2, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    setAuthenticated,
    openOnboarding,
    setCurrentUser,
    guestPerformance,
    transferGuestDataToAccount
  } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(authModalMode);
  const [email, setEmail] = useState('alex.morgan@lawschool.edu');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('Alex Morgan');
  const [role, setRole] = useState<'student' | 'educator'>('student');
  const [institution, setInstitution] = useState('Commonwealth Law School');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [transferSession, setTransferSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid academic email address');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (!agreedToTerms) {
        toast.error('Please accept the Terms of Service & Academic Integrity policy');
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setAuthenticated(true);
      setCurrentUser({
        id: `user-${Date.now()}`,
        email,
        fullName: name || 'Alex Morgan',
        role: role === 'educator' ? 'educator' : 'student',
        currentLevel: 3,
        levelTitle: 'Practicing Advocate',
        status: 'active',
        institution,
        degreeProgram: 'Bachelor of Laws (LLB)',
        studyLevel: 'Third Year',
        preferredJurisdiction: 'England & Wales',
        preferredLanguage: 'English',
        legalInterests: ['Commercial Law', 'Contract Law', 'Civil Litigation'],
        learningGoals: ['Improve cross-examination', 'Master oral advocacy', 'Handle objections under pressure'],
        completedSimulations: transferSession ? 13 : 12,
        totalPracticeHours: 29.5,
        averageScore: 84,
        currentStreak: 5,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      });

      if (transferSession) {
        transferGuestDataToAccount();
      }

      toast.success(mode === 'login' ? 'Signed in successfully!' : 'Account registered successfully!');
      closeAuthModal();

      if (mode === 'register') {
        setTimeout(() => {
          openOnboarding();
        }, 300);
      }
    }, 600);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Password reset link sent to ${email}`);
    setMode('login');
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[480px] p-6 border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Scale className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl font-serif font-bold">
              {mode === 'login' ? 'Sign in to Courtly' : mode === 'register' ? 'Create Practice Account' : 'Reset Password'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {mode === 'login'
              ? 'Access your 5-level advocacy progression, case briefs, and verified scorecards.'
              : mode === 'register'
              ? 'Register to save simulations, track milestone achievements, and qualify for certificates.'
              : 'Enter your email address to receive password reset instructions.'}
          </DialogDescription>
        </DialogHeader>

        {mode !== 'forgot' && (
          <div className="flex rounded-lg bg-muted p-1 gap-1 my-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === 'login' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === 'register' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {mode === 'forgot' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email" className="text-xs font-medium">Academic Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="pl-9 h-9 text-xs"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-9 text-xs font-semibold">
              Send Reset Instructions
            </Button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-xs text-primary hover:underline text-center w-full block"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
            {mode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="pl-9 h-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Role</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${
                        role === 'student' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="font-semibold text-foreground">Law Student</div>
                      <div className="text-[10px] text-muted-foreground">5-Level Practice Path</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('educator')}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${
                        role === 'educator' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="font-semibold text-foreground">Educator / Faculty</div>
                      <div className="text-[10px] text-muted-foreground">Cohort Rubrics</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="institution" className="text-xs font-medium">University / Law School</Label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      id="institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Commonwealth Law School"
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Academic Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="pl-9 h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pass" className="text-xs font-medium">Password</Label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  id="pass"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-9 h-9 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-pass" className="text-xs font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      id="confirm-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 h-9 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Guest Session Transfer Prompt */}
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-1.5">
                  <label className="flex items-start gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={transferSession}
                      onChange={(e) => setTransferSession(e.target.checked)}
                      className="h-4 w-4 rounded accent-primary mt-0.5"
                    />
                    <div>
                      <span className="font-semibold text-foreground">Save current guest session to account</span>
                      <p className="text-[11px] text-muted-foreground">
                        Preserve your provisional scores in <em>Henderson v Caldwell</em> and add toward Level 3 milestones.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-3.5 w-3.5 rounded accent-primary"
                  />
                  <label htmlFor="terms" className="text-[11px] text-muted-foreground cursor-pointer">
                    I agree to the Terms of Service & Academic Integrity Policy
                  </label>
                </div>
              </>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={isLoading} className="w-full h-9 text-xs gap-2 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
              </Button>
            </div>
          </form>
        )}

        <DialogFooter className="sm:justify-center border-t border-border pt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Public practice open to all • Registered accounts sync progress across devices</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
