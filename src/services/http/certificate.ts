// ============================================================
// COURTLY — HTTP Certificate Service
// ============================================================

import { apiFetch } from './client';
import {
  adaptCertificateToCertificateRecord,
  type BackendCertificateResponse,
} from './adapters';
import type { CertificateService } from '../interfaces';
import type { CertificateRecord } from '@/types';

export class HttpCertificateService implements CertificateService {
  async claim(): Promise<CertificateRecord> {
    const data = await apiFetch<BackendCertificateResponse>('/api/v1/certificates/claim', {
      method: 'POST',
    });

    return adaptCertificateToCertificateRecord(data);
  }

  async verify(code: string): Promise<CertificateRecord> {
    const data = await apiFetch<BackendCertificateResponse>(
      `/api/v1/certificates/${encodeURIComponent(code)}`
    );

    return adaptCertificateToCertificateRecord(data);
  }
}

export const httpCertificateService = new HttpCertificateService();
