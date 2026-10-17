'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services';

export function AuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    setAuthenticated,
    openOnboarding,
    setCurrentUser,
    transferGuestDataToAccount,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('Commonwealth Law School');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotView, setIsForgotView] = useState(false);

  useEffect(() => {
    if (authModalMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(authModalMode);
      setIsForgotView(false);
      if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'false') {
        if (authModalMode === 'login') {
          setEmail('alex.morgan@lawschool.edu');
          setPassword('password123');
        } else if (authModalMode === 'admin') {
          setEmail('admin@courtly.law');
          setPassword('adminpass123');
        } else {
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
        }
      } else {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      }
    }
  }, [authModalMode, isAuthModalOpen]);

  const handleFillDemo = (type: 'student' | 'admin') => {
    if (type === 'student') {
      setActiveTab('login');
      setEmail('alex.morgan@lawschool.edu');
      setPassword('password123');
    } else {
      setActiveTab('admin');
      setEmail('admin@courtly.law');
      setPassword('adminpass123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    if (activeTab === 'register') {
      if (!fullName) {
        toast.error('Please enter your full name');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (!agreeTerms) {
        toast.error('Please agree to the Terms of Service & Privacy Policy');
        return;
      }
    }

    setIsLoading(true);

    (async () => {
      try {
        let user;
        if (activeTab === 'register') {
          await authService.register({
            email,
            fullName,
            password,
          });
          user = await authService.login({ email, password });
        } else {
          user = await authService.login({ email, password });
        }

        setAuthenticated(true);
        setCurrentUser(user);
        transferGuestDataToAccount();
        toast.success(
          activeTab === 'register'
            ? 'Account created successfully!'
            : activeTab === 'admin'
            ? 'Signed in as Administrator'
            : 'Signed in successfully!'
        );
        closeAuthModal();
        router.push('/dashboard');

        if (activeTab === 'register') {
          setTimeout(() => {
            openOnboarding();
          }, 300);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your registered email address');
      return;
    }
    toast.success(`Password reset instructions sent to ${email}`);
    setIsForgotView(false);
    setActiveTab('login');
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[460px] p-6 border-border bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 pb-2 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <div className="w-4 h-4 border-2 border-primary rounded-xs flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-xs" />
              </div>
            </div>
            <DialogTitle className="font-serif text-xl font-bold text-foreground">
              {isForgotView
                ? 'Reset Password'
                : activeTab === 'register'
                ? 'Create Your Account'
                : activeTab === 'admin'
                ? 'Administrator Access'
                : 'Student Login'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {isForgotView
              ? 'Enter your institutional email to receive a secure recovery link.'
              : activeTab === 'register'
              ? 'Join Courtly to save practice history, track milestones, and earn certifications.'
              : activeTab === 'admin'
              ? 'Institutional administrators and faculty curriculum managers.'
              : 'Sign in to access your saved simulations, research notes, and learning journey.'}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Switcher Tabs */}
        {!isForgotView && (
          <div className="grid grid-cols-3 gap-1 p-1 bg-muted/60 rounded-lg border border-border/50 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`py-1.5 rounded-md transition-all ${
                activeTab === 'login'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`py-1.5 rounded-md transition-all ${
                activeTab === 'register'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`py-1.5 rounded-md transition-all ${
                activeTab === 'admin'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Admin Login
            </button>
          </div>
        )}

        {/* Forgot Password View */}
        {isForgotView ? (
          <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Academic Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@lawschool.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsForgotView(false)}
                className="flex-1 text-xs"
              >
                Back to Login
              </Button>
              <Button type="submit" size="sm" className="flex-1 text-xs">
                Send Recovery Link
              </Button>
            </div>
          </form>
        ) : (
          /* Main Auth Form */
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            {/* Create Account Fields */}
            {activeTab === 'register' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Full Name</Label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">University / Institution</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="e.g. University Faculty of Law"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                {activeTab === 'admin' ? 'Administrator Email' : 'Email Address'}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={activeTab === 'admin' ? 'admin@courtly.law' : 'alex.morgan@lawschool.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground">Password</Label>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setIsForgotView(true)}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register) */}
            {activeTab === 'register' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>
            )}

            {/* Options Checkboxes */}
            {activeTab === 'login' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <Checkbox checked={rememberMe} onCheckedChange={(c) => setRememberMe(!!c)} />
                  <span>Remember this device</span>
                </label>
              </div>
            )}

            {activeTab === 'register' && (
              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-start gap-2 text-muted-foreground cursor-pointer leading-tight">
                  <Checkbox
                    checked={agreeTerms}
                    onCheckedChange={(c) => setAgreeTerms(!!c)}
                    className="mt-0.5"
                  />
                  <span>
                    I agree to the <span className="text-primary underline">Terms of Service</span> and{' '}
                    <span className="text-primary underline">Academic Honor Code</span>.
                  </span>
                </label>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="p-2.5 bg-muted/40 border border-border/60 rounded-md text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Restricted Access</span>
                </div>
                <p>This portal is designated strictly for institutional faculty and verified platform administrators.</p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full text-xs font-semibold h-9 mt-2">
              {isLoading ? (
                'Authenticating...'
              ) : activeTab === 'register' ? (
                'Create Account'
              ) : activeTab === 'admin' ? (
                'Sign In as Administrator'
              ) : (
                'Sign In to Courtly'
              )}
            </Button>

            {/* Demo Quick Fills */}
            {process.env.NEXT_PUBLIC_USE_MOCKS !== 'false' && (
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Quick demo credentials:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('student')}
                    className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
                  >
                    Student Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin')}
                    className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
                  >
                    Admin Demo
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
