// ============================================================
// COURTLY — Services Selector (Mock vs HTTP)
// ============================================================

import {
  MockAuthService,
  MockSimulationService,
  MockCourtroomService,
  MockPerformanceService,
  MockNotificationService,
  MockResearchService,
  MockCertificateService,
  authService as mockAuthService,
  simulationService as mockSimulationService,
  courtroomService as mockCourtroomService,
  performanceService as mockPerformanceService,
  researchService as mockResearchService,
  notificationService as mockNotificationService,
  certificateService as mockCertificateService,
} from './mock';

import {
  HttpAuthService,
  HttpSimulationService,
  HttpCourtroomService,
  HttpPerformanceService,
  HttpCertificateService,
  httpAuthService,
  httpSimulationService,
  httpCourtroomService,
  httpPerformanceService,
  httpCertificateService,
  apiFetch,
  setAuthToken,
  getAuthToken,
} from './http';

export * from './interfaces';

export {
  MockAuthService,
  MockSimulationService,
  MockCourtroomService,
  MockPerformanceService,
  MockNotificationService,
  MockResearchService,
  MockCertificateService,
};

export {
  HttpAuthService,
  HttpSimulationService,
  HttpCourtroomService,
  HttpPerformanceService,
  HttpCertificateService,
  apiFetch,
  setAuthToken,
  getAuthToken,
};

const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

export const authService = useMocks ? mockAuthService : httpAuthService;
export const simulationService = useMocks ? mockSimulationService : httpSimulationService;
export const courtroomService = useMocks ? mockCourtroomService : httpCourtroomService;
export const performanceService = useMocks ? mockPerformanceService : httpPerformanceService;
export const certificateService = useMocks ? mockCertificateService : httpCertificateService;
export const researchService = mockResearchService;
export const notificationService = mockNotificationService;
