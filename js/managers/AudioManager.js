// AudioManager: Web Audio API 合成音效與背景音樂（由 GameScene 抽離，行為不變）
export class AudioManager {
    constructor() {
        this.masterVolume = 0.5;
        this.sfxVolume = 0.7;
        this.bgmVolume = 0.3;
        this.bgmOscillator = null;
        this.bgmGainNode = null;
        this.audioContext = null;
    }

    init(scene) {
        // 初始化 AudioContext
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 如果 AudioContext 被暫停（某些瀏覽器），等待恢復
        if (this.audioContext.state === 'suspended') {
            scene.input.once('pointerdown', () => {
                this.audioContext.resume();
                this.startBGM();
            });
        } else {
            this.startBGM();
        }
    }

    playSound(type) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const volume = this.masterVolume * this.sfxVolume;

        switch (type) {
            case 'swing':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialDecayTo?.(0.01, 0.15) ||
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + 0.15);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.15);
                break;

            case 'hit':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(volume * 0.2, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;

            case 'kill':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;

            case 'chainKill':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1500, this.audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.5);
                break;

            case 'levelUp':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1800, this.audioContext.currentTime + 0.8);
                gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.8);
                break;

            case 'damage':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;

            case 'pickup':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(volume * 0.15, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;

            case 'gameOver':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 1.0);
                break;
        }
    }

    startBGM() {
        if (!this.audioContext || this.bgmOscillator) return;

        this.bgmOscillator = this.audioContext.createOscillator();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        const gainNode = this.audioContext.createGain();

        this.bgmOscillator.type = 'triangle';
        this.bgmOscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(this.bgmOscillator.frequency);

        const volume = this.masterVolume * this.bgmVolume * 0.1;
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

        this.bgmOscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        this.bgmGainNode = gainNode;

        lfo.start();
        this.bgmOscillator.start();
    }

    stopBGM() {
        if (this.bgmOscillator) {
            this.bgmOscillator.stop();
            this.bgmOscillator = null;
        }
    }

    adjustVolume(key, delta) {
        const clamp = (v) => Math.min(1, Math.max(0, Math.round((v + delta) * 10) / 10));
        if (key === 'master') this.masterVolume = clamp(this.masterVolume ?? 0.5);
        else if (key === 'sfx') this.sfxVolume = clamp(this.sfxVolume ?? 0.7);
        else if (key === 'bgm') this.bgmVolume = clamp(this.bgmVolume ?? 0.3);
        if (key === 'master' || key === 'bgm') this.applyBgmVolume();
        return key === 'master' ? this.masterVolume : key === 'sfx' ? this.sfxVolume : this.bgmVolume;
    }

    applyBgmVolume() {
        if (this.bgmGainNode && this.audioContext) {
            this.bgmGainNode.gain.setValueAtTime(
                (this.masterVolume ?? 0.5) * (this.bgmVolume ?? 0.3) * 0.1,
                this.audioContext.currentTime
            );
        }
    }
}
