// ============================================================
// COURTLY — Zustand Global Application Store
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  StudentProfile, Simulation, SimulationSession, TranscriptEntry,
  EvidenceItem, JudicialRuling, CaseFile, PerformanceReport,
  AdvocacyLevel, Achievement, CertificateRecord
} from '@/types';
import { mockStudent, mockSimulations, mockCaseFiles, mockPerformanceReport } from '@/data/mock-data';
import { mockAdvocacyLevels, mockAchievements, mockCertificates } from '@/data/learning-levels';

interface AppState {
  // User & Auth State
  currentUser: StudentProfile;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  
  // Guest Session & Transfer State
  guestSession: SimulationSession | null;
  guestPerformance: PerformanceReport | null;
  isTransferModalOpen: boolean;
  openTransferModal: () => void;
  closeTransferModal: () => void;

  setCurrentUser: (user: StudentProfile) => void;
  setAuthenticated: (status: boolean) => void;
  setGuestMode: (isGuest: boolean) => void;
  updateUserPreferences: (prefs: Partial<StudentProfile>) => void;
  loginAsGuest: () => void;
  loginAsStudent: (studentData?: Partial<StudentProfile>) => void;
  transferGuestDataToAccount: () => void;

  // 5-Level Progression & Certifications
  currentLevel: number;
  levelProgressPercentage: number;
  levels: AdvocacyLevel[];
  achievements: Achievement[];
  certificates: CertificateRecord[];
  updateMilestoneStatus: (levelNum: number, milestoneId: string, completed: boolean) => void;

  // Modals & Sheets
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;

  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;

  isObjectionModalOpen: boolean;
  openObjectionModal: () => void;
  closeObjectionModal: () => void;

  isEvidenceViewerOpen: boolean;
  selectedEvidenceItem: EvidenceItem | null;
  openEvidenceViewer: (item: EvidenceItem) => void;
  closeEvidenceViewer: () => void;

  isCaseFileModalOpen: boolean;
  openCaseFileModal: () => void;
  closeCaseFileModal: () => void;

  // Active Simulation & Courtroom State
  activeSimulation: Simulation | null;
  activeCaseFile: CaseFile | null;
  activeSession: SimulationSession | null;
  selectedRole: string;
  selectedDifficulty: string;
  isVoiceMode: boolean;
  isMicMuted: boolean;
  audioSpeechVolume: number;
  speechSynthesisEnabled: boolean;
  
  // Live Courtroom Execution
  courtroomStage: number; // 0 to 5
  isCourtroomActive: boolean;
  isCourtroomPaused: boolean;
  activeSpeakerId: string; // 'part-judge', 'part-opp-counsel', 'part-student', 'part-witness'
  liveTranscript: TranscriptEntry[];
  admittedEvidenceIds: string[];
  sessionTimerSeconds: number;
  recentRuling: JudicialRuling | null;
  
  // Actions
  setActiveSimulation: (sim: Simulation | null) => void;
  setSelectedRole: (role: string) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  setVoiceMode: (isVoice: boolean) => void;
  setMicMuted: (isMuted: boolean) => void;
  setSpeechSynthesisEnabled: (enabled: boolean) => void;
  
  startCourtroomSession: (simId?: string) => void;
  pauseCourtroomSession: () => void;
  resumeCourtroomSession: () => void;
  advanceStage: () => void;
  setCourtroomStage: (stage: number) => void;
  setActiveSpeaker: (speakerId: string) => void;
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  admitEvidence: (evidenceId: string) => void;
  setRecentRuling: (ruling: JudicialRuling | null) => void;
  tickTimer: () => void;
  resetCourtroomSession: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User & Auth defaults
      currentUser: mockStudent,
      isAuthenticated: true,
      isGuestMode: false,
      
      // Guest Temporary Session
      guestSession: null,
      guestPerformance: null,
      isTransferModalOpen: false,
      openTransferModal: () => set({ isTransferModalOpen: true }),
      closeTransferModal: () => set({ isTransferModalOpen: false }),

      setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: true, isGuestMode: false }),
      setAuthenticated: (status) => set({ isAuthenticated: status, isGuestMode: !status }),
      setGuestMode: (isGuest) => set({ isGuestMode: isGuest, isAuthenticated: !isGuest }),
      
      loginAsGuest: () => {
        set({
          isGuestMode: true,
          isAuthenticated: false,
        });
      },

      loginAsStudent: (studentData) => {
        set((state) => ({
          currentUser: { ...state.currentUser, ...(studentData || {}) },
          isAuthenticated: true,
          isGuestMode: false,
        }));
      },

      transferGuestDataToAccount: () => {
        const { guestPerformance, currentUser } = get();
        if (guestPerformance) {
          // Merge guest session to account
          set((state) => ({
            currentUser: {
              ...state.currentUser,
              completedSimulations: state.currentUser.completedSimulations + 1,
            },
            guestSession: null,
            guestPerformance: null,
            isTransferModalOpen: false,
          }));
        }
      },

      updateUserPreferences: (prefs) =>
        set((state) => ({ currentUser: { ...state.currentUser, ...prefs } })),

      // 5-Level Progression Defaults
      currentLevel: 3,
      levelProgressPercentage: 68,
      levels: mockAdvocacyLevels,
      achievements: mockAchievements,
      certificates: mockCertificates,

      updateMilestoneStatus: (levelNum, milestoneId, completed) => {
        set((state) => ({
          levels: state.levels.map((lvl) =>
            lvl.levelNumber === levelNum
              ? {
                  ...lvl,
                  milestones: lvl.milestones.map((m) =>
                    m.id === milestoneId ? { ...m, isCompleted: completed } : m
                  ),
                }
              : lvl
          ),
        }));
      },

      // Modals
      isAuthModalOpen: false,
      authModalMode: 'login',
      openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authModalMode: mode }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),

      isOnboardingOpen: false,
      openOnboarding: () => set({ isOnboardingOpen: true }),
      closeOnboarding: () => set({ isOnboardingOpen: false }),

      isObjectionModalOpen: false,
      openObjectionModal: () => set({ isObjectionModalOpen: true }),
      closeObjectionModal: () => set({ isObjectionModalOpen: false }),

      isEvidenceViewerOpen: false,
      selectedEvidenceItem: null,
      openEvidenceViewer: (item) => set({ isEvidenceViewerOpen: true, selectedEvidenceItem: item }),
      closeEvidenceViewer: () => set({ isEvidenceViewerOpen: false, selectedEvidenceItem: null }),

      isCaseFileModalOpen: false,
      openCaseFileModal: () => set({ isCaseFileModalOpen: true }),
      closeCaseFileModal: () => set({ isCaseFileModalOpen: false }),

      // Active Simulation Defaults
      activeSimulation: mockSimulations[0],
      activeCaseFile: mockCaseFiles[0],
      activeSession: null,
      selectedRole: 'plaintiff_counsel',
      selectedDifficulty: 'intermediate',
      isVoiceMode: true,
      isMicMuted: false,
      audioSpeechVolume: 1.0,
      speechSynthesisEnabled: true,

      // Live Courtroom Execution Defaults
      courtroomStage: 0,
      isCourtroomActive: false,
      isCourtroomPaused: false,
      activeSpeakerId: 'part-judge',
      liveTranscript: [],
      admittedEvidenceIds: ['ev-1'],
      sessionTimerSeconds: 0,
      recentRuling: null,

      setActiveSimulation: (sim) => {
        const caseFile = sim ? mockCaseFiles.find((c) => c.simulationId === sim.id) || mockCaseFiles[0] : null;
        set({ activeSimulation: sim, activeCaseFile: caseFile });
      },
      setSelectedRole: (role) => set({ selectedRole: role }),
      setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),
      setVoiceMode: (isVoice) => set({ isVoiceMode: isVoice }),
      setMicMuted: (isMuted) => set({ isMicMuted: isMuted }),
      setSpeechSynthesisEnabled: (enabled) => set({ speechSynthesisEnabled: enabled }),

      startCourtroomSession: (simId) => {
        const sim = simId ? mockSimulations.find((s) => s.id === simId) || mockSimulations[0] : get().activeSimulation || mockSimulations[0];
        const caseFile = mockCaseFiles.find((c) => c.simulationId === sim.id) || mockCaseFiles[0];
        set({
          activeSimulation: sim,
          activeCaseFile: caseFile,
          isCourtroomActive: true,
          isCourtroomPaused: false,
          courtroomStage: 0,
          sessionTimerSeconds: 0,
          activeSpeakerId: 'part-judge',
          liveTranscript: [
            {
              id: 'init-1',
              speakerId: 'part-judge',
              speakerName: 'The Hon. Justice Robert Vance',
              speakerRole: 'Presiding Judge',
              text: 'The High Court of Justice, Commercial Court is now in session. In the matter of Henderson v Caldwell Trading Ltd (Claim No. CL-2025-000842). Are counsel for the parties ready to proceed?',
              timestamp: '10:00:00',
              isKeyMoment: true,
            },
          ],
          admittedEvidenceIds: ['ev-1'],
          recentRuling: null,
        });
      },

      pauseCourtroomSession: () => set({ isCourtroomPaused: true }),
      resumeCourtroomSession: () => set({ isCourtroomPaused: false }),
      advanceStage: () => set((state) => ({ courtroomStage: Math.min(state.courtroomStage + 1, 5) })),
      setCourtroomStage: (stage) => set({ courtroomStage: stage }),
      setActiveSpeaker: (speakerId) => set({ activeSpeakerId: speakerId }),
      addTranscriptEntry: (entry) =>
        set((state) => ({ liveTranscript: [...state.liveTranscript, entry] })),
      admitEvidence: (evidenceId) =>
        set((state) => ({
          admittedEvidenceIds: state.admittedEvidenceIds.includes(evidenceId)
            ? state.admittedEvidenceIds
            : [...state.admittedEvidenceIds, evidenceId],
        })),
      setRecentRuling: (ruling) => set({ recentRuling: ruling }),
      tickTimer: () => set((state) => ({ sessionTimerSeconds: state.sessionTimerSeconds + 1 })),
      resetCourtroomSession: () =>
        set({
          isCourtroomActive: false,
          isCourtroomPaused: false,
          courtroomStage: 0,
          sessionTimerSeconds: 0,
          activeSpeakerId: 'part-judge',
          liveTranscript: [],
          recentRuling: null,
        }),
    }),
    {
      name: 'courtly_store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        isGuestMode: state.isGuestMode,
        currentLevel: state.currentLevel,
        levelProgressPercentage: state.levelProgressPercentage,
        selectedRole: state.selectedRole,
        selectedDifficulty: state.selectedDifficulty,
        isVoiceMode: state.isVoiceMode,
        speechSynthesisEnabled: state.speechSynthesisEnabled,
      }),
    }
  )
);
