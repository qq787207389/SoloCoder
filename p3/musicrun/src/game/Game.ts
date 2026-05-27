import * as THREE from 'three';
import { GameRenderer } from '../renderer/GameRenderer';
import { AudioSystem } from '../audio/AudioSystem';
import { Player } from './Player';
import { Obstacle } from './Obstacle';
import { Coin } from './Coin';
import { EffectSystem } from '../effects/EffectSystem';
import { GAME_CONFIG, COLORS } from '../config';
import { GameState, LevelData, PlayerAction, JudgmentResult, BeatData } from '../types';

export class Game {

  private renderer: GameRenderer;
  private audioSystem: AudioSystem;
  private player: Player;
  private effectSystem: EffectSystem;
  
  private obstacles: Obstacle[] = [];
  private coins: Coin[] = [];

  private coinPool: Coin[] = [];
  
  private currentLevel: LevelData | null = null;
  private gameState: GameState;
  
  private worldPosition: number = 0;
  private currentSpeed: number = GAME_CONFIG.PLAYER_SPEED;
  
  private nextObstacleIndex: number = 0;
  private nextCoinIndex: number = 0;
  
  private pendingActions: Array<{ action: PlayerAction; time: number }> = [];
  
  private currentBeatIntensity: number = 0;

  
  private cleanupCallbacks: Array<() => void> = [];
  
  private onStateChangeCallbacks: Array<(state: GameState) => void> = [];
  
  constructor(container: HTMLElement) {
    this.renderer = new GameRenderer(container);
    this.audioSystem = new AudioSystem();
    
    const playerMesh = this.renderer.getPlayer();
    if (!playerMesh) {
      throw new Error('Player mesh not found');
    }
    this.player = new Player(playerMesh);
    
    this.effectSystem = new EffectSystem(this.renderer.getScene());
    
    this.gameState = this.createInitialState();
    
    this.initializeObjectPools();
    this.setupEventListeners();
  }
  
  private createInitialState(): GameState {
    return {
      status: 'menu',
      score: 0,
      combo: 0,
      maxCombo: 0,
      perfectCount: 0,
      totalActions: 0,
      energy: 0,
      maxEnergy: GAME_CONFIG.ENERGY_MAX,
      isSuperSonic: false,
      superSonicTime: 0,
      currentTime: 0,
      distance: 0,
      coinsCollected: 0,
      totalCoins: 0,
    };
  }
  
  private initializeObjectPools(): void {
    const scene = this.renderer.getScene();
    
    for (let i = 0; i < 50; i++) {
      const coin = new Coin(scene);
      coin.reset();
      this.coinPool.push(coin);
    }
  }
  
