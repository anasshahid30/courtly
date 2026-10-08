'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UserRound,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Mic,
  BookOpen,
  BarChart3,
  ShieldCheck,
  UserPlus,
  LogIn,
  Layers,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    currentUser,
    isAuthenticated,
    isGuestMode,
    openAuthModal,
    setAuthenticated,
    loginAsGuest,
  } = useAppStore();

  const handleTryCourtly = () => {
    loginAsGuest();
    router.push('/dashboard');
    setMobileMenuOpen(false);
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'admin') => {
    openAuthModal(mode);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    setAuthenticated(false);
    loginAsGuest();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* ── Left: Logo & Wordmark ── */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Geometric Architectural Logo Mark */}
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-xs group-hover:bg-primary/90 transition-colors">
              <div className="w-4 h-4 border-2 border-primary-foreground/90 rounded-xs flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary-foreground/90 rounded-xs" />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                courtly<span className="text-primary font-sans font-black">.</span>
              </span>
            </div>
          </Link>

          {/* ── Minimal Public Navigation ── */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground ${
                pathname === '/' ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link
              href="/#about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/#contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Us
            </Link>
          </nav>
        </div>

        {/* ── Right Side Controls ── */}
        <div className="flex items-center gap-3">
          
          {/* Primary Action: Try Courtly */}
          <Button
            size="sm"
            onClick={handleTryCourtly}
            className="hidden sm:inline-flex shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-4"
          >
            Try Courtly
          </Button>

          {/* Account Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center rounded-lg border border-border/70 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Account Menu"
            >
              {isAuthenticated && currentUser ? (
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6 border border-primary/20">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                      {currentUser.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-foreground hidden lg:inline-block max-w-[100px] truncate">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <UserRound className="w-4 h-4 text-foreground/80" />
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg border border-border/80 bg-popover">
              {isAuthenticated && currentUser ? (
                <>
                  <DropdownMenuLabel className="px-2.5 py-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-xs font-semibold text-foreground truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-medium text-primary uppercase tracking-wider">
                        {currentUser.role === 'administrator' ? 'Administrator' : currentUser.levelTitle || 'Student Advocate'}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-border/50" />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer text-xs py-2">
                    <LayoutDashboard className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/courtroom')} className="cursor-pointer text-xs py-2">
                    <Mic className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    Virtual Courtroom
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/workspace')} className="cursor-pointer text-xs py-2">
                    <BookOpen className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    Legal Workspace
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/performance')} className="cursor-pointer text-xs py-2">
                    <BarChart3 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    My Performance
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-border/50" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-xs py-2 text-destructive focus:text-destructive">
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="px-2.5 py-1.5 text-xs text-muted-foreground font-normal">
                    Account Access
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleOpenAuth('register')} className="cursor-pointer text-xs py-2 font-medium">
                    <UserPlus className="w-3.5 h-3.5 mr-2 text-primary" />
                    Create Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleOpenAuth('login')} className="cursor-pointer text-xs py-2">
                    <LogIn className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    Student Login
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-border/50" />
                  <DropdownMenuItem onClick={() => handleOpenAuth('admin')} className="cursor-pointer text-xs py-2 text-muted-foreground hover:text-foreground">
                    <ShieldCheck className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    Admin Login
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background px-4 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-md ${
                pathname === '/' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              Home
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50"
            >
              About Us
            </Link>
            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50"
            >
              Contact Us
            </Link>

            {isAuthenticated && (
              <div className="pt-2 border-t border-border/50 space-y-1">
                <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Practice Portal</p>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 flex items-center gap-2 rounded-md text-muted-foreground hover:bg-muted/50"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/courtroom"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 flex items-center gap-2 rounded-md text-muted-foreground hover:bg-muted/50"
                >
                  <Mic className="w-4 h-4" />
                  Virtual Courtroom
                </Link>
                <Link
                  href="/workspace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 flex items-center gap-2 rounded-md text-muted-foreground hover:bg-muted/50"
                >
                  <BookOpen className="w-4 h-4" />
                  Legal Workspace
                </Link>
                <Link
                  href="/performance"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 flex items-center gap-2 rounded-md text-muted-foreground hover:bg-muted/50"
                >
                  <BarChart3 className="w-4 h-4" />
                  My Performance
                </Link>
              </div>
            )}
          </nav>

          <div className="pt-3 border-t border-border/40 flex flex-col gap-2">
            <Button onClick={handleTryCourtly} className="w-full justify-center text-xs font-semibold">
              Try Courtly
            </Button>
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => handleOpenAuth('login')} className="text-xs">
                  Student Login
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenAuth('register')} className="text-xs">
                  Create Account
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full text-xs text-destructive">
                Log Out
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
