import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class AudioHapticsService {
  private audioContext: any = null;
  private isSilenced: boolean = false;
  private soundEnabled: boolean = true;
  private pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  public resume() {
    this.isSilenced = false;
  }

  public stopAll() {
    this.isSilenced = true;
    // Clear all scheduled chimes/buzzes
    this.pendingTimeouts.forEach((id) => clearTimeout(id));
    this.pendingTimeouts = [];

    // Suspend web audio context if active
    if (this.audioContext && this.audioContext.state === 'running') {
      try {
        this.audioContext.suspend();
      } catch (e) {}
    }
  }

  private getAudioContext() {
    if (this.isSilenced || !this.soundEnabled) return null;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!this.audioContext) {
          this.audioContext = new AudioContextClass();
        }
        if (this.audioContext.state === 'suspended' && !this.isSilenced) {
          this.audioContext.resume();
        }
        return this.audioContext;
      }
    }
    return null;
  }

  /**
   * Generates crisp synthesized tones on web, zero external audio asset dependency required
   */
  private playWebTone(freq: number, type: OscillatorType, duration: number, gainVal: number = 0.15) {
    if (this.isSilenced || !this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Tactile down-press on the Pochi buzzer
   */
  async playPochiBuzzer() {
    if (this.isSilenced || !this.soundEnabled) return;
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (e) {}

    // 440Hz pop with slight pitch drop
    this.playWebTone(520, 'sine', 0.12, 0.25);
  }

  /**
   * Positive ding on correct answer
   */
  async playCorrect() {
    if (this.isSilenced || !this.soundEnabled) return;
    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {}

    // High 2-tone melodic chime
    this.playWebTone(659.25, 'triangle', 0.18, 0.2); // E5
    const timerId = setTimeout(() => {
      if (!this.isSilenced && this.soundEnabled) {
        this.playWebTone(880, 'triangle', 0.28, 0.25); // A5
      }
    }, 90);
    this.pendingTimeouts.push(timerId);
  }

  /**
   * Soft error thud on wrong answer or timeout
   */
  async playIncorrect() {
    if (this.isSilenced || !this.soundEnabled) return;
    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (e) {}

    // Low 2-tone descending thud
    this.playWebTone(240, 'sawtooth', 0.15, 0.18);
    const timerId = setTimeout(() => {
      if (!this.isSilenced && this.soundEnabled) {
        this.playWebTone(180, 'sawtooth', 0.25, 0.2);
      }
    }, 120);
    this.pendingTimeouts.push(timerId);
  }

  /**
   * Typewriter tick for streaming letters
   */
  async playTypewriterTick() {
    if (this.isSilenced || !this.soundEnabled) return;
    try {
      if (Platform.OS !== 'web') {
        await Haptics.selectionAsync();
      }
    } catch (e) {}

    this.playWebTone(980, 'sine', 0.02, 0.03);
  }
}

export const AudioHaptics = new AudioHapticsService();
