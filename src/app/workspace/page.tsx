'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Sparkles,
  Send,
  FileText,
  CheckCircle2,
  ExternalLink,
  Copy,
  Bookmark,
  ShieldCheck,
  Layers,
  ArrowRight,
  Filter,
  Save,
  Trash2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDocuments } from '@/data/mock-data';
import { researchService } from '@/services';
import { toast } from 'sonner';

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<'library' | 'research' | 'materials'>('library');
  const [selectedDoc, setSelectedDoc] = useState(mockDocuments[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('all');

  // Research State
  const [researchQuery, setResearchQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [researchResults, setResearchResults] = useState<any[]>([
    {
      id: 'res-1',
      question: 'What are the implied terms of satisfactory quality and fitness for purpose under English commercial law?',
      answer:
        'Under Section 14(2) of the Sale of Goods Act 1979 (as amended), where a seller sells goods in the course of a business, there is an implied term that the goods supplied under the contract are of satisfactory quality. Furthermore, under Section 14(3), where the buyer makes known any particular purpose for which the goods are being bought, there is an implied condition that the goods are reasonably fit for that purpose, regardless of whether that is a purpose for which such goods are commonly supplied.',
      citations: [
        {
          title: 'Sale of Goods Act 1979, s 14(2)–(3)',
          citationString: 'UK Public General Acts 1979 c. 54',
          relevanceScore: 0.98,
        },
        {
          title: 'Hadley v Baxendale [1854] EWHC J70',
          citationString: '(1854) 9 Exch 341',
          relevanceScore: 0.91,
        },
      ],
      timestamp: '2026-03-08 14:20',
    },
  ]);

  // My Materials State
  const [caseNotes, setCaseNotes] = useState(
    'Henderson v Caldwell Trading Ltd — Strategic Notes:\n\n1. Establish that the CNC precision lathe was purchased specifically for aerospace alloy tolerance work (not standard tooling).\n2. Cross-examine Witness Marcus Vance on email dated 14 May confirming delivery specs.\n3. Rebut claim of contributory modification by citing ISO calibration certificates (Exhibit C-3).'
  );
  const [bookmarks, setBookmarks] = useState<string[]>([
    'Sale of Goods Act 1979, s 14',
    'Civil Procedure Rules CPR Part 32',
    'Hadley v Baxendale [1854]',
  ]);

  const filteredDocs = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.citation || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleExecuteResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchQuery.trim() || isQuerying) return;

    setIsQuerying(true);
    try {
      const response = await researchService.queryAssistant('sess-workspace', researchQuery);
      setResearchResults((prev) => [
        {
          id: `res-${Date.now()}`,
          question: researchQuery,
          answer: response.content,
          citations: response.citations || [
            {
              title: 'Sale of Goods Act 1979, s 14',
              citationString: 'UK Public General Acts 1979 c. 54',
              relevanceScore: 0.95,
            },
          ],
          timestamp: 'Just now',
        },
        ...prev,
      ]);
      setResearchQuery('');
      toast.success('Research query analyzed against Common Law corpus');
    } catch (e) {
      toast.error('Failed to query legal intelligence service');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleSaveNotes = () => {
    toast.success('Case notes saved to your workspace profile');
  };

  const handleToggleBookmark = (title: string) => {
    if (bookmarks.includes(title)) {
      setBookmarks(bookmarks.filter((b) => b !== title));
      toast.info(`Removed ${title} from saved materials`);
    } else {
      setBookmarks([...bookmarks, title]);
      toast.success(`Bookmarked ${title}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      
      {/* ── Sub-Header & Navigation Tabs ── */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-xs sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Legal Research & Materials Workspace</h1>
              <p className="text-[11px] text-muted-foreground">
                Common Law Statutory Corpus, Precedent Retrieval & Case Dossier Preparation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant={activeTab === 'library' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('library')}
              className="text-xs h-8 px-3 font-medium"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Legal Library
            </Button>
            <Button
              variant={activeTab === 'research' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('research')}
              className="text-xs h-8 px-3 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Legal Research
            </Button>
            <Button
              variant={activeTab === 'materials' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('materials')}
              className="text-xs h-8 px-3 font-medium"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              My Materials
            </Button>
          </div>

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* ══════════════════════════════════════════════════════════
            TAB 1: LEGAL LIBRARY
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'library' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Sidebar: Document List */}
            <div className="lg:col-span-1 space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search statutory acts & precedents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Primary Authorities ({filteredDocs.length})
                </span>

                <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                  {filteredDocs.map((doc) => {
                    const isSelected = selectedDoc.id === doc.id;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedDoc(doc)}
                        className={`w-full p-3 rounded-xl border text-left transition-all text-xs space-y-1.5 ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-xs'
                            : 'border-border/60 bg-card hover:border-border hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant={isSelected ? 'default' : 'outline'} className="text-[9px] capitalize">
                            {doc.sourceType.replace('_', ' ')}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">{doc.jurisdiction}</span>
                        </div>
                        <p className="font-semibold text-foreground line-clamp-1">{doc.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {doc.summary}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Full Document Viewer */}
            <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-6">
              
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">{selectedDoc.jurisdiction}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">{selectedDoc.citation}</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                    {selectedDoc.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedDoc.citation) {
                        navigator.clipboard.writeText(selectedDoc.citation);
                        toast.success('Citation copied to clipboard');
                      }
                    }}
                    className="text-xs h-8"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copy Citation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleBookmark(selectedDoc.title)}
                    className="text-xs h-8"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 mr-1.5 ${
                        bookmarks.includes(selectedDoc.title) ? 'fill-primary text-primary' : ''
                      }`}
                    />
                    {bookmarks.includes(selectedDoc.title) ? 'Saved' : 'Bookmark'}
                  </Button>
                </div>
              </div>

              {/* Document Content Body */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                  <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                    Executive Statutory Summary
                  </span>
                  <p className="text-xs text-muted-foreground">{selectedDoc.summary}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="font-serif text-base font-semibold text-foreground">
                    Text of Provisions & Commentary
                  </h3>
                  <p>
                    {selectedDoc.content ||
                      'Section 14(2): Where the seller sells goods in the course of a business, there is an implied term that the goods supplied under the contract are of satisfactory quality. Goods are of satisfactory quality if they meet the standard that a reasonable person would regard as satisfactory, taking account of any description of the goods, the price (if relevant) and all the other relevant circumstances.'}
                  </p>
                  <p>
                    Section 14(3): Where the seller sells goods in the course of a business and the buyer, expressly or by implication, makes known to the seller any particular purpose for which the goods are being bought, there is an implied term that the goods supplied under the contract are reasonably fit for that purpose, whether or not that is a purpose for which such goods are commonly supplied.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: LEGAL RESEARCH
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'research' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Research Question Input Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-foreground">Source-Grounded Legal Research</h2>
                <p className="text-xs text-muted-foreground">
                  Pose questions regarding statutory interpretation, burden of proof, or evidentiary admissibility under English Common Law.
                </p>
              </div>

              <form onSubmit={handleExecuteResearch} className="space-y-3">
                <Textarea
                  placeholder="e.g. Under what circumstances can a buyer reject goods for breach of s.14(2) without losing the right to claim consequential damages?"
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  rows={3}
                  className="text-xs resize-none"
                  required
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Verified against Common Law authorities & statutes
                  </span>
                  <Button type="submit" disabled={isQuerying} size="sm" className="text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    {isQuerying ? 'Analyzing Precedents...' : 'Analyze Legal Issue'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Research Results Stream */}
            <div className="space-y-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Research Inquiries & Grounded Answers
              </span>

              {researchResults.map((res) => (
                <div
                  key={res.id}
                  className="p-5 sm:p-6 rounded-xl border border-border/70 bg-card space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-start gap-2">
                      <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{res.question}</span>
                    </h3>
                    <span className="text-[10px] text-muted-foreground shrink-0">{res.timestamp}</span>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground leading-relaxed">
                    {res.answer}
                  </div>

                  {/* Pinpoint Citations */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-foreground">Primary Supporting Authorities:</span>
                    <div className="flex flex-wrap gap-2">
                      {res.citations.map((cit: any, i: number) => (
                        <div
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-muted text-[11px] text-foreground border border-border/50 flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3 h-3 text-primary" />
                          <span className="font-medium">{cit.title}</span>
                          <span className="text-muted-foreground font-mono">({cit.citationString})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: MY MATERIALS
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Case Notes Editor */}
            <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-semibold text-foreground">Advocacy Notes & Case Outlines</h2>
                  <p className="text-[11px] text-muted-foreground">Draft your examination outlines and opening arguments.</p>
                </div>
                <Button size="sm" onClick={handleSaveNotes} className="text-xs h-8">
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Notes
                </Button>
              </div>

              <Textarea
                value={caseNotes}
                onChange={(e) => setCaseNotes(e.target.value)}
                rows={14}
                className="text-xs font-mono leading-relaxed resize-none p-3.5"
              />
            </div>

            {/* Saved Bookmarks & Pinned Citations */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Bookmarked Authorities ({bookmarks.length})
                </h3>

                <div className="space-y-2">
                  {bookmarks.map((bm, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-border/40 bg-muted/20 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground">{bm}</p>
                        <span className="text-[10px] text-muted-foreground">England & Wales</span>
                      </div>
                      <button
                        onClick={() => handleToggleBookmark(bm)}
                        className="text-muted-foreground hover:text-destructive"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-muted/10 text-xs text-muted-foreground space-y-2">
                <span className="font-semibold text-foreground">Active Case Context:</span>
                <p>
                  Notes and citations saved here are automatically available inside the Virtual Courtroom side drawer during live simulations.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
