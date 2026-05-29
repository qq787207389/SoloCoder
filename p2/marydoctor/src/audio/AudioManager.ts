export class AudioManager {
    private scene: Phaser.Scene;
    private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
    private musicVolume: number = 0.3;
    private sfxVolume: number = 0.5;
    private currentMusic: Phaser.Sound.BaseSound | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public preload(): void {
        this.scene.load.audio('land', this.generateTone([220], 0.1, 'sine'));
        this.scene.load.audio('rotate', this.generateTone([880], 0.05, 'square'));
        this.scene.load.audio('move', this.generateTone([660], 0.03, 'triangle'));
        
        const clearNotes = [523, 659, 784, 1047];
        this.scene.load.audio('clear', this.generateMelody(clearNotes, 0.1, 'sine'));
        
        const chainNotes = [523, 659, 784, 1047, 1319, 1568];
        this.scene.load.audio('chain', this.generateMelody(chainNotes, 0.08, 'square'));
        
        const winNotes = [523, 659, 784, 1047, 784, 1047, 1319, 1568];
        this.scene.load.audio('win', this.generateMelody(winNotes, 0.2, 'sine'));
        
        const loseNotes = [392, 349, 330, 294, 262];
        this.scene.load.audio('lose', this.generateMelody(loseNotes, 0.3, 'sawtooth'));
        
        this.scene.load.audio('menu_move', this.generateTone([440], 0.05, 'triangle'));
        this.scene.load.audio('menu_select', this.generateTone([660, 880], 0.1, 'sine'));
        
        const bgmNotes = [262, 294, 330, 349, 392, 440, 494, 523];
        this.scene.load.audio('bgm_normal', this.generateBackgroundMusic(bgmNotes, 0.15));
        
        const battleNotes = [330, 349, 392, 440, 494, 523, 587, 659];
        this.scene.load.audio('bgm_battle', this.generateBackgroundMusic(battleNotes, 0.12));
    }

    private generateTone(frequencies: number[], duration: number, type: OscillatorType): string {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const sampleRate = audioContext.sampleRate;
        const length = Math.floor(sampleRate * duration);
        const buffer = audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freqIndex = Math.floor((i / length) * frequencies.length);
            const freq = frequencies[Math.min(freqIndex, frequencies.length - 1)];
            
            let sample = 0;
            const amplitude = 0.3 * (1 - i / length);
            
            switch (type) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * freq * t);
                    break;
                case 'square':
                    sample = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
                    break;
                case 'triangle':
                    sample = 2 * Math.abs(2 * (freq * t - Math.floor(freq * t + 0.5))) - 1;
                    break;
                case 'sawtooth':
                    sample = 2 * (freq * t - Math.floor(freq * t + 0.5));
                    break;
            }
            
            data[i] = sample * amplitude;
        }

        return this.bufferToDataURL(buffer);
    }

    private generateMelody(notes: number[], noteDuration: number, type: OscillatorType): string {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const sampleRate = audioContext.sampleRate;
        const totalLength = Math.floor(sampleRate * noteDuration * notes.length);
        const buffer = audioContext.createBuffer(1, totalLength, sampleRate);
        const data = buffer.getChannelData(0);

        notes.forEach((freq, noteIndex) => {
            const startSample = Math.floor(noteIndex * noteDuration * sampleRate);
            const endSample = Math.floor((noteIndex + 1) * noteDuration * sampleRate);
            
            for (let i = startSample; i < endSample; i++) {
                const t = (i - startSample) / sampleRate;
                const noteProgress = (i - startSample) / (endSample - startSample);
                const amplitude = 0.3 * (1 - noteProgress * 0.5);
                
                let sample = 0;
                switch (type) {
                    case 'sine':
                        sample = Math.sin(2 * Math.PI * freq * t);
                        break;
                    case 'square':
                        sample = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
                        break;
                }
                
                data[i] = sample * amplitude * (noteProgress < 0.1 ? noteProgress * 10 : 1);
            }
        });

        return this.bufferToDataURL(buffer);
    }

    private generateBackgroundMusic(notes: number[], noteDuration: number): string {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const sampleRate = audioContext.sampleRate;
        const totalLength = Math.floor(sampleRate * noteDuration * notes.length * 2);
        const buffer = audioContext.createBuffer(1, totalLength, sampleRate);
        const data = buffer.getChannelData(0);

        const melody = [...notes, ...notes.slice().reverse()];
        
        melody.forEach((freq, noteIndex) => {
            const startSample = Math.floor(noteIndex * noteDuration * sampleRate);
            const endSample = Math.floor((noteIndex + 1) * noteDuration * sampleRate);
            const bassFreq = freq / 2;
            
            for (let i = startSample; i < endSample; i++) {
                const t = (i - startSample) / sampleRate;
                const noteProgress = (i - startSample) / (endSample - startSample);
                const amplitude = 0.15 * (0.8 + Math.sin(noteProgress * Math.PI) * 0.2);
                
                const melodySample = Math.sin(2 * Math.PI * freq * t) * 0.5;
                const bassSample = Math.sin(2 * Math.PI * bassFreq * t) * 0.3;
                
                const envelope = noteProgress < 0.05 ? noteProgress * 20 : 
                                noteProgress > 0.9 ? (1 - noteProgress) * 10 : 1;
                
                data[i] = (melodySample + bassSample) * amplitude * envelope;
            }
        });

        return this.bufferToDataURL(buffer);
    }

    private bufferToDataURL(buffer: AudioBuffer): string {
        const wav = this.audioBufferToWav(buffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        return url;
    }

    private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1;
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        
        const dataLength = buffer.length * blockAlign;
        const bufferLength = 44 + dataLength;
        
        const arrayBuffer = new ArrayBuffer(bufferLength);
        const view = new DataView(arrayBuffer);
        
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);
        
        const channels: Float32Array[] = [];
        for (let i = 0; i < numChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }
        
        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
                const sample = Math.max(-1, Math.min(1, channels[ch][i]));
                const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset, intSample, true);
                offset += 2;
            }
        }
        
        return arrayBuffer;
    }

    private writeString(view: DataView, offset: number, str: string): void {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    public createSounds(): void {
        const soundKeys = ['land', 'rotate', 'move', 'clear', 'chain', 'win', 'lose', 
                          'menu_move', 'menu_select', 'bgm_normal', 'bgm_battle'];
        
        soundKeys.forEach(key => {
            try {
                const sound = this.scene.sound.add(key);
                this.sounds.set(key, sound);
            } catch (e) {
                console.warn(`Failed to load sound: ${key}`);
            }
        });
    }

    public playLand(): void {
        this.playSound('land', this.sfxVolume * 0.8);
    }

    public playRotate(): void {
        this.playSound('rotate', this.sfxVolume * 0.5);
    }

    public playMove(): void {
        this.playSound('move', this.sfxVolume * 0.3);
    }

    public playClear(): void {
        this.playSound('clear', this.sfxVolume);
    }

    public playChain(level: number = 1): void {
        const sound = this.sounds.get('chain');
        if (sound) {
            sound.play({ 
                volume: this.sfxVolume, 
                rate: 1 + (level - 1) * 0.1 
            });
        }
    }

    public playWin(): void {
        this.stopMusic();
        this.playSound('win', this.sfxVolume);
    }

    public playLose(): void {
        this.stopMusic();
        this.playSound('lose', this.sfxVolume);
    }

    public playMenuMove(): void {
        this.playSound('menu_move', this.sfxVolume * 0.5);
    }

    public playMenuSelect(): void {
        this.playSound('menu_select', this.sfxVolume);
    }

    public playNormalBGM(): void {
        this.playMusic('bgm_normal');
    }

    public playBattleBGM(): void {
        this.playMusic('bgm_battle');
    }

    private playSound(key: string, volume: number): void {
        const sound = this.sounds.get(key);
        if (sound && !sound.isPlaying) {
            sound.play({ volume });
        }
    }

    private playMusic(key: string): void {
        this.stopMusic();
        const sound = this.sounds.get(key);
        if (sound) {
            sound.play({ 
                volume: this.musicVolume, 
                loop: true 
            });
            this.currentMusic = sound;
        }
    }

    public stopMusic(): void {
        if (this.currentMusic && this.currentMusic.isPlaying) {
            this.currentMusic.stop();
        }
        this.currentMusic = null;
    }

    public stopAll(): void {
        this.sounds.forEach(sound => {
            if (sound.isPlaying) {
                sound.stop();
            }
        });
        this.currentMusic = null;
    }

    public setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this.musicVolume);
        }
    }

    public setSFXVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
}
