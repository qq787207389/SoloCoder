import * as THREE from 'three';
import { GameConfig } from './config/GameConfig';
import { ThemeConfig } from './config/ThemeConfig';
import type { ThemeType } from './config/ThemeConfig';
import { TrackSegment } from './systems/TrackSegment';
import { Player, PlayerState } from './entities/Player';
import { Obstacle } from './entities/Obstacle';
import type { ObstacleType } from './entities/Obstacle';
import { Coin } from './entities/Coin';
import { Powerup } from './entities/Powerup';
import type { PowerupType } from './entities/Powerup';
import { InputSystem, InputAction } from './systems/InputSystem';
import { ObstacleGenerator } from './systems/ObstacleGenerator';
import { ParticleSystem } from './systems/ParticleSystem';
import { ObjectPool } from './utils/ObjectPool';
import { lerp, randomChoice } from './utils/MathUtils';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

export class Game {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public state: GameState = 'menu';

  private player: Player;
  private inputSystem: InputSystem;
  private obstacleGenerator: ObstacleGenerator;
  private particleSystem: ParticleSystem;

  private trackSegments: TrackSegment[] = [];
  private trackPool!: ObjectPool<TrackSegment>;

  private obstacles: Obstacle[] = [];
  private obstaclePools: Map<ObstacleType, ObjectPool<Obstacle>> = new Map();

  private coins: Coin[] = [];
  private coinPool!: ObjectPool<Coin>;

  private powerups: Powerup[] = [];
  private powerupPools: Map<PowerupType, ObjectPool<Powerup>> = new Map();

  private currentSpeed: number = GameConfig.INITIAL_SPEED;
  private distance: number = 0;
  private score: number = 0;
  private coinCount: number = 0;
  private highScore: number = 0;
  private resurrectionCount: number = 0;

  private currentTheme: ThemeType = 'forest';
  private themeChangeDistance: number = 0;

  private lastTime: number = 0;
  private animationId: number | null = null;

  private roadCurve: number = 0;
  private targetRoadCurve: number = 0;
  private cameraTilt: number = 0;
  private roadOffset: number = 0;
  private currentTurnDirection: number = 0;
  private turnTimer: number = 0;
  private turnTransitionProgress: number = 0;
  private roadOffsetHistory: number[] = [];
  private readonly MAX_HISTORY_LENGTH: number = 200;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.player = new Player();
    this.inputSystem = new InputSystem();
    this.obstacleGenerator = new ObstacleGenerator();
    this.particleSystem = new ParticleSystem(150);

    this.setupLighting();
    this.setupPools();
    this.setupInput();
    this.loadHighScore();
    this.updateTheme('forest');

    window.addEventListener('resize', () => this.onResize(container));
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    this.scene.add(directionalLight);

