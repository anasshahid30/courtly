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
import { Scale, Lock, Mail, User, ShieldCheck, Sparkles, Building } from 'lucide-react';
import { toast } from 'sonner';

export function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, setAuthenticated, openOnboarding, setCurrentUser } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('alex.morgan@lawschool.edu');
  const [name, setName] = useState('Alex Morgan');
  const [role, setRole] = useState<'student' | 'educator'>('student');
  const [institution, setInstitution] = useState('Commonwealth Law School');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address');
      return;
    }

    setAuthenticated(true);
    setCurrentUser({
      id: `user-${Date.now()}`,
      email,
      fullName: name || 'Demo Advocate',
      role: 'student',
      status: 'active',
      institution,
      degreeProgram: 'Bachelor of Laws (LLB)',
      studyLevel: 'Third Year',
      preferredJurisdiction: 'England & Wales',
      preferredLanguage: 'English',
      legalInterests: ['Commercial Law', 'Contract Law', 'Civil Litigation'],
      learningGoals: ['Improve cross-examination', 'Master oral advocacy', 'Handle objections under pressure'],
      completedSimulations: 12,
      totalPracticeHours: 28.5,
      averageScore: 78,
      currentStreak: 5,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    });

    toast.success(mode === 'login' ? 'Signed in successfully!' : 'Account registered successfully!');
    closeAuthModal();

    if (mode === 'register') {
      setTimeout(() => {
        openOnboarding();
      }, 400);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[440px] p-6 border-border">
        <DialogHeader className="text-center sm:text-left space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Scale className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl font-serif font-bold">
              {mode === 'login' ? 'Sign in to Courtly' : 'Create Practice Account'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {mode === 'login'
              ? 'Access your virtual courtroom simulations, research workspace, and judicial feedback.'
              : 'Join the next generation of advocates practicing law with voice AI simulations.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex rounded-lg bg-muted p-1 gap-1 my-2">
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

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
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
                <Label htmlFor="role" className="text-xs font-medium">I am a</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      role === 'student' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="font-semibold text-foreground">Law Student</div>
                    <div className="text-[10px] text-muted-foreground">Practice simulations</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('educator')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      role === 'educator' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="font-semibold text-foreground">Educator / Faculty</div>
                    <div className="text-[10px] text-muted-foreground">Manage cohorts & rubrics</div>
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
            <Label htmlFor="pass" className="text-xs font-medium">Password</Label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                id="pass"
                type="password"
                defaultValue="demo-password-123"
                className="pl-9 h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full h-9 text-xs gap-2 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{mode === 'login' ? 'Enter Simulation Platform' : 'Complete Registration'}</span>
            </Button>
          </div>
        </form>

        <DialogFooter className="sm:justify-center border-t border-border pt-4">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Demo Mode — instant access with mock profile credentials</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
