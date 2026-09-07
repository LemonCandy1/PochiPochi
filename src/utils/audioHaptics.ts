import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Safely obtain Audio without crashing when ExponentAV is not compiled into runtime
let ExpoAudio: any = null;
try {
  ExpoAudio = require('expo-av')?.Audio;
} catch {
  // Graceful fallback on environments without expo-av native module
}

const correctSoundAsset = require('../../assets/dragon-studio-correct-472358.mp3');
const wrongSoundAsset = require('../../assets/freesound_community-wrong-47985.mp3');

class AudioHapticsService {
  private audioContext: any = null;
  private isSilenced: boolean = false;
  private soundEnabled: boolean = true;
  private pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

  private correctSound: any = null;
  private wrongSound: any = null;
  private audioConfigured: boolean = false;

  constructor() {
    // Eagerly pre-load sounds in background for instant low-latency playback
    if (Platform.OS !== 'web' && ExpoAudio) {
      setTimeout(() => {
        this.initAudio().catch(() => {});
      }, 500);
    }
  }

  private async initAudio() {
    if (this.audioConfigured || !ExpoAudio) return;
    try {
      await ExpoAudio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.audioConfigured = true;

      // Pre-load sounds
      if (!this.correctSound) {
        const { sound } = await ExpoAudio.Sound.createAsync(
          correctSoundAsset,
          { shouldPlay: false, volume: 1.0 }
        );
        this.correctSound = sound;
      }
      if (!this.wrongSound) {
        const { sound } = await ExpoAudio.Sound.createAsync(
          wrongSoundAsset,
          { shouldPlay: false, volume: 1.0 }
        );
        this.wrongSound = sound;
      }
    } catch (e) {
      // Ignore background audio init failures
    }
  }

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

    if (this.correctSound) {
      this.correctSound.stopAsync().catch(() => {});
    }
    if (this.wrongSound) {
      this.wrongSound.stopAsync().catch(() => {});
    }

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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }
    } catch (e) {}

    // 440Hz pop with slight pitch drop
    this.playWebTone(520, 'sine', 0.12, 0.25);
  }

  /**
   * Dragon correct sound from assets when user gets question correct
   */
  async playCorrect() {
    if (this.isSilenced || !this.soundEnabled) return;
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e) {}

    // Play real Dragon Studio correct sound effect
    if (ExpoAudio) {
      try {
        await this.initAudio();
        if (this.correctSound) {
          await this.correctSound.replayAsync();
          return;
        }
        const { sound } = await ExpoAudio.Sound.createAsync(
          correctSoundAsset,
          { shouldPlay: true, volume: 1.0 }
        );
        this.correctSound = sound;
        return;
      } catch (err) {
        // Re-try createAsync on replay failure
        try {
          const { sound } = await ExpoAudio.Sound.createAsync(
            correctSoundAsset,
            { shouldPlay: true, volume: 1.0 }
          );
          this.correctSound = sound;
          return;
        } catch (fallbackErr) {}
      }
    }

    // High 2-tone melodic chime web fallback
    this.playWebTone(659.25, 'triangle', 0.18, 0.2); // E5
    const timerId = setTimeout(() => {
      if (!this.isSilenced && this.soundEnabled) {
        this.playWebTone(880, 'triangle', 0.28, 0.25); // A5
      }
    }, 90);
    this.pendingTimeouts.push(timerId);
  }

  /**
   * Wrong buzzer sound from assets when user gets question incorrect
   */
  async playIncorrect() {
    if (this.isSilenced || !this.soundEnabled) return;
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      }
    } catch (e) {}

    // Play real Wrong Buzzer sound effect
    if (ExpoAudio) {
      try {
        await this.initAudio();
        if (this.wrongSound) {
          await this.wrongSound.replayAsync();
          return;
        }
        const { sound } = await ExpoAudio.Sound.createAsync(
          wrongSoundAsset,
          { shouldPlay: true, volume: 1.0 }
        );
        this.wrongSound = sound;
        return;
      } catch (err) {
        try {
          const { sound } = await ExpoAudio.Sound.createAsync(
            wrongSoundAsset,
            { shouldPlay: true, volume: 1.0 }
          );
          this.wrongSound = sound;
          return;
        } catch (fallbackErr) {}
      }
    }

    // Low 2-tone descending thud web fallback
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
        Haptics.selectionAsync().catch(() => {});
      }
    } catch (e) {}

    this.playWebTone(980, 'sine', 0.02, 0.03);
  }
}

export const AudioHaptics = new AudioHapticsService();
