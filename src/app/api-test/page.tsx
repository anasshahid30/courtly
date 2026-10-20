'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2, RefreshCw, ArrowLeft, Database, Globe } from 'lucide-react';
import { apiFetch } from '@/services/http/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SimulationApiItem {
  id: number;
  slug: string;
  title: string;
  domain_slug: string;
  level_number: number;
}

export default function ApiTestPage() {
  const [simulations, setSimulations] = useState<SimulationApiItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);

  const fetchSimulations = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const startTime = performance.now();

    try {
      const data = await apiFetch<SimulationApiItem[]>('/api/v1/simulations');
      const duration = Math.round(performance.now() - startTime);
      setResponseTimeMs(duration);
      setSimulations(data);
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - startTime);
      setResponseTimeMs(duration);
      setErrorMessage(err instanceof Error ? err.message : 'Unknown communication error');
      setSimulations(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      const startTime = performance.now();
      try {
        const data = await apiFetch<SimulationApiItem[]>('/api/v1/simulations');
        if (active) {
          const duration = Math.round(performance.now() - startTime);
          setResponseTimeMs(duration);
          setSimulations(data);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (active) {
          const duration = Math.round(performance.now() - startTime);
          setResponseTimeMs(duration);
          setErrorMessage(err instanceof Error ? err.message : 'Unknown communication error');
          setSimulations(null);
          setIsLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      active = false;
    };
  }, []);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-5">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Frontend-to-Backend HTTP Verification
              </h1>
              <Badge variant="outline" className="text-xs font-mono">
                GET /api/v1/simulations
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Verifying real-time HTTP client communication between Courtly Next.js and FastAPI.
            </p>
          </div>

          <Button
            size="sm"
            onClick={fetchSimulations}
            disabled={isLoading}
            variant="outline"
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Re-test
          </Button>
        </div>

        {/* Backend Target Info Card */}
        <div className="p-4 rounded-xl border border-border/70 bg-card/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="w-4 h-4 text-primary" />
            <span>Target Backend URL:</span>
            <code className="font-mono text-foreground font-semibold px-1.5 py-0.5 rounded bg-muted">
              {backendUrl}/api/v1/simulations
            </code>
          </div>
          {responseTimeMs !== null && (
            <span className="text-muted-foreground text-[11px]">
              Response time: <strong className="text-foreground">{responseTimeMs}ms</strong>
            </span>
          )}
        </div>

        {/* Connection Status Box */}
        {isLoading && (
          <div className="p-6 rounded-xl border border-border/80 bg-card flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Connecting to FastAPI backend at {backendUrl}...</span>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="p-5 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Connection Failed</span>
            </div>
            <p className="text-xs leading-relaxed font-mono pl-7">
              {errorMessage}
            </p>
            <p className="text-[11px] text-destructive/80 pl-7">
              Ensure the FastAPI backend is running on {backendUrl} and CORS allows requests from this origin.
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && simulations && (
          <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Connection Successful (HTTP 200 OK)</span>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                {simulations.length} Record{simulations.length === 1 ? '' : 's'} Received
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground pl-7">
              Successfully communicated with the FastAPI backend via <code className="font-mono">apiFetch</code>. Actual database records retrieved:
            </p>
          </div>
        )}

        {/* Simulation Records List */}
        {!isLoading && simulations && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">
                  Returned Simulation Records ({simulations.length})
                </h2>
              </div>
            </div>

            {simulations.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-border/80 bg-muted/10 text-center text-xs text-muted-foreground">
                No simulation records found in the database.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {simulations.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-border/70 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/40 shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
                          Level {item.level_number}
                        </Badge>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {item.domain_slug}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID: #{item.id}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        slug: <span className="text-foreground">{item.slug}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        Level {item.level_number}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
