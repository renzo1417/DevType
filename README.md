# DevType — Syntax Speedtyper

> A modern, minimalist syntax typing test engineered specifically for developers and programming language muscle memory.

---

## ⚡ Features

- **4 Practice Categories**:
  - **Full Code**: Multi-line coding snippets across **JavaScript**, **Python**, **C++**, **Java**, and **HTML** with beginner-friendly & advanced tiers.
  - **Keywords & Flow**: Clean, fast 1–2 line syntax expressions & core keywords with minimal symbols.
  - **Developer Words**: High-frequency developer vocabulary in camelCase/PascalCase (no symbols, pure typing rhythm).
  - **Symbols Drill**: Dedicated bracket, arrow, and operator practice (`() => {}`, `[]`, `&& ||`, `<>`).
- **Smart Auto-Indent Engine**: Pressing `Enter` automatically advances past leading line indentation spaces so you land directly on the first code token (with 1-click toggle on the config bar).
- **Smart `Tab` Key**: Pressing `Tab` cleanly consumes 2 spaces of indentation without error penalties.
- **Visual Whitespace Clarity**: Untyped spaces display faint dots (`·`) and return cues (`↵`) so code structure is instantly readable.
- **Tactile 60% Virtual Keyboard**: Interactive mechanical keyboard layout with live key tracking, dynamic active key glows, and visual target key hints.
- **Physical Switch Audio Synthesizer**: 8 synthesized mechanical switch sound profiles powered by the Web Audio API:
  - *Cream Thock (Deep)*
  - *Cherry MX Blue (Clicky)*
  - *Holy Panda (Tactile)*
  - *Vintage Typewriter*
  - *Gateron Yellow (Smooth Linear)*
  - *Kailh Box Navy (Heavy Click)*
  - *Topre Electrostatic (Soft Pop)*
  - *Mute / Silent*
- **Dynamic Accent Themes**: 5 customizable mechanical keycap palettes (Solar Amber, Emerald Mint, Electric Azure, Cyber Violet, Pure Minimal).
- **Full Light & Dark Modes**: Instant seamless base theme toggle with automatic persistence in `localStorage`.
- **Live Telemetry & Performance Analytics**: Real-time tracking of WPM, Raw WPM, Accuracy, Error Breakdown, and timeline SVG performance graphs.
- **Developer Modes**:
  - *Time Mode* (15s, 30s, 60s, 120s)
  - *Snippet Mode* (Complete snippet)
  - *Master Mode* (Hardcore instant restart on error)
  - *Caret Styles* (Line, Block, Underline)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `Esc` | Instant Test Restart |
| `Enter` | New line (with Auto-Indent, jumps to first code token) |
| `Tab` | Smart Indent (advances 2 spaces) |
| `Backspace` | Deletes char (or entire auto-indentation if at line start) |
| `Ctrl` + `Enter` | Next Code Snippet |
| `Click outside` | Pause & Blur Focus |

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Custom Design System)
- **Audio Engine**: Web Audio API (Physical Synthesis)
- **Icons**: Lucide React
- **Typography**: IBM Plex Sans & JetBrains Mono

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 📄 License

MIT
