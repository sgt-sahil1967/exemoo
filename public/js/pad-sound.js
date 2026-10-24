/**
 * Short game sounds the phone plays when the screen sends {t:'sound', name, q} — so the crack of the bat
 * comes from the "bat" in your hand. Synthesized with WebAudio (no files). Browsers only allow audio after
 * a tap, so `unlockSound()` runs from the pad's Start button.
 *
 *   bat     leather on willow; q (0…1) = how clean the contact was (sharper and louder when clean)
 *   edge    thin tick off the edge
 *   four    two rising notes      six   three rising notes      wicket   falling notes
 */
let ac = null;

export function unlockSound() {
  try {
    ac ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    // A silent blip finishes the unlock on iOS.
    const g = ac.createGain();
    g.gain.value = 0;
    g.connect(ac.destination);
    const o = ac.createOscillator();
    o.connect(g);
    o.start();
    o.stop(ac.currentTime + 0.01);
  } catch {
    ac = null;
  }
}

function noise(dur) {
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  const src = ac.createBufferSource();
  src.buffer = buf;
  return src;
}

function env(gain, at, peak, dur) {
  const g = ac.createGain();
  g.gain.setValueAtTime(peak, at);
  g.gain.exponentialRampToValueAtTime(0.0008, at + dur);
  g.connect(ac.destination);
  return g;
}

function tone(freq, at, dur, vol, type = 'triangle') {
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  o.connect(env(null, at, vol, dur));
  o.start(at);
  o.stop(at + dur);
}

export function playSound(name, q = 1) {
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume();
  const at = ac.currentTime + 0.005;
  q = Math.max(0, Math.min(1, Number(q) || 0));
  if (name === 'bat' || name === 'edge') {
    const edge = name === 'edge';
    // The crack: a band of noise, higher and sharper for a clean hit or an edge.
    const n = noise(edge ? 0.03 : 0.06);
    const bp = ac.createBiquadFilter();
    bp.type = edge ? 'highpass' : 'bandpass';
    bp.frequency.value = edge ? 3200 : 1100 + 1700 * q;
    bp.Q.value = edge ? 0.7 : 1.4;
    n.connect(bp).connect(env(null, at, edge ? 0.5 : 0.5 + 0.5 * q, edge ? 0.04 : 0.09));
    n.start(at);
    // The body of the bat: a short low thump (missing on an edge).
    if (!edge) {
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(190 + 60 * q, at);
      o.frequency.exponentialRampToValueAtTime(90, at + 0.08);
      o.connect(env(null, at, 0.35 + 0.35 * q, 0.1));
      o.start(at);
      o.stop(at + 0.12);
    }
  } else if (name === 'four') {
    tone(660, at, 0.18, 0.25);
    tone(880, at + 0.14, 0.3, 0.25);
  } else if (name === 'six') {
    tone(660, at, 0.16, 0.25);
    tone(880, at + 0.12, 0.16, 0.25);
    tone(1175, at + 0.24, 0.4, 0.28);
  } else if (name === 'wicket') {
    tone(440, at, 0.2, 0.25, 'sawtooth');
    tone(330, at + 0.18, 0.2, 0.22, 'sawtooth');
    tone(220, at + 0.36, 0.45, 0.2, 'sawtooth');
  }
}
