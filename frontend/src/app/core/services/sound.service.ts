import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {
  readonly isMuted = signal(false);
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (this.isMuted()) return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  toggleMute(): boolean {
    const nextState = !this.isMuted();
    this.isMuted.set(nextState);
    return nextState;
  }

  playCorrect(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 cheerful chime

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.36);
    });
  }

  playWrong(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    // Gentle playful boing / slide down
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.28);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playWin(): void {
    this.playFireworks();
  }

  playFireworks(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Victory Fanfare Chords (cheerful celebratory arpeggio)
    const fanfare = [
      { freq: 523.25, time: 0.0, dur: 0.16 },  // C5
      { freq: 659.25, time: 0.15, dur: 0.16 }, // E5
      { freq: 783.99, time: 0.30, dur: 0.20 }, // G5
      { freq: 1046.50, time: 0.48, dur: 0.65 }, // C6
      { freq: 1318.51, time: 0.65, dur: 0.8 }, // E6
    ];

    fanfare.forEach(item => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.freq, now + item.time);

      gain.gain.setValueAtTime(0, now + item.time);
      gain.gain.linearRampToValueAtTime(0.25, now + item.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.time + item.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + item.time);
      osc.stop(now + item.time + item.dur + 0.02);
    });

    // 2. Simulated Fireworks Rocket Launch & Bursts (Pop & Crackle)
    const bursts = [0.1, 0.45, 0.85, 1.25, 1.7];
    bursts.forEach(startTime => {
      // Boom thud
      const boomOsc = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(150, now + startTime);
      boomOsc.frequency.exponentialRampToValueAtTime(40, now + startTime + 0.25);

      boomGain.gain.setValueAtTime(0.3, now + startTime);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + startTime + 0.3);

      boomOsc.connect(boomGain);
      boomGain.connect(ctx.destination);
      boomOsc.start(now + startTime);
      boomOsc.stop(now + startTime + 0.32);

      // Crackles / Sparkles
      for (let i = 0; i < 4; i++) {
        const crackleTime = startTime + 0.08 + i * 0.04;
        const crackleOsc = ctx.createOscillator();
        const crackleGain = ctx.createGain();

        crackleOsc.type = 'square';
        crackleOsc.frequency.setValueAtTime(800 + Math.random() * 1200, now + crackleTime);

        crackleGain.gain.setValueAtTime(0.08, now + crackleTime);
        crackleGain.gain.exponentialRampToValueAtTime(0.001, now + crackleTime + 0.05);

        crackleOsc.connect(crackleGain);
        crackleGain.connect(ctx.destination);

        crackleOsc.start(now + crackleTime);
        crackleOsc.stop(now + crackleTime + 0.06);
      }
    });
  }
}
