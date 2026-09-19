// ============================================================================
// DevType Mechanical Keyboard Audio Synthesizer (Mechvibes-Inspired)
// ============================================================================

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
  { id: 'creamy', name: 'NovelKeys Cream (Creamy)', category: 'Mechvibes', desc: 'Smooth marbly lubed linear with warm acoustic resonance' },
  { id: 'clacky', name: 'Alu Plate Clack (Clacky)', category: 'Mechvibes', desc: 'Crisp, high-pitch snappy bottom-out on rigid plate' },
  { id: 'thock', name: 'Gateron Ink (Deep Thock)', category: 'Mechvibes', desc: 'Deep, bassy wooden hollow thud' },
  { id: 'gateron_yellow', name: 'Gateron Yellow (Silky Linear)', category: 'Smooth', desc: 'Gentle, dampened buttery linear tap' },
  { id: 'tactile', name: 'Holy Panda (Tactile Bump)', category: 'Tactile', desc: 'Chunky round tactile bump with solid bottom-out' },
  { id: 'clicky', name: 'Cherry MX Blue (Clicky)', category: 'Clicky', desc: 'High crisp click jacket snap with leaf ring' },
  { id: 'box_navy', name: 'Kailh Box Navy (Thick Clickbar)', category: 'Clicky', desc: 'Heavy dual-clickbar crack with solid body' },
  { id: 'topre', name: 'Topre Electrostatic (Soft Pop)', category: 'Specialty', desc: 'Rubber dome air cushion pop with gentle whoosh' },
  { id: 'typewriter', name: 'Vintage Typewriter', category: 'Specialty', desc: 'Cast iron strike bar snap with metallic spring ping' },
  { id: 'silent', name: 'Mute / Silent', category: 'Silent', desc: 'Completely muted typing' }
];

/**
 * Play synthesized mechanical switch sound
 * @param {string} soundType Switch sound ID
 * @param {number} volume Volume from 0 to 1
 * @param {boolean} isError Keystroke error flag
 * @param {boolean|string} keyTypeOrIsSpace 'space' | 'enter' | 'backspace' | boolean (isSpace)
 */
