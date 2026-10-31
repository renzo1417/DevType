# DevType

Focused typing practice for developers, built with React 18, Vite, and vanilla CSS.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Node 22.20 or newer is recommended.

## Practice

- **Code:** multiline snippets in JavaScript, Python, C++, Java, and HTML.
- **Keywords:** shorter expressions and language idioms.
- **Words:** developer vocabulary, with independent word boundaries and free-flow mistakes.
- **Symbols:** brackets, operators, and punctuation.

Timed tests run for 15, 30, 60, or 120 active seconds, adding content as needed.
Snippet tests finish the current exercise. Empty spaces cannot skip words.
In words mode, Space commits a word; Backspace can return to a previous one.
Code preserves character positions and requires Enter at explicit newlines.
Automatic indentation is enabled by default and can be changed in Settings.

The timer pauses when focus leaves the typing input, a dialog opens, or the tab
is hidden. Click the canvas to resume, or focus its input and continue typing.
The on-screen keyboard starts collapsed and supports letters, numbers, shifted
symbols, Space, Enter, Tab, Backspace, and modifier combinations.

### Shortcuts

| Key | Action |
| --- | --- |
| Escape | Restart this exercise; close an open dialog |
| Ctrl / Cmd + Enter | Next exercise |
| Enter on results | Next exercise |
| Backspace | Correct text or return to the preceding word |
| Ctrl / Alt / Cmd + Backspace | Delete the current word |
| Tab | Indent at a leading code space; otherwise navigate controls |

### Scoring

- **WPM:** retained correct, manually entered characters / 5 / active minutes.
- **Raw WPM:** all entered characters / 5 / active minutes, including corrected input.
- **Accuracy:** correct input attempts / (all input attempts + skipped letters).
- Automatic indentation and separators between timed code snippets count toward
  progress but do not increase WPM or raw WPM.
- Results show retained correct / incorrect / extra / missed characters.
  Accuracy remembers errors even after text is corrected.

### Sound and preferences

Soft and Mechanical use 32 bundled CC0 recordings. Soft applies a low-pass filter.
Recordings are delivered in one cached JSON pack to avoid download-manager
interception of WAV requests. They are decoded once, balanced, and played with their
leading silence removed. Playback never waits for downloads or decoding.
Keyboard, preview, and optional completion sounds share the same mute control.
Sound starts at 35%; completion cues start disabled.

Preferences are validated and stored under `devtype.preferences.v1`. Existing
appearance, category, indentation, and whitespace preferences migrate on load.
The app keeps working if storage or browser audio is unavailable.

The JSON pack is the only bundled copy of the recordings. A regression test
checks its 32 WAV headers, total size, and SHA-256 digest against the verified
original recordings; separate WAV copies and a packing script are unnecessary.

Recording provenance and license: [public/audio/keyboard/LICENSE.md](public/audio/keyboard/LICENSE.md).

## Verify

```sh
npm test
npm run test:e2e
npm run build
```

The browser suite uses an installed Google Chrome and starts its own Vite server
on port 3100. It covers desktop and an emulated iPhone-sized Chrome viewport,
including mobile input/composition events. Physical iOS/Safari keyboard and audio
behavior requires an actual device check; emulation does not establish that.
Failure traces, screenshots, and input timing reports are written to ignored
`test-results/`. Light/dark code and words screenshots are captured by the visual
checks. Vitest covers the session state machine, exercise pools, preferences,
and cached audio playback.

## Implementation

- `src/engine/session.js`: pure session transitions, timing, scoring, and content continuation.
- `src/hooks/useTypingSession.js`: synchronous event state, timer lifecycle, and audio feedback.
- `src/hooks/useTypingInput.js`: keyboard, beforeinput, composition, and mobile input routing.
- `src/components/TypingArea.jsx`: stable caret and measured row movement.
- `src/utils/audio.js`: cached recordings, balanced playback, and master mute.

No account or backend is required. The project is configured for local development;
this change does not publish a website.
