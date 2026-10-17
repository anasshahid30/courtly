// ============================================================
// COURTLY — HTTP Simulation Service
// ============================================================

import { apiFetch } from './client';
import {
  adaptDomainToLegalDomain,
  adaptSimulationSummary,
  adaptSimulationDetail,
  adaptCaseFile,
  type BackendDomainItem,
  type BackendSimulationSummary,
  type BackendSimulationDetail,
  type BackendCaseFileResponse,
} from './adapters';
import type { SimulationService } from '../interfaces';
import type { CaseFile, Jurisdiction, LegalDomain, Simulation } from '@/types';

export class HttpSimulationService implements SimulationService {
  async getDomains(): Promise<LegalDomain[]> {
    const data = await apiFetch<BackendDomainItem[]>('/api/v1/domains');
    return data.map(adaptDomainToLegalDomain);
  }

  async getJurisdictions(): Promise<Jurisdiction[]> {
    return [
      {
        id: 'jur-cw',
        name: 'Commonwealth Jurisdiction',
        code: 'CW',
        country: 'Commonwealth',
        legalSystem: 'Common Law',
        isActive: true,
      },
    ];
  }

  async getSimulations(filters?: {
    domain?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Simulation[]> {
    const list = await apiFetch<BackendSimulationSummary[]>('/api/v1/simulations');
    let simulations = list.map(adaptSimulationSummary);

    if (filters?.domain && filters.domain !== 'all') {
      simulations = simulations.filter(
        (s) => s.domain === filters.domain || s.legalDomain.slug === filters.domain
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      simulations = simulations.filter(
        (s) => s.title.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return simulations;
  }

  async getSimulationById(id: string): Promise<Simulation | null> {
    try {
      const data = await apiFetch<BackendSimulationDetail>(`/api/v1/simulations/${id}`);
      return adaptSimulationDetail(data);
    } catch {
      return null;
    }
  }

  async getCaseFile(simulationId: string): Promise<CaseFile | null> {
    try {
      const data = await apiFetch<BackendCaseFileResponse>(`/api/v1/simulations/${simulationId}/case-file`);
      return adaptCaseFile(data, simulationId);
    } catch {
      return null;
    }
  }
}

export const httpSimulationService = new HttpSimulationService();
