// ============================================================
// COURTLY — Speech Synthesis & Audio Visualizer Utilities
// ============================================================

class CourtlySpeechService {
  private synth: SpeechSynthesis | null = null;
  private isMuted: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public speak(
    text: string,
    role: 'judge' | 'opposing_counsel' | 'witness' | 'student',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth || this.isMuted) {
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 1500);
      return;
    }

    try {
      this.synth.cancel(); // Stop any currently playing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.volume = 0.9;

      // Assign realistic voice pitch and characteristics based on courtroom role
      if (role === 'judge') {
        utterance.pitch = 0.85; // Authoritative, deep
        utterance.rate = 0.95;
      } else if (role === 'opposing_counsel') {
        utterance.pitch = 1.1; // Sharp, articulate
        utterance.rate = 1.05;
      } else if (role === 'witness') {
        utterance.pitch = 1.0; // Conversational
        utterance.rate = 0.95;
      } else {
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      }

      // Try selecting an English voice (preferably UK or US natural)
      if (this.voices.length > 0) {
        const ukVoices = this.voices.filter((v) => v.lang.includes('en-GB') || v.lang.includes('en-US'));
        if (ukVoices.length > 0) {
          if (role === 'judge' && ukVoices[0]) {
            utterance.voice = ukVoices[0];
          } else if (role === 'opposing_counsel' && ukVoices.length > 1) {
            utterance.voice = ukVoices[1];
          } else {
            utterance.voice = ukVoices[0];
          }
        }
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error, falling back', e);
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 1500);
    }
  }

  public cancel() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new CourtlySpeechService();
