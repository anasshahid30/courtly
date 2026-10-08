'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, Mic, BookOpen, BarChart3, LayoutDashboard, Bell, Sparkles, Menu, X, User as UserIcon, LogOut, Settings, Award } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockNotifications } from '@/data/mock-data';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    currentUser,
    isAuthenticated,
    openAuthModal,
    openOnboarding,
    setAuthenticated
  } = useAppStore();

  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: Scale },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Virtual Courtroom', href: '/courtroom', icon: Mic, badge: 'Flagship' },
    { name: 'Legal Workspace', href: '/workspace', icon: BookOpen },
    { name: 'Performance', href: '/performance', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-foreground">courtly<span className="text-primary font-sans font-black">.</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hidden sm:inline-block">
                  AI Practice
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] font-semibold bg-accent/20 text-accent-foreground px-1.5 py-0.2 rounded border border-accent/30 animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & Auth Controls */}
        <div className="flex items-center gap-3">
          
          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger className="relative h-9 w-9 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background animate-pulse" />
              )}
              <span className="sr-only">Notifications</span>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 shadow-lg border-border" align="end">
              <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-3 text-xs transition-colors hover:bg-muted/50 ${!n.isRead ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-foreground">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground">{n.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick Launch CTA Button */}
          <Link href="/courtroom" className="hidden lg:inline-flex">
            <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-xs">
              <Mic className="w-3.5 h-3.5" />
              <span>Enter Courtroom</span>
            </Button>
          </Link>

          {/* User Profile or Sign In */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 rounded-full flex items-center gap-2 pl-2 pr-3 hover:bg-muted border border-border/50">
                <Avatar className="h-7 w-7 border border-border">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                    {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-foreground hidden sm:inline-block max-w-[100px] truncate">
                  {currentUser.fullName}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg border-border">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{currentUser.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal capitalize">
                        {currentUser.role}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">• {currentUser.institution}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                  <Link href="/dashboard" className="w-full px-2 py-1.5 cursor-pointer flex items-center gap-2 text-xs">
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    <span>My Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <Link href="/performance" className="w-full px-2 py-1.5 cursor-pointer flex items-center gap-2 text-xs">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span>Advocate Scorecard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openOnboarding} className="cursor-pointer flex items-center gap-2 text-xs">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Practice Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setAuthenticated(false)}
                  className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out (Demo)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => openAuthModal('login')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => openAuthModal('register')}>
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <Badge variant="secondary" className="text-[10px]">{link.badge}</Badge>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link href="/courtroom" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full gap-2">
                <Mic className="w-4 h-4" />
                <span>Launch Virtual Courtroom</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
