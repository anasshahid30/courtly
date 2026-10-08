'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Search, Sparkles, Send, FileText, CheckCircle2,
  ExternalLink, Copy, Bookmark, ShieldCheck, Database,
  UploadCloud, RefreshCw, Scale, ChevronRight, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDocuments } from '@/data/mock-data';
import { researchService } from '@/services';
import { toast } from 'sonner';

export default function WorkspacePage() {
  const [selectedDoc, setSelectedDoc] = useState(mockDocuments[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: 'Welcome to the Courtly Legal Research Workspace. I can assist you in analyzing statutory provisions under the Sale of Goods Act 1979, formulating arguments on contractual breach, or extracting precedents for your virtual courtroom simulations.',
      timestamp: 'Just now',
      citations: [
        {
          title: 'Sale of Goods Act 1979, s 14(2)',
          citationString: 'UK Public General Acts 1979 c. 54',
          relevanceScore: 0.98,
        },
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  const filteredDocs = mockDocuments.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.summary || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isQuerying) return;

    const userMsg = {
      id: `user-msg-${Date.now()}`,
      role: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsQuerying(true);

    try {
      const response = await researchService.queryAssistant('sess-1', userMsg.content);
      setChatMessages((prev) => [...prev, response]);
    } catch (e) {
      toast.error('Failed to query legal intelligence service');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleSimulateIngestion = () => {
    setIsIngesting(true);
    toast.info('Ingesting moot brief into Courtly RAG vector store...');
    setTimeout(() => {
      setIsIngesting(false);
      toast.success('Successfully extracted 14 chunks and indexed with zero citation conflicts!');
    }, 1800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background text-foreground overflow-hidden">
      
      {/* ── TOP HEADER ── */}
      <div className="p-3 sm:px-6 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-serif text-base font-bold text-foreground">Legal Research & Intelligence Workspace</h1>
            <p className="text-[10px] text-muted-foreground">Common Law Statutory Corpus & Verified Precedents</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 gap-1 hidden sm:inline-flex">
            <ShieldCheck className="w-3 h-3" />
            <span>Legislation.gov.uk Grounded</span>
          </Badge>
          <Button size="sm" onClick={handleSimulateIngestion} disabled={isIngesting} className="h-8 text-xs gap-1.5">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isIngesting ? 'Indexing...' : 'Ingest Document'}</span>
          </Button>
        </div>
      </div>

      {/* ── 3-PANE WORKSPACE LAYOUT ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* ── PANE 1: DOCUMENT BROWSER SIDEBAR (LEFT) ── */}
        <div className="w-full md:w-72 lg:w-80 border-r border-border bg-card/40 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search statutes & cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-1 block">
              Statutory Instruments & Case Law
            </span>
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc.id === doc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full p-2.5 rounded-lg text-left transition-all text-xs space-y-1 ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={isSelected ? 'default' : 'outline'} className="text-[9px] capitalize">
                      {doc.sourceType.replace('_', ' ')}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{doc.year || 1979}</span>
                  </div>
                  <div className="line-clamp-1">{doc.title}</div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 font-normal">
                    {doc.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PANE 2: INTERACTIVE DOCUMENT READER (MIDDLE) ── */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border bg-background">
          <div className="p-3 sm:px-6 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-foreground">{selectedDoc.title}</span>
                <Badge variant="outline" className="text-[9px] font-mono">{selectedDoc.jurisdiction}</Badge>
              </div>
              <span className="text-[10px] text-muted-foreground">{selectedDoc.citation}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (selectedDoc.citation) {
                  navigator.clipboard.writeText(selectedDoc.citation);
                  toast.success('Legal citation copied to clipboard');
                }
              }}
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Citation</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Statutory Summary & Common Law Application
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedDoc.summary}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card font-serif text-xs leading-relaxed text-foreground space-y-3 shadow-inner">
              <div className="font-sans text-xs font-semibold text-primary border-b border-border/60 pb-2 flex items-center justify-between">
                <span>Verbatim Text / Judicial Extract</span>
                <span className="font-mono text-[10px] text-muted-foreground">{selectedDoc.citation}</span>
              </div>
              <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/40">
                {selectedDoc.fullText}
              </div>
            </div>

            {/* Citations & Precedent Cross References */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <span className="text-xs font-semibold text-foreground">Cross-Referenced in Case Files:</span>
              <div className="flex flex-wrap gap-2">
                <Link href="/courtroom">
                  <Badge variant="outline" className="text-xs py-1 px-2.5 gap-1 hover:border-primary cursor-pointer">
                    <Scale className="w-3 h-3 text-primary" />
                    <span>Henderson v Caldwell Trading Ltd</span>
                  </Badge>
                </Link>
                <Badge variant="outline" className="text-xs py-1 px-2.5 gap-1">
                  <Scale className="w-3 h-3 text-primary" />
                  <span>Re: Oakwood Partners LLP</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* ── PANE 3: AI RESEARCH ASSISTANT (RIGHT) ── */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-card/50 overflow-hidden">
          <div className="p-3 border-b border-border flex items-center gap-2 bg-muted/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">AI Legal Research Assistant</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border space-y-1.5 ${
                  msg.role === 'assistant'
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-foreground capitalize">{msg.role}</span>
                  <span className="text-muted-foreground">{msg.timestamp}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  {msg.content}
                </p>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-border/50 space-y-1">
                    <span className="text-[9px] font-semibold text-primary uppercase">Authority:</span>
                    {msg.citations.map((c: any, i: number) => (
                      <div key={i} className="text-[10px] font-mono text-muted-foreground flex items-center justify-between">
                        <span>{c.title}</span>
                        <span className="text-emerald-500 font-bold">{Math.round((c.relevanceScore || 0.95) * 100)}% Match</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isQuerying && (
              <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs text-primary flex items-center gap-2 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesizing Common Law authorities...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex items-center gap-2">
            <Input
              placeholder="Ask a legal research question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="h-9 text-xs"
            />
            <Button type="submit" size="icon" disabled={isQuerying || !chatInput.trim()} className="h-9 w-9 text-primary-foreground">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
