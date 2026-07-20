import { useRef } from 'react';

// Tiny Web Audio synth for UI feedback sounds — shared between the map and
// unit pages so both get identical click/success/fail tones.
export default function useGameAudio() {
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playTone = (freq, type, duration, delay = 0) => {
    initAudio();
    setTimeout(() => {
      try {
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch { /* audio blocked */ }
    }, delay);
  };

  const playSuccess = () => { playTone(330, 'sine', 0.1, 0); playTone(440, 'sine', 0.1, 100); playTone(554, 'sine', 0.1, 200); playTone(660, 'sine', 0.25, 300); };
  const playFail = () => { playTone(220, 'sawtooth', 0.2, 0); playTone(180, 'sawtooth', 0.3, 120); };
  const playClick = () => playTone(420, 'sine', 0.08);

  return { initAudio, playSuccess, playFail, playClick };
}
