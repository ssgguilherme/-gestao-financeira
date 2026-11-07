/**
 * Voice Narration & Audio Synthesizer Service
 * Utilizes Web Speech API (pt-BR) with audio visualizer callbacks and audio oscillator fallback.
 */

type WordCallback = (currentWordIndex: number, currentWord: string) => void;
type EndCallback = () => void;

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isMuted: boolean = false;
  private volume: number = 1.0;
  private playbackRate: number = 1.0;
  private voices: SpeechSynthesisVoice[] = [];
  private onWordCallback: WordCallback | null = null;
  private onEndCallback: EndCallback | null = null;
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isSpeakingState: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter((v) => v.lang.startsWith('pt') || v.lang.startsWith('en'));
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      volume?: number;
      onWord?: WordCallback;
      onEnd?: EndCallback;
    }
  ) {
    this.stop();

    this.playbackRate = options?.rate ?? this.playbackRate;
    this.volume = options?.volume ?? this.volume;
    this.onWordCallback = options?.onWord ?? null;
    this.onEndCallback = options?.onEnd ?? null;

    if (this.isMuted) {
      this.isSpeakingState = true;
      // Simulate word progress in muted mode
      this.simulateSpeechProgress(text, this.playbackRate);
      return;
    }

    if (!this.synth) {
      this.simulateSpeechProgress(text, this.playbackRate);
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Pick Portuguese voice if available
    const ptVoice =
      this.voices.find(
        (v) =>
          v.lang === 'pt-BR' &&
          (v.name.includes('Google') || v.name.includes('Luciana') || v.name.includes('Felipe') || v.name.includes('Natural'))
      ) ||
      this.voices.find((v) => v.lang.startsWith('pt-BR')) ||
      this.voices.find((v) => v.lang.startsWith('pt'));

    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.lang = 'pt-BR';
    utterance.rate = this.playbackRate;
    utterance.pitch = 1.02;
    utterance.volume = this.volume;

    const words = text.split(/\s+/);

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        const textBefore = text.slice(0, charIndex);
        const wordIndex = textBefore.trim().split(/\s+/).length - 1;
        if (wordIndex >= 0 && wordIndex < words.length && this.onWordCallback) {
          this.onWordCallback(wordIndex, words[wordIndex]);
        }
      }
    };

    utterance.onstart = () => {
      this.isSpeakingState = true;
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    utterance.onerror = (err) => {
      console.warn('Speech synthesis error/interrupted:', err);
      this.isSpeakingState = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Could not speak utterance:', e);
      this.simulateSpeechProgress(text, this.playbackRate);
    }
  }

  private simulationTimer: number | null = null;

  private simulateSpeechProgress(text: string, rate: number) {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }

    const words = text.split(/\s+/);
    let index = 0;
    const intervalMs = Math.max(120, Math.floor(280 / rate));

    this.simulationTimer = window.setInterval(() => {
      if (index < words.length) {
        if (this.onWordCallback) {
          this.onWordCallback(index, words[index]);
        }
        index++;
      } else {
        if (this.simulationTimer) {
          clearInterval(this.simulationTimer);
          this.simulationTimer = null;
        }
        this.isSpeakingState = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      }
    }, intervalMs);
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeakingState = false;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentUtterance) {
      this.currentUtterance.volume = this.volume;
    }
  }

  public setRate(rate: number) {
    this.playbackRate = rate;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState || (this.synth ? this.synth.speaking : false);
  }
}

export const ttsService = new TTSService();
