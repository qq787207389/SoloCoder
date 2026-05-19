# 🎛️ ModSynth - Modular Synthesizer

A modern web-based modular synthesizer built with Vue 3, TypeScript, and Web Audio API.

## ✨ Features

### 🎵 Audio Modules
- **Oscillators**: Sine, Sawtooth, Square, Triangle waveforms with frequency and gain control
- **Filters**: Lowpass, Highpass, Bandpass filters with resonance control
- **Envelope Generator**: ADSR (Attack-Decay-Sustain-Release) envelope
- **Gain Control**: Audio level adjustment
- **Reverb**: Convolution reverb effect
- **Delay**: Time-based delay with feedback
- **Output**: Master volume control

### 🔌 Patch Bay
- Drag and drop modules on the canvas
- Connect modules by dragging cables between ports
- Visual Bezier curve connections
- Zoom and pan support

### 🎹 Performance
- **Keyboard Mapping**: A-K-O-L keys mapped to musical notes (C3-C4)
- **Step Sequencer**: Multi-track 16-step sequencer
- **Recording**: Record audio output and download as WAV files
- **Presets**: Save and load patch configurations (JSON format)

### 🎨 Visualization
- **Spectrum Analyzer**: Real-time frequency bar graph
- **Waveform Display**: Oscilloscope-style waveform
- **Particle System**: Audio-reactive particles

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## 📖 Usage Guide

### 1. Initialize Audio
Click **"Click to Start Audio"** to initialize the Web Audio API (browser security requirement).

### 2. Create Your Patch
1. Click module buttons in the top-left to add modules:
   - Start with an **Oscillator** (sound source)
   - Add a **Filter** to shape the sound
   - Add an **Envelope** to control dynamics
   - Add **Reverb** or **Delay** for effects
   - End with an **Output** module to hear sound

2. **Connect modules**:
   - Click an output port (orange circle)
   - Drag and release on an input port (green circle)

### 3. Module Parameters
Each module has adjustable parameters:
- **Oscillator**: Waveform type, Frequency, Gain
- **Filter**: Filter type, Cutoff frequency, Resonance
- **Envelope**: Attack, Decay, Sustain, Release times
- **Delay**: Time, Feedback, Wet mix
- **Reverb**: Wet mix

### 4. Keyboard Play
Use your computer keyboard:
- White keys: A S D F G H J K L
- Black keys: W E T Y U O

### 5. Sequencer
- Click **"+ Track"** to add a track
- Click steps to toggle notes
- Press Play button to start the sequence
- Adjust BPM (Beats Per Minute)

### 6. Save & Share
- **Save**: Click 💾 Save to download your patch as JSON
- **Load**: Click 📂 Load to restore a saved patch
- **Record**: Click ⏺ Record to capture audio, ⏹ to download WAV

## 🏗️ Architecture

### Core Audio Engine
```
src/audio/AudioEngine.ts
├── Singleton AudioContext manager
├── Module factory pattern
├── Node connection graph
└── Analyser + MediaRecorder outputs
```

### Module Types
- **OscillatorModule**: OscillatorNode + GainNode
- **FilterModule**: BiquadFilterNode
- **EnvelopeModule**: GainNode with scheduled automation
- **DelayModule**: DelayNode + Feedback loop
- **ReverbModule**: ConvolverNode with generated impulse response

### State Management
```
src/composables/useSynth.ts
├── Module state (Map<string, Module>)
├── Connection graph
├── Sequencer state
├── Keyboard handlers
└── Preset import/export
```

## 🔧 Technical Details

### Web Audio API Features
- AudioNode graph architecture
- Automation curves for envelopes
- Convolution reverb with white noise impulse
- MediaRecorder for WAV output
- AnalyserNode for FFT data

### Canvas Visualization
- 3 modes: Spectrum, Waveform, Particles
- 60fps animation loop
- Frequency-based particle velocity
- HSL color gradient for spectrum

### Type Safety
- Strict TypeScript mode
- Typed module parameters
- Connection type validation
- Port direction enforcement

## 📁 Project Structure

```
modsynth/
├── src/
│   ├── audio/
│   │   └── AudioEngine.ts      # Core audio engine
│   ├── components/
│   │   ├── ModuleCanvas.vue     # Patch bay SVG
│   │   ├── Visualizer.vue       # Canvas visualization
│   │   └── Sequencer.vue        # Step sequencer
│   ├── composables/
│   │   └── useSynth.ts          # State management
│   ├── types/
│   │   └── audio.ts             # Type definitions
│   ├── utils/
│   │   └── helpers.ts           # Utility functions
│   ├── App.vue                  # Root component
│   └── main.ts                  # Entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 🎯 Examples

### Basic Patch Example
1. Add **Oscillator** → set to Sawtooth
2. Add **Filter** → set Lowpass, 1000Hz
3. Add **Envelope** → set Attack 0.01s, Release 0.3s
4. Add **Output** → set Volume 0.8
5. Connect: Oscillator Out → Filter In → Envelope In → Output In

### Drum Machine Patch
1. Add 3 Oscillators (Kick, Snare, Hihat)
2. Add individual Envelopes for each
3. Add 3 Sequencer tracks
4. Route all to Output via Gain mixer

## 📝 Notes

- **Web Audio API requires user interaction**: Click to start audio
- **Performance**: Complex patches may use more CPU
- **Browser Support**: Chrome, Firefox, Safari (latest versions)
- **Mobile**: Not optimized for touch devices

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - use freely in your projects!

---

🎵 **Make some noise!** 🎶