  private setupEventListeners(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (this.gameState.status !== 'playing') return;
      
      let action: PlayerAction | null = null;
      
      switch (e.code) {
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
          action = 'jump';
          break;
        case 'ArrowDown':
        case 'KeyS':
          action = 'slide';
          break;
        case 'ArrowLeft':
        case 'KeyA':
          action = 'left';
          break;
        case 'ArrowRight':
        case 'KeyD':
          action = 'right';
          break;
        case 'Escape':
          this.pause();
          return;
      }
      
      if (action) {
        e.preventDefault();
        this.handlePlayerAction(action);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    this.cleanupCallbacks.push(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
    
    const unsubBeat = this.audioSystem.onBeat((beat: BeatData) => {
      this.onBeat(beat);
    });
    this.cleanupCallbacks.push(unsubBeat);
    
    const unsubUpdate = this.audioSystem.onUpdate((data) => {
      this.onAudioUpdate(data.spectrum);
    });
    this.cleanupCallbacks.push(unsubUpdate);
    
    const unsubRender = this.renderer.onUpdate((delta, _elapsed) => {
      this.update(delta);
    });
    this.cleanupCallbacks.push(unsubRender);
  }
  
  async loadLevel(level: LevelData): Promise<void> {
    this.currentLevel = level;
    
    await this.audioSystem.loadMusic(level.musicUrl);
    this.audioSystem.setBeatmap(level.beatmap);
    
    this.clearLevel();
    
    this.gameState.totalCoins = level.coins.length;
    this.nextObstacleIndex = 0;
    this.nextCoinIndex = 0;
  }
  
  private clearLevel(): void {
    const scene = this.renderer.getScene();
    
    for (const obstacle of this.obstacles) {
      obstacle.dispose(scene);
    }
    this.obstacles = [];
    
    for (const coin of this.coins) {
      coin.reset();
      this.coinPool.push(coin);
    }
    this.coins = [];
  }
  
  async startGame(): Promise<void> {
    if (!this.currentLevel) {
      throw new Error('No level loaded');
    }
    
    this.gameState = this.createInitialState();
    this.gameState.totalCoins = this.currentLevel.coins.length;
    this.gameState.status = 'playing';
    
    this.worldPosition = 0;
    this.currentSpeed = GAME_CONFIG.PLAYER_SPEED;
    this.nextObstacleIndex = 0;
    this.nextCoinIndex = 0;
    
    this.player.reset();
    this.clearLevel();
    
    this.audioSystem.seek(0);
    this.audioSystem.play();
    this.renderer.start();
    
    this.notifyStateChange();
  }
  
  pause(): void {
    if (this.gameState.status !== 'playing') return;
    
    this.gameState.status = 'paused';
    this.audioSystem.pause();
    this.notifyStateChange();
  }
  
  resume(): void {
    if (this.gameState.status !== 'paused') return;
    
    this.gameState.status = 'playing';
    this.audioSystem.play();
    this.notifyStateChange();
  }
  
  private endGame(victory: boolean): void {
    this.gameState.status = victory ? 'victory' : 'gameover';
    this.audioSystem.stop();
    this.notifyStateChange();
  }
  
  private handlePlayerAction(action: PlayerAction): void {
    const actionTime = this.audioSystem.getCurrentTime();
    const performed = this.player.performAction(action);
    
    if (!performed) return;
    
    this.pendingActions.push({ action, time: actionTime });
    
    const nearestObstacle = this.findNearestObstacleForAction(action);
    
    if (nearestObstacle) {
      const beatOffset = actionTime - nearestObstacle.getData().beatTime;
      const judgment = this.player.judgeAction(action, beatOffset);
      
      this.handleJudgment(judgment, action);
      this.effectSystem.spawnJudgmentText(judgment.type, this.player.getPosition());
      
      if (judgment.type !== 'miss') {
        this.effectSystem.spawnParticles(
          this.player.getPosition(),
          judgment.type === 'perfect' ? 30 : 15,
          judgment.type === 'perfect' ? COLORS.SUCCESS : COLORS.ACCENT,
          3,
          0.8
        );
      }
    }
  }
  
  private findNearestObstacleForAction(action: PlayerAction): Obstacle | null {
    const actionTime = this.audioSystem.getCurrentTime();
    let nearest: Obstacle | null = null;
    let nearestDistance = Infinity;
    
    for (const obstacle of this.obstacles) {
      if (!obstacle.getIsActive()) continue;
      
      const obstacleTime = obstacle.getData().beatTime;
      const distance = Math.abs(actionTime - obstacleTime);
      
      if (distance > GAME_CONFIG.GOOD_WINDOW * 2) continue;
      
      const typeMatch = 
        (action === 'jump' && obstacle.getType() === 'jump') ||
        (action === 'slide' && obstacle.getType() === 'slide') ||
        ((action === 'left' || action === 'right') && obstacle.getType() === 'lane');
      
      if (!typeMatch) continue;
      
      const laneMatch = 
        obstacle.getType() === 'lane' ||
        obstacle.getLane() === this.player.getCurrentLane();
      
      if (!laneMatch) continue;
      
      if (distance < nearestDistance) {
        nearest = obstacle;
        nearestDistance = distance;
      }
    }
    
    return nearest;
  }
  
  private handleJudgment(judgment: JudgmentResult, _action: PlayerAction): void {
    this.gameState.totalActions++;
    
    if (judgment.type === 'perfect') {
      this.gameState.perfectCount++;
      this.gameState.combo++;
      this.gameState.score += GAME_CONFIG.PERFECT_SCORE * (1 + this.gameState.combo * GAME_CONFIG.COMBO_MULTIPLIER);
      this.gameState.energy = Math.min(this.gameState.maxEnergy, this.gameState.energy + GAME_CONFIG.ENERGY_PER_PERFECT);
      
      if (this.gameState.energy >= this.gameState.maxEnergy && !this.gameState.isSuperSonic) {
        this.activateSuperSonic();
      }
    } else if (judgment.type === 'good') {
      this.gameState.combo++;
      this.gameState.score += GAME_CONFIG.GOOD_SCORE * (1 + this.gameState.combo * GAME_CONFIG.COMBO_MULTIPLIER);
      this.gameState.energy = Math.min(this.gameState.maxEnergy, this.gameState.energy + GAME_CONFIG.ENERGY_PER_PERFECT * 0.5);
    } else {
      this.gameState.combo = 0;
    }
    
    this.gameState.maxCombo = Math.max(this.gameState.maxCombo, this.gameState.combo);
    this.notifyStateChange();
  }
  
  private activateSuperSonic(): void {
    this.gameState.isSuperSonic = true;
    this.gameState.superSonicTime = GAME_CONFIG.SUPER_SONIC_DURATION;
    this.gameState.energy = 0;
    this.currentSpeed = GAME_CONFIG.SUPER_SONIC_SPEED;
    this.player.setSuperSonic(true);
    
    this.effectSystem.spawnParticles(
      this.player.getPosition(),
      100,
      COLORS.ACCENT,
      5,
      2
    );
    
    this.notifyStateChange();
  }
  
  private onBeat(beat: BeatData): void {
    this.currentBeatIntensity = beat.intensity;
    // this.lastBeatTime = this.audioSystem.getCurrentTime();
    
    for (const obstacle of this.obstacles) {
      if (Math.abs(obstacle.getData().beatTime - beat.time) < 0.1) {
        obstacle.pulse();
      }
    }
  }
  
  private onAudioUpdate(spectrum: Uint8Array): void {
    const backgroundParticles = this.renderer.getBackgroundParticles();
    const pointLight = this.renderer.getPointLight();
    const trackEdges = this.renderer.getTrackEdges();
    
    if (backgroundParticles) {
      this.effectSystem.updateBackgroundParticles(backgroundParticles, spectrum, 0.016);
    }
    
    if (pointLight && trackEdges) {
      this.effectSystem.updateLighting(pointLight, trackEdges, spectrum);
    }
  }
  
  private update(delta: number): void {
    if (this.gameState.status !== 'playing') return;
    
    const currentTime = this.audioSystem.getCurrentTime();
    this.gameState.currentTime = currentTime;
    
    if (this.gameState.isSuperSonic) {
      this.gameState.superSonicTime -= delta;
      if (this.gameState.superSonicTime <= 0) {
        this.deactivateSuperSonic();
      }
    }
    
    this.currentBeatIntensity *= 0.95;
    
    this.worldPosition += this.currentSpeed * delta;
    this.gameState.distance = this.worldPosition;
    
    this.player.update(delta);
    
    this.spawnObjects();
    
    for (const obstacle of this.obstacles) {
      obstacle.update(delta, this.worldPosition, this.currentBeatIntensity);
    }
    
    for (const coin of this.coins) {
      coin.update(delta, this.worldPosition);
    }
    
    this.checkCollisions();
    
    this.effectSystem.update(delta, this.gameState.isSuperSonic, this.currentSpeed);
    
    this.cleanupObjects();
    
    if (this.currentLevel && currentTime >= this.currentLevel.duration - 0.5) {
      this.endGame(true);
    }
    
    this.notifyStateChange();
  }
  
  private deactivateSuperSonic(): void {
    this.gameState.isSuperSonic = false;
    this.gameState.superSonicTime = 0;
    this.currentSpeed = GAME_CONFIG.PLAYER_SPEED;
    this.player.setSuperSonic(false);
    this.notifyStateChange();
  }
  
  private spawnObjects(): void {
    if (!this.currentLevel) return;
    
    const currentTime = this.audioSystem.getCurrentTime();
    const spawnAheadTime = GAME_CONFIG.SPAWN_DISTANCE / this.currentSpeed;
    
    while (
      this.nextObstacleIndex < this.currentLevel.obstacles.length &&
      this.currentLevel.obstacles[this.nextObstacleIndex].beatTime < currentTime + spawnAheadTime
    ) {
      const obstacleData = this.currentLevel.obstacles[this.nextObstacleIndex];
      this.spawnObstacle(obstacleData);
      this.nextObstacleIndex++;
    }
    
    while (
      this.nextCoinIndex < this.currentLevel.coins.length &&
      this.currentLevel.coins[this.nextCoinIndex].beatTime < currentTime + spawnAheadTime
    ) {
      const coinData = this.currentLevel.coins[this.nextCoinIndex];
      this.spawnCoin(coinData);
      this.nextCoinIndex++;
    }
  }
  
  private spawnObstacle(data: any): void {
    const obstacle = new Obstacle(data, this.renderer.getScene());
    const z = data.beatTime * this.currentSpeed;
    obstacle.setWorldPosition(z);
    this.obstacles.push(obstacle);
  }
  
  private spawnCoin(data: any): void {
    const coin = this.coinPool.pop();
    if (!coin) return;
    
    const z = data.beatTime * this.currentSpeed;
    coin.setPosition(data.lane, z);
    this.coins.push(coin);
  }
  
  private checkCollisions(): void {
    const playerBox = this.player.getBoundingBox();
    
    for (const obstacle of this.obstacles) {
      if (!obstacle.getIsActive()) continue;
      
      const distance = obstacle.getWorldPosition() - this.worldPosition;
      if (distance > 5 || distance < -2) continue;
      
      const obstacleBox = obstacle.getBoundingBox();
      
      if (playerBox.intersectsBox(obstacleBox)) {
        if (this.gameState.isSuperSonic) {
          continue;
        }
        
        const type = obstacle.getType();
        const playerAvoiding = 
          (type === 'jump' && this.player.getIsJumping()) ||
          (type === 'slide' && this.player.getIsSliding()) ||
          (type === 'lane' && obstacle.getLane() !== this.player.getCurrentLane());
        
        if (!playerAvoiding) {
          this.endGame(false);
          return;
        }
      }
    }
    
    for (const coin of this.coins) {
      if (!coin.getIsActive()) continue;
      
      const distance = coin.getWorldPosition() - this.worldPosition;
      if (distance > 5 || distance < -2) continue;
      
      const coinBox = coin.getBoundingBox();
      
      if (playerBox.intersectsBox(coinBox)) {
        coin.collect();
        this.gameState.coinsCollected++;
        this.gameState.score += GAME_CONFIG.COIN_VALUE;
        
        this.effectSystem.spawnParticles(
          coin.getBoundingBox().getCenter(new THREE.Vector3()),
          10,
          COLORS.ACCENT,
          2,
          0.5
        );
      }
    }
  }
  
  private cleanupObjects(): void {
    const scene = this.renderer.getScene();
    
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      if (!this.obstacles[i].getIsActive()) {
        this.obstacles[i].dispose(scene);
        this.obstacles.splice(i, 1);
      }
    }
    
    for (let i = this.coins.length - 1; i >= 0; i--) {
      if (!this.coins[i].getIsActive()) {
        this.coinPool.push(this.coins[i]);
        this.coins.splice(i, 1);
      }
    }
  }
  
  onStateChange(callback: (state: GameState) => void): () => void {
    this.onStateChangeCallbacks.push(callback);
    return () => {
      const index = this.onStateChangeCallbacks.indexOf(callback);
      if (index > -1) this.onStateChangeCallbacks.splice(index, 1);
    };
  }
  
  private notifyStateChange(): void {
    for (const callback of this.onStateChangeCallbacks) {
      callback(this.gameState);
    }
  }
  
  getState(): GameState {
    return { ...this.gameState };
  }
  
  getAudioSystem(): AudioSystem {
    return this.audioSystem;
  }
  
  dispose(): void {
    for (const cleanup of this.cleanupCallbacks) {
      cleanup();
    }
    
    this.clearLevel();
    
    const scene = this.renderer.getScene();
    for (const coin of this.coinPool) {
      coin.dispose(scene);
    }
    
    this.effectSystem.dispose();
    this.audioSystem.dispose();
    this.renderer.dispose();
  }
}
