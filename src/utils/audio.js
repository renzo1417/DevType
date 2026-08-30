// Web Audio API Mechanical Keyboard Sound Synthesizer
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const SWITCH_SOUNDS = [
  { id: 'thock', name: 'Cream Thock (Deep)' },
  { id: 'clicky', name: 'Cherry MX Blue (Clicky)' },
  { id: 'tactile', name: 'Holy Panda (Tactile)' },
  { id: 'typewriter', name: 'Vintage Typewriter' },
  { id: 'gateron_yellow', name: 'Gateron Yellow (Smooth Linear)' },
  { id: 'box_navy', name: 'Kailh Box Navy (Heavy Click)' },
  { id: 'topre', name: 'Topre Electrostatic (Soft Pop)' },
  { id: 'silent', name: 'Mute / Silent' }
];

export function playKeySound(soundType = 'thock', volume = 0.75, isError = false, isSpace = false) {
  if (soundType === 'silent' || volume <= 0) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume * 0.85, now);
  masterGain.connect(ctx.destination);

  if (isError) {
    // Soft error tone (descending buzz)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
    return;
  }

  // Micro pitch variance for natural acoustic feel
  const variance = 0.94 + Math.random() * 0.12;

  // =========================================================================
  // 1. CREAM THOCK (DEEP & BASSY WOODEN THUD)
  // =========================================================================
  if (soundType === 'thock') {
    const baseFreq = (isSpace ? 75 : 98) * variance;

    // Sub Bass Thump
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq * 1.6, now);
    subOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, now + 0.055);

    subGain.gain.setValueAtTime(0.85, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.055);

    // Deep Hollow Body Resonance
    const resOsc = ctx.createOscillator();
    const resGain = ctx.createGain();
    resOsc.type = 'triangle';
    resOsc.frequency.setValueAtTime(190 * variance, now);
    resOsc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    resGain.gain.setValueAtTime(0.45, now);
    resGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    resOsc.connect(resGain);
    resGain.connect(masterGain);
    resOsc.start(now);
    resOsc.stop(now + 0.04);

    // Low-pass Filtered Brown Noise Thump
    const bufSize = Math.floor(ctx.sampleRate * 0.035);
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const out = noiseBuf.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1;
      out[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = out[i];
      out[i] *= 3.5;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuf;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(isSpace ? 350 : 500, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + 0.035);

  // =========================================================================
  // 2. CHERRY MX BLUE (HIGH CRISP METALLIC CLICK)
  // =========================================================================
  } else if (soundType === 'clicky') {
    // Primary High Metallic Click (Chirp)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sawtooth';
    clickOsc.frequency.setValueAtTime(3800 * variance, now);
    clickOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.012);

    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(2200, now);

    clickGain.gain.setValueAtTime(0.75, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.014);

    // Second Crisp Leaf Click (Delayed by 5ms)
    const leafOsc = ctx.createOscillator();
    const leafGain = ctx.createGain();
    leafOsc.type = 'triangle';
    leafOsc.frequency.setValueAtTime(2400 * variance, now + 0.005);
    leafOsc.frequency.exponentialRampToValueAtTime(600, now + 0.022);

    leafGain.gain.setValueAtTime(0, now);
    leafGain.gain.setValueAtTime(0.55, now + 0.005);
    leafGain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

    leafOsc.connect(leafGain);
    leafGain.connect(masterGain);
    leafOsc.start(now + 0.005);
    leafOsc.stop(now + 0.024);

  // =========================================================================
  // 3. HOLY PANDA (ROUND CHUNKY TACTILE BUMP)
  // =========================================================================
  } else if (soundType === 'tactile') {
    // Pre-Travel Tactile Bump (280Hz rounded hump)
    const bumpOsc = ctx.createOscillator();
    const bumpGain = ctx.createGain();
    bumpOsc.type = 'sine';
    bumpOsc.frequency.setValueAtTime(320 * variance, now);
    bumpOsc.frequency.exponentialRampToValueAtTime(160, now + 0.025);

    bumpGain.gain.setValueAtTime(0.7, now);
    bumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    bumpOsc.connect(bumpGain);
    bumpGain.connect(masterGain);
    bumpOsc.start(now);
    bumpOsc.stop(now + 0.025);

    // Solid Bottom-Out Impact (Delayed by 8ms)
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impactOsc.type = 'triangle';
    impactOsc.frequency.setValueAtTime(210 * variance, now + 0.008);
    impactOsc.frequency.exponentialRampToValueAtTime(90, now + 0.04);

    impactGain.gain.setValueAtTime(0, now);
    impactGain.gain.setValueAtTime(0.75, now + 0.008);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

    impactOsc.connect(impactGain);
    impactGain.connect(masterGain);
    impactOsc.start(now + 0.008);
    impactOsc.stop(now + 0.042);

  // =========================================================================
  // 4. VINTAGE TYPEWRITER (METALLIC CARRIAGE CLACK + SPRING PING)
  // =========================================================================
  } else if (soundType === 'typewriter') {
    // Heavy Metal Typebar Strike
    const strikeOsc = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    strikeOsc.type = 'square';
    strikeOsc.frequency.setValueAtTime(1400 * variance, now);
    strikeOsc.frequency.exponentialRampToValueAtTime(240, now + 0.035);

    const strikeFilter = ctx.createBiquadFilter();
    strikeFilter.type = 'bandpass';
    strikeFilter.frequency.setValueAtTime(1100, now);
    strikeFilter.Q.setValueAtTime(4, now);

    strikeGain.gain.setValueAtTime(0.7, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    strikeOsc.connect(strikeFilter);
    strikeFilter.connect(strikeGain);
    strikeGain.connect(masterGain);
    strikeOsc.start(now);
    strikeOsc.stop(now + 0.035);

    // Metallic Spring Ping Ring
    const pingOsc = ctx.createOscillator();
    const pingGain = ctx.createGain();
    pingOsc.type = 'sine';
    pingOsc.frequency.setValueAtTime(2150 * variance, now + 0.005);

    pingGain.gain.setValueAtTime(0, now);
    pingGain.gain.setValueAtTime(0.35, now + 0.005);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    pingOsc.connect(pingGain);
    pingGain.connect(masterGain);
    pingOsc.start(now + 0.005);
    pingOsc.stop(now + 0.07);

  // =========================================================================
  // 5. GATERON YELLOW (SMOOTH CREAMY LINEAR BOTTOM-OUT)
  // =========================================================================
  } else if (soundType === 'gateron_yellow') {
    // Soft, zero-click, dampened low tap
    const linOsc = ctx.createOscillator();
    const linGain = ctx.createGain();
    linOsc.type = 'sine';
    linOsc.frequency.setValueAtTime(140 * variance, now);
    linOsc.frequency.exponentialRampToValueAtTime(70, now + 0.03);

    linGain.gain.setValueAtTime(0.45, now);
    linGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    linOsc.connect(linGain);
    linGain.connect(masterGain);
    linOsc.start(now);
    linOsc.stop(now + 0.03);

  // =========================================================================
  // 6. KAILH BOX NAVY (HEAVY THICK CLICKBAR CRACK)
  // =========================================================================
  } else if (soundType === 'box_navy') {
    // Sharp clickbar crack
    const crackOsc = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crackOsc.type = 'sawtooth';
    crackOsc.frequency.setValueAtTime(4600 * variance, now);
    crackOsc.frequency.exponentialRampToValueAtTime(800, now + 0.018);

    const crackFilter = ctx.createBiquadFilter();
    crackFilter.type = 'bandpass';
    crackFilter.frequency.setValueAtTime(3200, now);
    crackFilter.Q.setValueAtTime(3, now);

    crackGain.gain.setValueAtTime(0.85, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    crackOsc.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(masterGain);
    crackOsc.start(now);
    crackOsc.stop(now + 0.02);

    // Thick bottom-out body
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'square';
    bodyOsc.frequency.setValueAtTime(380 * variance, now + 0.004);
    bodyOsc.frequency.exponentialRampToValueAtTime(110, now + 0.035);

    bodyGain.gain.setValueAtTime(0, now);
    bodyGain.gain.setValueAtTime(0.55, now + 0.004);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(masterGain);
    bodyOsc.start(now + 0.004);
    bodyOsc.stop(now + 0.038);

  // =========================================================================
  // 7. TOPRE ELECTROSTATIC (RUBBER DOME AIR POP)
  // =========================================================================
  } else if (soundType === 'topre') {
    // Rubber Dome Pitch-Dropping "Pop"
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(310 * variance, now);
    popOsc.frequency.exponentialRampToValueAtTime(85, now + 0.045);

    popGain.gain.setValueAtTime(0.8, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    popOsc.connect(popGain);
    popGain.connect(masterGain);
    popOsc.start(now);
    popOsc.stop(now + 0.045);

    // Soft Air Release Whoosh
    const bufSize = Math.floor(ctx.sampleRate * 0.035);
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const out = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      out[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuf;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(540, now);
    noiseFilter.Q.setValueAtTime(4, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + 0.035);
  }
}

export function playCompletionSound(volume = 0.5) {
  const ctx = getAudioContext();
  if (!ctx || volume <= 0) return;

  const now = ctx.currentTime;
  const chordNotes = [523.25, 659.25, 783.99, 1046.50]; // C Major chord arpeggio

  chordNotes.forEach((freq, index) => {
    const noteTime = now + index * 0.07;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.25 * volume, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(noteTime);
    osc.stop(noteTime + 0.45);
  });
}
