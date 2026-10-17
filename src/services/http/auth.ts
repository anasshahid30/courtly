// ============================================================
// COURTLY — HTTP Authentication Service
// ============================================================

import { apiFetch, setAuthToken } from './client';
import { adaptUserToStudentProfile, type BackendUserResponse } from './adapters';
import type { AuthService } from '../interfaces';
import type { StudentProfile } from '@/types';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export class HttpAuthService implements AuthService {
  async register(data: Partial<StudentProfile> & { password?: string }): Promise<StudentProfile> {
    const res = await apiFetch<BackendUserResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password || 'CourtlySecure123!',
        full_name: data.fullName || 'New Learner',
      }),
    });

    return adaptUserToStudentProfile(res);
  }

  async login({ email, password }: { email: string; password?: string }): Promise<StudentProfile> {
    const res = await apiFetch<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: password || 'CourtlySecure123!',
      }),
    });

    setAuthToken(res.access_token);

    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Authentication succeeded but failed to fetch user profile');
    }
    return user;
  }

  async getCurrentUser(): Promise<StudentProfile | null> {
    try {
      const res = await apiFetch<BackendUserResponse>('/api/v1/auth/me');
      return adaptUserToStudentProfile(res);
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    setAuthToken(null);
  }

  async updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    const current = await this.getCurrentUser();
    if (!current) {
      throw new Error('No authenticated user');
    }
    return { ...current, ...data };
  }
}

export const httpAuthService = new HttpAuthService();
