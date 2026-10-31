import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { KeyboardAudio, prepareRecording } from './audio';

function audioFixture() {
  const parameter = () => ({ value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() });
  const node = () => ({ connect: vi.fn(), disconnect: vi.fn() });
  const sources = [];
  const context = {
    state: 'running',
    currentTime: 0,
    destination: {},
    createGain: () => ({ ...node(), gain: parameter() }),
    createBiquadFilter: () => ({ ...node(), frequency: parameter(), Q: parameter() }),
    createDynamicsCompressor: () => ({
      ...node(),
      threshold: parameter(),
      knee: parameter(),
      ratio: parameter(),
      attack: parameter(),
      release: parameter(),
    }),
    createBufferSource: () => {
      const source = { ...node(), playbackRate: parameter(), start: vi.fn(), stop: vi.fn() };
      sources.push(source);
      return source;
    },
    decodeAudioData: vi.fn(async () => ({
      duration: 0.15,
      sampleRate: 1000,
      numberOfChannels: 1,
      getChannelData: () =>
        Float32Array.from({ length: 150 }, (_, frame) => (frame >= 30 && frame < 80 ? 0.1 : 0)),
    })),
    resume: vi.fn(async () => {}),
  };
  const fetchAudio = vi.fn(async () => ({
    ok: true,
    json: async () => ({ version: 1, recordings: Array(32).fill('AQID') }),
  }));
  return {
    engine: new KeyboardAudio({ fetchAudio, createContext: () => context }),
    context,
    fetchAudio,
    sources,
  };
}

describe('recorded audio', () => {
  it('bundles all 32 original recordings without changing their bytes', () => {
    const directory = new URL('../../public/audio/keyboard/', import.meta.url);
    const pack = JSON.parse(readFileSync(new URL('recordings.json', directory), 'utf8'));
    expect(pack.version).toBe(1);
    expect(pack.recordings).toHaveLength(32);
    const recordings = pack.recordings.map((encoded) => Buffer.from(encoded, 'base64'));
    recordings.forEach((recording) => {
      expect(recording.toString('ascii', 0, 4)).toBe('RIFF');
      expect(recording.toString('ascii', 8, 12)).toBe('WAVE');
    });
    const bytes = Buffer.concat(recordings);
    expect(bytes.length).toBe(808320);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(
      'b5cdbd45c1099ec241276fac1ab467baed3acfbd0e3788b03b0d8b4929a16ccd',
    );
  });

  it('survives synchronous fetch failures and malformed recording packs', async () => {
    const failed = new KeyboardAudio({
      fetchAudio: () => {
        throw new Error('Blocked');
      },
    });
    await expect(failed.preload()).resolves.toHaveLength(32);
    expect(failed.getStatus()).toBe('unavailable');
    const invalid = new KeyboardAudio({
      fetchAudio: async () => ({ ok: true, json: async () => ({ version: 2 }) }),
    });
    await expect(invalid.preload()).resolves.toHaveLength(32);
    expect(invalid.getStatus()).toBe('unavailable');
  });
  it('removes leading silence and balances recordings before playback', async () => {
    const { context } = audioFixture();
    const recording = prepareRecording(await context.decodeAudioData());
    expect(recording.offset).toBeCloseTo(0.029);
    expect(recording.duration).toBeLessThan(0.1);
    expect(recording.gain).toBeGreaterThan(0);
    expect(recording.gain * 0.1).toBeLessThanOrEqual(0.7);
  });
  it('downloads and decodes only once, with no loading work on playback', async () => {
    const { engine, context, fetchAudio } = audioFixture();
    await engine.preload();
    await engine.unlock();
    await engine.unlock();
    engine.play();
    engine.play('space');
    expect(fetchAudio).toHaveBeenCalledOnce();
    expect(context.decodeAudioData).toHaveBeenCalledTimes(32);
    expect(engine.sources.size).toBe(2);
  });
  it('allows overlap, cleans up ended voices, and stops all audio when muted', async () => {
    const { engine, sources } = audioFixture();
    await engine.unlock();
    engine.play();
    engine.play('enter');
    expect(sources.every((source) => source.start.mock.calls.length === 1)).toBe(true);
    sources[0].onended();
    expect(sources[0].disconnect).toHaveBeenCalledOnce();
    engine.setOptions({ soundEnabled: false, completionSound: true });
    expect(sources[1].stop).toHaveBeenCalledOnce();
    await engine.preview();
    engine.complete();
    expect(sources).toHaveLength(2);
    expect(engine.sources.size).toBe(0);
  });
  it('waits for a suspended context to resume before previewing cached recordings', async () => {
    const { engine, context, sources } = audioFixture();
    await engine.unlock();
    context.state = 'suspended';
    let finishResume;
    context.resume.mockImplementation(() =>
      new Promise((resolve) => {
        finishResume = () => {
          context.state = 'running';
          resolve();
        };
      }),
    );
    let finished = false;
    const preview = engine.preview().then(() => {
      finished = true;
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(finished).toBe(false);
    expect(sources).toHaveLength(0);
    finishResume();
    await preview;
    expect(sources).toHaveLength(3);
  });
  it('caps polyphony and respects zero volume and completion defaults', async () => {
    const { engine, sources } = audioFixture();
    await engine.unlock();
    engine.complete();
    expect(sources).toHaveLength(0);
    for (let i = 0; i < 30; i++) engine.play();
    expect(engine.sources.size).toBe(24);
    engine.setOptions({ soundVolume: 0 });
    expect(engine.play()).toBe(false);
  });
  it('handles missing recordings and missing Web Audio without throwing', async () => {
    const engine = new KeyboardAudio({
      fetchAudio: async () => {
        throw new Error('Offline');
      },
      createContext: () => null,
    });
    await expect(engine.preload()).resolves.toHaveLength(32);
    await expect(engine.unlock()).resolves.toBeUndefined();
    expect(engine.play()).toBe(false);
    expect(engine.getStatus()).toBe('unavailable');
  });
});