export function playKeySound(soundType = 'creamy', volume = 0.75, isError = false, keyTypeOrIsSpace = 'regular') {
  if (soundType === 'silent' || volume <= 0) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.min(1, volume * 0.85), now);
  masterGain.connect(ctx.destination);

  // Normalize key type
  let keyType = 'regular';
  if (typeof keyTypeOrIsSpace === 'boolean') {
    keyType = keyTypeOrIsSpace ? 'space' : 'regular';
  } else if (typeof keyTypeOrIsSpace === 'string') {
    keyType = keyTypeOrIsSpace;
  }

  const isSpace = keyType === 'space';
  const isEnter = keyType === 'enter';
  const isBackspace = keyType === 'backspace';

  // Micro pitch and timbre variance for realistic, non-robotic typing feel
  const pitchVariance = 0.94 + Math.random() * 0.12;
  const timbreVariance = 0.9 + Math.random() * 0.2;

  // =========================================================================
  // 1. NOVELKEYS CREAM (CREAMY - LUBED MARBLY LINEAR)
  // Characteristic: Smooth, marbly, rounded mid-low pop, lubed slider damping
  // =========================================================================
  if (soundType === 'creamy') {
    const baseFreq = (isSpace ? 110 : isEnter ? 135 : isBackspace ? 165 : 150) * pitchVariance;

    // Rounded Transient Stem Impact (soft sine pitch drop)
    const stemOsc = ctx.createOscillator();
    const stemGain = ctx.createGain();
    stemOsc.type = 'sine';
    stemOsc.frequency.setValueAtTime(baseFreq * 2.2, now);
    stemOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, now + 0.038);

    stemGain.gain.setValueAtTime(0.75, now);
    stemGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    stemOsc.connect(stemGain);
    stemGain.connect(masterGain);
    stemOsc.start(now);
    stemOsc.stop(now + 0.04);

    // Warm Marbly Formant Resonance (Dual Bandpass for creamy marble effect)
    const formantOsc = ctx.createOscillator();
    const formantGain = ctx.createGain();
    formantOsc.type = 'triangle';
    formantOsc.frequency.setValueAtTime((isSpace ? 280 : 380) * pitchVariance, now);
    formantOsc.frequency.exponentialRampToValueAtTime((isSpace ? 140 : 210), now + 0.045);

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime((isSpace ? 420 : 620) * timbreVariance, now);
    filter1.Q.setValueAtTime(4.5, now);

    formantGain.gain.setValueAtTime(0.55, now);
    formantGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    formantOsc.connect(filter1);
    filter1.connect(formantGain);
    formantGain.connect(masterGain);
    formantOsc.start(now);
    formantOsc.stop(now + 0.045);

    // Lubed POM Slider Friction Texture (Soft low-pass pink noise burst)
    const bufSize = Math.floor(ctx.sampleRate * 0.03);
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const out = noiseBuf.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1;
      out[i] = (lastOut + 0.03 * white) / 1.03;
      lastOut = out[i];
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuf;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(isSpace ? 800 : 1200, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + 0.03);

  // =========================================================================
  // 2. ALU PLATE CLACK (CLACKY - CRISP HIGH-PITCH MECHANICAL SLAP)
  // Characteristic: Crisp, solid, snappy bottom-out on rigid aluminum plate
  // =========================================================================
  } else if (soundType === 'clacky') {
    const baseFreq = (isSpace ? 340 : isEnter ? 420 : isBackspace ? 540 : 490) * pitchVariance;

    // Sharp Rigid Plate Impact Transient (Fast bright impulse)
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(baseFreq * 4.2, now);
    snapOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.022);

    const snapFilter = ctx.createBiquadFilter();
    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime((isSpace ? 1200 : 1900) * timbreVariance, now);
    snapFilter.Q.setValueAtTime(3.2, now);

    snapGain.gain.setValueAtTime(0.85, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

    snapOsc.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(masterGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.024);

    // Secondary Hard Housing Collision Clack
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime((isSpace ? 210 : 380) * pitchVariance, now + 0.002);
    bodyOsc.frequency.exponentialRampToValueAtTime(120, now + 0.032);

    bodyGain.gain.setValueAtTime(0, now);
    bodyGain.gain.setValueAtTime(0.65, now + 0.002);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.034);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(masterGain);
    bodyOsc.start(now + 0.002);
    bodyOsc.stop(now + 0.034);

    // High-frequency Crisp Acoustic Texture
    const bufSize = Math.floor(ctx.sampleRate * 0.02);
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const out = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      out[i] = (Math.random() * 2 - 1) * 0.7;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuf;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(isSpace ? 1500 : 2600, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + 0.02);

  // =========================================================================
  // 3. GATERON INK / CREAM THOCK (DEEP BASSY THUD)
  // =========================================================================
  } else if (soundType === 'thock') {
    const baseFreq = (isSpace ? 75 : isEnter ? 85 : 98) * pitchVariance;

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
    resOsc.frequency.setValueAtTime((isSpace ? 150 : 190) * pitchVariance, now);
    resOsc.frequency.exponentialRampToValueAtTime(80, now + 0.045);

    resGain.gain.setValueAtTime(0.5, now);
    resGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    resOsc.connect(resGain);
    resGain.connect(masterGain);
    resOsc.start(now);
    resOsc.stop(now + 0.045);

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
  // 4. CHERRY MX BLUE (HIGH CRISP METALLIC CLICK)
  // =========================================================================
  } else if (soundType === 'clicky') {
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sawtooth';
    clickOsc.frequency.setValueAtTime(3800 * pitchVariance, now);
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
    leafOsc.frequency.setValueAtTime(2400 * pitchVariance, now + 0.005);
    leafOsc.frequency.exponentialRampToValueAtTime(600, now + 0.022);

    leafGain.gain.setValueAtTime(0, now);
    leafGain.gain.setValueAtTime(0.55, now + 0.005);
    leafGain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

    leafOsc.connect(leafGain);
    leafGain.connect(masterGain);
    leafOsc.start(now + 0.005);
    leafOsc.stop(now + 0.024);

  // =========================================================================
  // 5. HOLY PANDA (ROUND CHUNKY TACTILE BUMP)
  // =========================================================================
  } else if (soundType === 'tactile') {
    const bumpOsc = ctx.createOscillator();
    const bumpGain = ctx.createGain();
    bumpOsc.type = 'sine';
    bumpOsc.frequency.setValueAtTime(320 * pitchVariance, now);
    bumpOsc.frequency.exponentialRampToValueAtTime(160, now + 0.025);

    bumpGain.gain.setValueAtTime(0.7, now);
    bumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    bumpOsc.connect(bumpGain);
    bumpGain.connect(masterGain);
    bumpOsc.start(now);
    bumpOsc.stop(now + 0.025);

    // Solid Bottom-Out Impact
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impactOsc.type = 'triangle';
    impactOsc.frequency.setValueAtTime((isSpace ? 150 : 210) * pitchVariance, now + 0.008);
    impactOsc.frequency.exponentialRampToValueAtTime(90, now + 0.04);

    impactGain.gain.setValueAtTime(0, now);
    impactGain.gain.setValueAtTime(0.75, now + 0.008);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

    impactOsc.connect(impactGain);
    impactGain.connect(masterGain);
    impactOsc.start(now + 0.008);
    impactOsc.stop(now + 0.042);

  // =========================================================================
  // 6. GATERON YELLOW (SMOOTH SILKY LINEAR TAP)
  // =========================================================================
  } else if (soundType === 'gateron_yellow') {
    const linOsc = ctx.createOscillator();
    const linGain = ctx.createGain();
    linOsc.type = 'sine';
    linOsc.frequency.setValueAtTime((isSpace ? 100 : 140) * pitchVariance, now);
    linOsc.frequency.exponentialRampToValueAtTime(70, now + 0.03);

    linGain.gain.setValueAtTime(0.48, now);
    linGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    linOsc.connect(linGain);
    linGain.connect(masterGain);
    linOsc.start(now);
    linOsc.stop(now + 0.03);

  // =========================================================================
  // 7. KAILH BOX NAVY (HEAVY THICK CLICKBAR CRACK)
  // =========================================================================
  } else if (soundType === 'box_navy') {
    const crackOsc = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crackOsc.type = 'sawtooth';
    crackOsc.frequency.setValueAtTime(4600 * pitchVariance, now);
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

    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'square';
    bodyOsc.frequency.setValueAtTime(380 * pitchVariance, now + 0.004);
    bodyOsc.frequency.exponentialRampToValueAtTime(110, now + 0.035);

    bodyGain.gain.setValueAtTime(0, now);
    bodyGain.gain.setValueAtTime(0.55, now + 0.004);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(masterGain);
    bodyOsc.start(now + 0.004);
    bodyOsc.stop(now + 0.038);

  // =========================================================================
  // 8. TOPRE ELECTROSTATIC (RUBBER DOME POP)
  // =========================================================================
  } else if (soundType === 'topre') {
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime((isSpace ? 230 : 310) * pitchVariance, now);
    popOsc.frequency.exponentialRampToValueAtTime(85, now + 0.045);

    popGain.gain.setValueAtTime(0.8, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    popOsc.connect(popGain);
    popGain.connect(masterGain);
    popOsc.start(now);
    popOsc.stop(now + 0.045);

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

  // =========================================================================
  // 9. VINTAGE TYPEWRITER (METALLIC CARRIAGE STRIKE & SPRING PING)
  // =========================================================================
  } else if (soundType === 'typewriter') {
    const strikeOsc = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    strikeOsc.type = 'square';
    strikeOsc.frequency.setValueAtTime(1400 * pitchVariance, now);
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

    const pingOsc = ctx.createOscillator();
    const pingGain = ctx.createGain();
    pingOsc.type = 'sine';
    pingOsc.frequency.setValueAtTime(2150 * pitchVariance, now + 0.005);

    pingGain.gain.setValueAtTime(0, now);
    pingGain.gain.setValueAtTime(0.35, now + 0.005);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    pingOsc.connect(pingGain);
    pingGain.connect(masterGain);
    pingOsc.start(now + 0.005);
    pingOsc.stop(now + 0.07);
  }
}

/**
 * Play celebration arpeggio on test completion
 * @param {number} volume Master volume
 */
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
