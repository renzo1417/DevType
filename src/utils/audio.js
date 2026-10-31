const RECORDINGS_URL = `${import.meta.env.BASE_URL}audio/keyboard/recordings.json`;
const SAMPLE_GROUPS = { regular: [0, 24], space: [24, 3], enter: [27, 3], backspace: [30, 2] };

export function prepareRecording(buffer) {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, channel) =>
    buffer.getChannelData(channel),
  );
  let peak = 0,
    power = 0;
  for (const channel of channels) {
    for (const value of channel) {
      peak = Math.max(peak, Math.abs(value));
      power += value * value;
    }
  }
  if (!peak) return { buffer, offset: 0, duration: buffer.duration, gain: 0 };
  const threshold = Math.max(0.001, peak * 0.025);
  let first = channels[0].length - 1,
    last = 0;
  for (const channel of channels) {
    for (let frame = 0; frame < channel.length; frame++) {
      if (Math.abs(channel[frame]) > threshold) {
        first = Math.min(first, frame);
        last = Math.max(last, frame);
      }
    }
  }
  const offset = Math.max(0, first / buffer.sampleRate - 0.001);
  const rms = Math.sqrt(power / (channels.length * channels[0].length));
  return {
    buffer,
    offset,
    duration: Math.min(buffer.duration - offset, last / buffer.sampleRate - offset + 0.025),
    gain: Math.min(4, 0.7 / peak, 0.035 / rms),
  };
}

/** Recordings and decoded buffers are shared; playback never waits for loading. */
export class KeyboardAudio {
  constructor({
    fetchAudio = (url) => fetch(url),
    createContext = () => {
      const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
      return Context ? new Context({ latencyHint: 'interactive' }) : null;
    },
  } = {}) {
    this.fetchAudio = fetchAudio;
    this.createContext = createContext;
    this.options = {
      soundEnabled: true,
      soundVolume: 0.35,
      soundProfile: 'soft',
      completionSound: false,
    };
    this.buffers = [];
    this.sources = new Set();
    this.listeners = new Set();
    this.status = 'idle';
    this.counter = 0;
  }
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getStatus = () => this.status;
  setStatus(status) {
    if (this.status === status) return;
    this.status = status;
    this.listeners.forEach((listener) => listener());
  }
  preload() {
    if (this.download) return this.download;
    this.setStatus('loading');
    // A single JSON pack also avoids download managers intercepting WAV fetches.
    this.download = Promise.resolve()
      .then(() => this.fetchAudio(RECORDINGS_URL))
      .then(async (response) => {
        if (!response.ok) throw new Error('Recording pack unavailable');
        const pack = await response.json();
        if (pack.version !== 1 || !Array.isArray(pack.recordings) || pack.recordings.length !== 32)
          throw new Error('Invalid recording pack');
        return pack.recordings.map((encoded) => {
          try {
            const binary = atob(encoded);
            const bytes = new Uint8Array(binary.length);
            for (let index = 0; index < binary.length; index++)
              bytes[index] = binary.charCodeAt(index);
            return bytes.buffer;
          } catch {
            return null;
          }
        });
      })
      .catch(() => Array(32).fill(null))
      .then((recordings) => {
        if (!recordings.some(Boolean)) this.setStatus('unavailable');
        return recordings;
      });
    return this.download;
  }
  unlock() {
    if (!this.options.soundEnabled || this.options.soundVolume === 0) return Promise.resolve();
    try {
      if (!this.context) {
        this.context = this.createContext();
        if (!this.context) {
          this.setStatus('unavailable');
          return Promise.resolve();
        }
        const context = this.context;
        this.master = context.createGain();
        this.soft = context.createBiquadFilter();
        this.soft.type = 'lowpass';
        this.soft.frequency.value = 2800;
        this.soft.Q.value = 0.5;
        this.soft.connect(this.master);
        const limiter = context.createDynamicsCompressor();
        limiter.threshold.value = -8;
        limiter.knee.value = 6;
        limiter.ratio.value = 12;
        limiter.attack.value = 0.003;
        limiter.release.value = 0.12;
        this.master.connect(limiter);
        limiter.connect(context.destination);
        this.setOptions(this.options);
      }
      const resumed =
        this.context.state === 'suspended'
          ? this.context.resume().catch(() => this.setStatus('unavailable'))
          : Promise.resolve();
      if (!this.decoding) {
        this.decoding = this.preload()
          .then((recordings) =>
            Promise.all(
              recordings.map(async (recording) => {
                if (!recording) return null;
                try {
                  return prepareRecording(await this.context.decodeAudioData(recording));
                } catch {
                  return null;
                }
              }),
            ),
          )
          .then((buffers) => {
            this.buffers = buffers;
            this.setStatus(buffers.some(Boolean) ? 'ready' : 'unavailable');
          })
          .catch(() => this.setStatus('unavailable'));
      }
      // A cached decode can finish before the browser resumes a suspended context.
      return Promise.all([this.decoding, resumed]).then(() => undefined);
    } catch {
      this.setStatus('unavailable');
      return Promise.resolve();
    }
  }
  setOptions(options) {
    this.options = { ...this.options, ...options };
    if (this.master)
      this.master.gain.setValueAtTime(
        this.options.soundEnabled ? this.options.soundVolume * 0.65 : 0,
        this.context.currentTime,
      );
    if (!this.options.soundEnabled || this.options.soundVolume === 0) {
      for (const source of this.sources) {
        try {
          source.stop();
        } catch {
          /* The source may already have ended. */
        }
      }
      this.sources.clear();
    }
  }
  play(keyType = 'regular', delay = 0) {
    if (
      !this.options.soundEnabled ||
      this.options.soundVolume <= 0 ||
      this.status !== 'ready' ||
      this.context.state !== 'running'
    )
      return false;
    const [offset, count] = SAMPLE_GROUPS[keyType] || SAMPLE_GROUPS.regular;
    const recording = this.buffers[offset + (this.counter++ % count)] || this.buffers.find(Boolean);
    if (!recording) return false;
    try {
      if (this.sources.size >= 24) {
        const oldest = this.sources.values().next().value;
        oldest.stop();
        this.sources.delete(oldest);
      }
      const source = this.context.createBufferSource();
      const envelope = this.context.createGain();
      source.buffer = recording.buffer;
      source.playbackRate.value = keyType === 'space' ? 0.88 : keyType === 'enter' ? 0.94 : 1;
      const duration = Math.min(recording.duration, 0.24);
      const start = this.context.currentTime + delay;
      const end = start + duration / source.playbackRate.value;
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(recording.gain, start + 0.002);
      envelope.gain.setValueAtTime(recording.gain, Math.max(start + 0.002, end - 0.02));
      envelope.gain.linearRampToValueAtTime(0, end);
      source.connect(envelope);
      envelope.connect(this.options.soundProfile === 'soft' ? this.soft : this.master);
      source.onended = () => {
        this.sources.delete(source);
        source.disconnect();
        envelope.disconnect();
      };
      this.sources.add(source);
      source.start(start, recording.offset, duration);
      return true;
    } catch {
      return false;
    }
  }
  async preview() {
    if (!this.options.soundEnabled || this.options.soundVolume <= 0) return;
    await this.unlock();
    this.play('regular');
    this.play('regular', 0.09);
    this.play('space', 0.18);
  }
  complete() {
    if (!this.options.completionSound) return;
    this.play('regular');
    this.play('enter', 0.08);
  }
}
export const keyboardAudio = new KeyboardAudio();
