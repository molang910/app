// Cute synthesized school bell sound using Web Audio API
// No external MP3 downloads needed, works reliably in any browser

class AudioAlarmService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a cheerful 4-note school chime (Marimba / Glockenspiel chime: Sol - Mi - Do - Sol)
  public playSchoolChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Notes frequencies (Hz): G4 (392), B4 (493.88), D5 (587.33), G5 (783.99)
      const notes = [
        { freq: 523.25, time: 0.0, dur: 0.3 },  // C5 (도)
        { freq: 659.25, time: 0.25, dur: 0.3 }, // E5 (미)
        { freq: 783.99, time: 0.5, dur: 0.35 }, // G5 (솔)
        { freq: 1046.5, time: 0.75, dur: 0.6 }, // C6 (높은 도)
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm sine-triangle wave like a cute chime bell
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        // Envelope
        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.25, now + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    } catch (e) {
      console.warn('Audio playback not allowed or failed:', e);
    }
  }

  // Play a short cute pop / notification sound
  public playCutePop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      //
    }
  }
}

export const audioAlarm = new AudioAlarmService();
