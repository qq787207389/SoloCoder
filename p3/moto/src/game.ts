import { GameState, TrackTheme, AI_COUNT, CANVAS_W, CANVAS_H } from './types';
import { InputManager } from './input';
import { Track } from './track';
import { MotoState, createMoto, updateMoto } from './motorcycle';
import { AIController } from './ai';
import { Renderer } from './renderer';
import { AudioManager } from './audio';

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  input: InputManager;
  renderer: Renderer;
  audio: AudioManager;
  ai: AIController;

  state: GameState = GameState.TITLE;
  selectedTheme: TrackTheme = TrackTheme.GRASSLAND;
  track: Track | null = null;
  player: MotoState | null = null;
  allMotos: MotoState[] = [];
  raceTime = 0;
  countdownTimer = 0;
  lastTime = 0;
  running = false;
  playerFinishOrder = 0;
  finishCount = 0;
  prevPlayerCrashed = false;
  prevPlayerOnGround = true;
  prevPlayerHeight = 0;
  titleInputCooldown = 0;
  finishDelay = 0;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.input = new InputManager();
    this.renderer = new Renderer(this.ctx);
    this.audio = new AudioManager();
    this.ai = new AIController();
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  private loop = (time: number) => {
    if (!this.running) return;

    const rawDt = (time - this.lastTime) / 16.667;
    const dt = Math.min(rawDt, 3);
    this.lastTime = time;

    this.update(dt);
    this.render();

    this.input.postUpdate();
    requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    const inputState = this.input.getState();

    switch (this.state) {
      case GameState.TITLE:
        this.updateTitle(inputState, dt);
        break;
      case GameState.COUNTDOWN:
        this.updateCountdown(dt);
        break;
      case GameState.RACING:
        this.updateRacing(inputState, dt);
        break;
      case GameState.FINISH:
        this.updateFinish(inputState);
        break;
    }

    this.renderer.frameCount++;
  }

  private updateTitle(input: import('./input').InputState, dt: number) {
    if (this.titleInputCooldown > 0) {
      this.titleInputCooldown -= dt;
      return;
    }

    const themes = [TrackTheme.GRASSLAND, TrackTheme.DESERT, TrackTheme.SNOW];
    const idx = themes.indexOf(this.selectedTheme);

    if (input.left || input.up) {
      this.selectedTheme = themes[(idx + themes.length - 1) % themes.length];
      this.titleInputCooldown = 12;
    }
    if (input.right || input.down) {
      this.selectedTheme = themes[(idx + 1) % themes.length];
      this.titleInputCooldown = 12;
    }
    if (input.select) {
      this.startRace();
      this.titleInputCooldown = 30;
    }
  }

  private startRace() {
    const seed = Date.now() % 10000;
    this.track = new Track({ theme: this.selectedTheme, seed });

    const startSeg = this.track.points[3];
    const perpAngle = startSeg.angle + Math.PI / 2;
    this.player = createMoto(
      startSeg.x + Math.cos(perpAngle) * 10,
      startSeg.y + Math.sin(perpAngle) * 10,
      startSeg.angle,
      '你', '#20A0FF', true
    );

    const aiMotos = this.ai.createOpponents(this.track, AI_COUNT);
    this.allMotos = [this.player, ...aiMotos];

    this.raceTime = 0;
    this.countdownTimer = 180;
    this.finishCount = 0;
    this.playerFinishOrder = 0;
    this.prevPlayerCrashed = false;
    this.prevPlayerOnGround = true;
    this.prevPlayerHeight = 0;
    this.finishDelay = 0;

    this.audio.init();
    if (this.audio['ctx'] && this.audio['ctx'].state === 'suspended') {
      this.audio['ctx'].resume();
    }
    this.audio.startEngine();

    this.renderer.camX = this.player.x;
    this.renderer.camY = this.player.y;
    this.renderer.particles = [];

    this.state = GameState.COUNTDOWN;
  }

  private updateCountdown(dt: number) {
    this.countdownTimer -= dt;
    const prevSec = Math.ceil((this.countdownTimer + dt) / 60);
    const curSec = Math.ceil(this.countdownTimer / 60);

    if (this.countdownTimer <= 0) {
      this.state = GameState.RACING;
      this.audio.startMusic();
      this.audio.playStartBeep();
    } else if (prevSec !== curSec && curSec >= 0) {
      this.audio.playStartBeep();
    }
  }

  private updateRacing(input: import('./input').InputState, dt: number) {
    if (!this.player || !this.track) return;

    updateMoto(this.player, input, this.track, dt);
    this.ai.update(this.track, dt);
    this.raceTime += dt;

    if (this.player.speed > 0.3 && this.player.onGround && !this.player.crashed) {
      this.renderer.addDustParticle(
        this.player.x - Math.cos(this.player.angle) * 6,
        this.player.y - Math.sin(this.player.angle) * 6,
        this.player.speed
      );
    }

    if (!this.prevPlayerCrashed && this.player.crashed) {
      this.renderer.addCrashParticles(this.player.x, this.player.y);
      this.audio.playCrash();
    }
    this.prevPlayerCrashed = this.player.crashed;

    if (!this.player.onGround && this.prevPlayerOnGround) {
      this.audio.playJump();
    }
    this.prevPlayerOnGround = this.player.onGround;

    const wasAirborne = this.prevPlayerHeight > 3;
    const justLanded = this.player.onGround && wasAirborne;
    if (justLanded) {
      this.renderer.addLandingParticles(this.player.x, this.player.y);
      this.renderer.shake(this.prevPlayerHeight * 0.3);
      this.audio.playLand();
    }
    this.prevPlayerHeight = this.player.onGround ? 0 : this.player.height;

    this.renderer.updateCamera(this.player, dt);
    this.renderer.updateParticles(dt);
    this.audio.updateEngine(this.player.speed, this.player.crashed);

    for (const m of this.allMotos) {
      if (m.finished && m.finishTime === 0) {
        m.finishTime = this.raceTime;
        this.finishCount++;
        if (m === this.player) {
          this.playerFinishOrder = this.finishCount;
        }
      }
    }

    if (this.player.finished && this.finishDelay === 0) {
      this.finishDelay = 60;
    }

    if (this.finishDelay > 0) {
      this.finishDelay -= dt;
      if (this.finishDelay <= 0) {
        this.state = GameState.FINISH;
        this.audio.stopMusic();
        this.audio.stopEngine();
        this.audio.playFinish();
      }
    }

    const allFinished = this.allMotos.every(m => m.finished);
    if (allFinished && !this.player.finished) {
      this.player.finishTime = this.raceTime;
      this.state = GameState.FINISH;
      this.audio.stopMusic();
      this.audio.stopEngine();
    }
  }

  private updateFinish(input: import('./input').InputState) {
    if (input.select) {
      this.audio.stopMusic();
      this.audio.stopEngine();
      this.state = GameState.TITLE;
    }
  }

  private render() {
    this.renderer.beginFrame();

    switch (this.state) {
      case GameState.TITLE:
        this.renderer.drawTitle(this.selectedTheme);
        break;

      case GameState.COUNTDOWN:
      case GameState.RACING:
        if (this.track) {
          this.renderer.drawScenery(this.track);
          this.renderer.drawTrack(this.track);

          for (const m of this.allMotos) {
            this.renderer.drawTireTracks(m);
          }

          const sorted = [...this.allMotos].sort((a, b) => a.height - b.height);
          for (const m of sorted) {
            this.renderer.drawMoto(m);
          }

          this.renderer.drawParticles();

          if (this.player) {
            const pIdx = this.allMotos.indexOf(this.player);
            this.renderer.drawHUD(this.allMotos, pIdx, this.raceTime, this.state);
          }
        }

        if (this.state === GameState.COUNTDOWN) {
          this.renderer.drawCountdown(this.countdownTimer / 60);
        }
        break;

      case GameState.FINISH:
        if (this.track) {
          this.renderer.drawScenery(this.track);
          this.renderer.drawTrack(this.track);
          for (const m of this.allMotos) {
            this.renderer.drawMoto(m);
          }
        }
        this.renderer.drawFinish(this.allMotos, this.allMotos.indexOf(this.player!), this.raceTime);
        break;
    }

    this.renderer.endFrame();
  }
}