    const fog = new THREE.Fog(0x87ceeb, 30, 100);
    this.scene.fog = fog;
  }

  private setupPools(): void {
    this.trackPool = new ObjectPool<TrackSegment>(
      () => new TrackSegment(this.currentTheme),
      (segment) => segment.deactivate(),
      GameConfig.POOL_SIZE.TRACK_SEGMENTS
    );

    const obstacleTypes: ObstacleType[] = ['treeStump', 'fence', 'rock', 'beam', 'branch', 'spikes', 'fire'];
    obstacleTypes.forEach((type) => {
      this.obstaclePools.set(
        type,
        new ObjectPool<Obstacle>(
          () => new Obstacle(type),
          (obstacle) => obstacle.deactivate(),
          10
        )
      );
    });

    this.coinPool = new ObjectPool<Coin>(
      () => new Coin(),
      (coin) => coin.deactivate(),
      GameConfig.POOL_SIZE.COINS
    );

    const powerupTypes: PowerupType[] = ['magnet', 'shield', 'doubleScore'];
    powerupTypes.forEach((type) => {
      this.powerupPools.set(
        type,
        new ObjectPool<Powerup>(
          () => new Powerup(type),
          (powerup) => powerup.deactivate(),
          5
        )
      );
    });
  }

  private setupInput(): void {
    this.inputSystem.addListener((action) => {
      if (this.state !== 'playing') return;

      switch (action) {
        case InputAction.LEFT:
          this.player.moveLeft();
          break;
        case InputAction.RIGHT:
          this.player.moveRight();
          break;
        case InputAction.JUMP:
          this.player.jump();
          break;
        case InputAction.SLIDE:
          this.player.slide();
          break;
      }
    });
  }

  private loadHighScore(): void {
    const saved = localStorage.getItem('templeRunHighScore');
    if (saved) {
      this.highScore = parseInt(saved, 10);
    }
  }

  private saveHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('templeRunHighScore', this.highScore.toString());
    }
  }

  public start(): void {
    this.resetGame();
    this.state = 'playing';
    this.lastTime = performance.now();
    this.animate();
  }

  private resetGame(): void {
    this.player.reset();
    this.obstacleGenerator.reset();
    this.particleSystem.clear();

    this.trackSegments.forEach((s) => this.trackPool.release(s));
    this.trackSegments = [];

    this.obstacles.forEach((o) => {
      const pool = this.obstaclePools.get(o.type);
      if (pool) pool.release(o);
    });
    this.obstacles = [];

    this.coins.forEach((c) => this.coinPool.release(c));
    this.coins = [];

    this.powerups.forEach((p) => {
      const pool = this.powerupPools.get(p.type);
      if (pool) pool.release(p);
    });
    this.powerups = [];

    this.currentSpeed = GameConfig.INITIAL_SPEED;
    this.distance = 0;
    this.score = 0;
    this.coinCount = 0;
    this.resurrectionCount = 0;
    this.roadCurve = 0;
    this.targetRoadCurve = 0;
    this.cameraTilt = 0;
    this.roadOffset = 0;
    this.currentTurnDirection = 0;
    this.turnTimer = 0;
    this.turnTransitionProgress = 0;
    this.roadOffsetHistory = [];
    this.themeChangeDistance = 0;

    this.scene.clear();
    this.setupLighting();
    this.scene.add(this.player.mesh);
    this.scene.add(this.particleSystem.getMesh());
    this.updateTheme('forest');

    let z = 0;
    for (let i = 0; i < GameConfig.VISIBLE_SEGMENTS; i++) {
      this.spawnTrackSegment(z);
      z -= GameConfig.TRACK_SEGMENT_LENGTH;
    }
  }

  private spawnTrackSegment(startZ: number): void {
    const segment = this.trackPool.acquire();
    segment.activate(startZ, this.currentTheme);
    this.trackSegments.push(segment);
    this.scene.add(segment.mesh);
  }

  private updateTheme(theme: ThemeType): void {
    this.currentTheme = theme;
    const colors = ThemeConfig[theme];
    
    if (this.scene.fog) {
      (this.scene.fog as THREE.Fog).color.setHex(colors.fog);
    }
    this.scene.background = new THREE.Color(colors.sky);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (this.state === 'playing') {
      this.update(deltaTime);
    }

    this.render();
  }

  private update(deltaTime: number): void {
    this.updateSpeed(deltaTime);
    this.updateRoadTurn(deltaTime);
    this.updateTrack(deltaTime);
    this.updateObstacles(deltaTime);
    this.updateCoins(deltaTime);
    this.updatePowerups(deltaTime);
    this.updatePlayer(deltaTime);
    this.updateCamera(deltaTime);
    this.updateParticles(deltaTime);
    this.checkCollisions();
    this.checkThemeChange();
  }

  private updateSpeed(deltaTime: number): void {
    this.distance += this.currentSpeed * deltaTime;
    const scoreMultiplier = this.player.hasDoubleScore ? 2 : 1;
    this.score += this.currentSpeed * deltaTime * GameConfig.SCORE_PER_METER * scoreMultiplier;
    
    if (this.distance - this.themeChangeDistance > GameConfig.SPEED_INCREMENT_INTERVAL) {
      this.themeChangeDistance = this.distance;
      this.currentSpeed = Math.min(
        this.currentSpeed + GameConfig.SPEED_INCREMENT,
        GameConfig.MAX_SPEED
      );
    }

    this.obstacleGenerator.updateDifficulty(this.currentSpeed, this.distance);
  }

  private updateTrack(deltaTime: number): void {
    for (let i = this.trackSegments.length - 1; i >= 0; i--) {
      const segment = this.trackSegments[i];
      segment.update(deltaTime, this.currentSpeed);

      const curveOffset = this.getRoadOffsetAtDistance(-segment.startZ);
      segment.mesh.position.x = curveOffset;
      segment.mesh.rotation.y = -this.roadCurve * 0.3 * (1 - Math.min(1, -segment.startZ / 100));

      if (segment.startZ > 50) {
        this.trackSegments.splice(i, 1);
        this.scene.remove(segment.mesh);
        this.trackPool.release(segment);
      }
    }

    const lastSegment = this.trackSegments[this.trackSegments.length - 1];
    if (lastSegment && lastSegment.startZ > -GameConfig.TRACK_SEGMENT_LENGTH * 3) {
      this.spawnTrackSegment(lastSegment.startZ - GameConfig.TRACK_SEGMENT_LENGTH);
    }
  }

  private updateObstacles(deltaTime: number): void {
    const furthestZ = Math.min(...this.trackSegments.map((s) => s.startZ));
    
    const newObstacles = this.obstacleGenerator.generate(furthestZ, this.currentSpeed);
    newObstacles.forEach(({ lane, type, z }) => {
      const pool = this.obstaclePools.get(type);
      if (pool) {
        const obstacle = pool.acquire();
        obstacle.activate(lane, z);
        obstacle.baseX = (lane - 1) * GameConfig.LANE_WIDTH;
        obstacle.mesh.position.x = obstacle.baseX;
        this.obstacles.push(obstacle);
        this.scene.add(obstacle.mesh);
      }
    });

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update(deltaTime, this.currentSpeed);

      const curveOffset = this.getRoadOffsetAtDistance(-obstacle.mesh.position.z);
      obstacle.mesh.position.x = obstacle.baseX + curveOffset;
      obstacle.mesh.rotation.y = -this.roadCurve * 0.2;

      if (obstacle.mesh.position.z > 30) {
        this.obstacles.splice(i, 1);
        this.scene.remove(obstacle.mesh);
        const pool = this.obstaclePools.get(obstacle.type);
        if (pool) pool.release(obstacle);
      }
    }
  }

  private updateCoins(deltaTime: number): void {
    const furthestZ = Math.min(...this.trackSegments.map((s) => s.startZ));
    
    const newCoins = this.obstacleGenerator.generateCoins(furthestZ);
    newCoins.forEach(({ lane, z, y }) => {
      const coin = this.coinPool.acquire();
      coin.activate(lane, z, y);
      coin.baseX = (lane - 1) * GameConfig.LANE_WIDTH;
      coin.mesh.position.x = coin.baseX;
      this.coins.push(coin);
      this.scene.add(coin.mesh);
    });

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.update(deltaTime, this.currentSpeed);

      const curveOffset = this.getRoadOffsetAtDistance(-coin.mesh.position.z);
      if (!coin.collected) {
        coin.mesh.position.x = coin.baseX + curveOffset;
      }

      if (this.player.hasMagnet && coin.active && !coin.collected) {
        const playerPos = this.player.mesh.position;
        const coinPos = coin.getPosition();
        const distance = playerPos.distanceTo(coinPos);
        
        if (distance < GameConfig.POWERUPS.MAGNET_RANGE) {
          const direction = playerPos.clone().sub(coinPos).normalize();
          coin.mesh.position.add(direction.multiplyScalar(deltaTime * 15));
        }
      }

      if (coin.mesh.position.z > 30) {
        this.coins.splice(i, 1);
        this.scene.remove(coin.mesh);
        this.coinPool.release(coin);
      }
    }
  }

  private updatePowerups(deltaTime: number): void {
    const furthestZ = Math.min(...this.trackSegments.map((s) => s.startZ));
    
    const newPowerup = this.obstacleGenerator.generatePowerup(furthestZ);
    if (newPowerup) {
      const pool = this.powerupPools.get(newPowerup.type);
      if (pool) {
        const powerup = pool.acquire();
        powerup.activate(newPowerup.lane, newPowerup.z);
        powerup.baseX = (newPowerup.lane - 1) * GameConfig.LANE_WIDTH;
        powerup.mesh.position.x = powerup.baseX;
        this.powerups.push(powerup);
        this.scene.add(powerup.mesh);
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      powerup.update(deltaTime, this.currentSpeed);

      const curveOffset = this.getRoadOffsetAtDistance(-powerup.mesh.position.z);
      if (!powerup.collected) {
        powerup.mesh.position.x = powerup.baseX + curveOffset;
      }

      if (powerup.mesh.position.z > 30) {
        this.powerups.splice(i, 1);
        this.scene.remove(powerup.mesh);
        const pool = this.powerupPools.get(powerup.type);
        if (pool) pool.release(powerup);
      }
    }
  }

  private updatePlayer(deltaTime: number): void {
    this.player.update(deltaTime, this.currentSpeed);

    if (this.player.state === PlayerState.RUNNING) {
      const emitPosition = this.player.mesh.position.clone();
      emitPosition.z += 0.5;
      if (Math.random() > 0.5) {
        this.particleSystem.emit(emitPosition, 1);
      }
    }
  }

  private updateCamera(deltaTime: number): void {
    const cameraOffsetX = this.roadOffset * 0.8;
    const targetX = this.player.mesh.position.x * 0.3 + cameraOffsetX;
    const targetY = 4 + this.player.mesh.position.y * 0.2;
    const targetZ = 6;

    this.camera.position.x = lerp(this.camera.position.x, targetX, 5 * deltaTime);
    this.camera.position.y = lerp(this.camera.position.y, targetY, 5 * deltaTime);
    this.camera.position.z = lerp(this.camera.position.z, targetZ, 5 * deltaTime);

    this.cameraTilt = lerp(this.cameraTilt, -this.roadCurve * 0.15, 2 * deltaTime);
    this.camera.rotation.z = this.cameraTilt;

    const lookAheadDistance = 10;
    const futureRoadOffset = this.getRoadOffsetAtDistance(lookAheadDistance);
    
    this.camera.lookAt(
      this.player.mesh.position.x + this.roadCurve * 3 + futureRoadOffset * 0.3,
      this.player.mesh.position.y + 1,
      this.player.mesh.position.z - 8
    );
  }

  private updateParticles(deltaTime: number): void {
    this.particleSystem.update(deltaTime);
  }

  private checkCollisions(): void {
    const playerBox = this.player.getCollisionBox();

    for (const obstacle of this.obstacles) {
      if (!obstacle.active) continue;

      const obstacleBox = obstacle.getCollisionBox();
      
      if (this.intersectBoxes(playerBox, obstacleBox)) {
        if (this.player.hasShield) {
          this.player.hasShield = false;
          this.player.shieldTimer = 0;
          continue;
        }

        this.gameOver();
        return;
      }
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      if (!coin.active) continue;

      const coinPos = coin.getPosition();
      const playerPos = this.player.mesh.position;
      const distance = playerPos.distanceTo(coinPos);

      if (distance < 1) {
        coin.collect();
        this.coinCount++;
        const scoreMultiplier = this.player.hasDoubleScore ? 2 : 1;
        this.score += GameConfig.COIN_VALUE * scoreMultiplier;
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      if (!powerup.active) continue;

      const powerupPos = powerup.getPosition();
      const playerPos = this.player.mesh.position;
      const distance = playerPos.distanceTo(powerupPos);

      if (distance < 1.2) {
        powerup.collect();
        
        switch (powerup.type) {
          case 'magnet':
            this.player.activateMagnet();
            break;
          case 'shield':
            this.player.activateShield();
            break;
          case 'doubleScore':
            this.player.activateDoubleScore();
            break;
        }
      }
    }
  }

  private intersectBoxes(
    a: { min: THREE.Vector3; max: THREE.Vector3 },
    b: { min: THREE.Vector3; max: THREE.Vector3 }
  ): boolean {
    return (
      a.min.x < b.max.x &&
      a.max.x > b.min.x &&
      a.min.y < b.max.y &&
      a.max.y > b.min.y &&
      a.min.z < b.max.z &&
      a.max.z > b.min.z
    );
  }

  private checkThemeChange(): void {
    if (this.distance - this.themeChangeDistance > GameConfig.THEME_CHANGE_INTERVAL) {
      this.themeChangeDistance = this.distance;
      const themes: ThemeType[] = ['forest', 'city', 'cave'];
      const otherThemes = themes.filter((t) => t !== this.currentTheme);
      this.updateTheme(randomChoice(otherThemes));
    }
  }

  private updateRoadTurn(deltaTime: number): void {
    this.turnTimer -= deltaTime * this.currentSpeed;

    if (this.turnTimer <= 0) {
      if (this.currentTurnDirection === 0) {
        if (Math.random() < GameConfig.TURN_PROBABILITY) {
          this.currentTurnDirection = Math.random() > 0.5 ? 1 : -1;
          this.turnTimer = GameConfig.TURN_DURATION * (0.5 + Math.random() * 0.5);
          this.turnTransitionProgress = 0;
        }
      } else {
        if (this.turnTransitionProgress >= 1) {
          this.currentTurnDirection = -this.currentTurnDirection;
          this.turnTimer = GameConfig.TURN_DURATION * (0.3 + Math.random() * 0.4);
          this.turnTransitionProgress = 0;
        }
      }
    }

    if (this.currentTurnDirection !== 0) {
      const turnSpeed = (this.currentSpeed / GameConfig.INITIAL_SPEED) * GameConfig.TURN_SMOOTHING;
      this.turnTransitionProgress = Math.min(1, this.turnTransitionProgress + deltaTime * turnSpeed * 0.5);
      
      const turnEase = this.easeInOutCubic(this.turnTransitionProgress);
      this.targetRoadCurve = this.currentTurnDirection * GameConfig.MAX_TURN_ANGLE * turnEase;
    } else {
      this.targetRoadCurve = 0;
      this.turnTransitionProgress = 0;
    }

    this.roadCurve = lerp(this.roadCurve, this.targetRoadCurve, deltaTime * 2);

    const offsetChange = this.roadCurve * this.currentSpeed * deltaTime * 0.5;
    this.roadOffset += offsetChange;

    this.roadOffsetHistory.unshift(this.roadOffset);
    if (this.roadOffsetHistory.length > this.MAX_HISTORY_LENGTH) {
      this.roadOffsetHistory.pop();
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  public getRoadOffsetAtDistance(distance: number): number {
    const index = Math.floor(Math.abs(distance) / (GameConfig.TRACK_SEGMENT_LENGTH / 10));
    if (index < this.roadOffsetHistory.length) {
      return this.roadOffsetHistory[index];
    }
    return this.roadOffset;
  }

  private gameOver(): void {
    this.state = 'gameOver';
    this.player.die();
    this.saveHighScore();
  }

  public resurrect(): boolean {
    const cost = Math.floor(
      GameConfig.RESURRECTION_COST * Math.pow(GameConfig.RESURRECTION_COST_MULTIPLIER, this.resurrectionCount)
    );

    if (this.coinCount >= cost) {
      this.coinCount -= cost;
      this.resurrectionCount++;
      this.player.state = PlayerState.RUNNING;
      this.state = 'playing';

      for (const obstacle of this.obstacles) {
        if (obstacle.mesh.position.z > -5 && obstacle.mesh.position.z < 10) {
          obstacle.deactivate();
        }
      }

      return true;
    }

    return false;
  }

  public getResurrectionCost(): number {
    return Math.floor(
      GameConfig.RESURRECTION_COST * Math.pow(GameConfig.RESURRECTION_COST_MULTIPLIER, this.resurrectionCount)
    );
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private onResize(container: HTMLElement): void {
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  public getScore(): number {
    return Math.floor(this.score);
  }

  public getDistance(): number {
    return Math.floor(this.distance);
  }

  public getCoins(): number {
    return this.coinCount;
  }

  public getHighScore(): number {
    return this.highScore;
  }

  public getSpeed(): number {
    return this.currentSpeed;
  }

  public getPowerupTimers(): { magnet: number; shield: number; doubleScore: number } {
    return {
      magnet: Math.max(0, this.player.magnetTimer),
      shield: Math.max(0, this.player.shieldTimer),
      doubleScore: Math.max(0, this.player.doubleScoreTimer),
    };
  }

  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
  }
}
