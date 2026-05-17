import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig';
import { clamp, lerp } from '../utils/MathUtils';

export enum PlayerState {
  RUNNING = 'RUNNING',
  JUMPING = 'JUMPING',
  SLIDING = 'SLIDING',
  DEAD = 'DEAD',
}

export class Player {
  public mesh: THREE.Group;
  public state: PlayerState = PlayerState.RUNNING;
  public currentLane: number = 1;
  public targetLane: number = 1;
  public verticalVelocity: number = 0;
  public slideTimer: number = 0;
  public hasShield: boolean = false;
  public hasMagnet: boolean = false;
  public hasDoubleScore: boolean = false;
  public shieldTimer: number = 0;
  public magnetTimer: number = 0;
  public doubleScoreTimer: number = 0;

  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private runAnimationTime: number = 0;
  private visualHeight: number = GameConfig.PLAYER_HEIGHT;

  constructor() {
    this.mesh = new THREE.Group();
    this.createCharacter();
    this.mesh.position.set(0, 0, 0);
  }

  private createCharacter(): void {
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff6b35,
      roughness: 0.7,
      metalness: 0.3,
    });
    this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.bodyMesh.position.y = 0.7;
    this.bodyMesh.castShadow = true;

    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffcc99,
      roughness: 0.5,
    });
    this.headMesh = new THREE.Mesh(headGeometry, headMaterial);
    this.headMesh.position.y = 1.5;
    this.headMesh.castShadow = true;

    const hatGeometry = new THREE.ConeGeometry(0.3, 0.4, 8);
    const hatMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.y = 1.85;
    hat.castShadow = true;

    this.mesh.add(this.bodyMesh);
    this.mesh.add(this.headMesh);
    this.mesh.add(hat);
  }

  public update(deltaTime: number, speed: number): void {
    this.updateLanePosition(deltaTime);
    this.updateVerticalMovement(deltaTime);
    this.updateSlide(deltaTime);
    this.updatePowerups(deltaTime);
    this.updateAnimation(deltaTime, speed);
  }

  private updateLanePosition(deltaTime: number): void {
    const targetX = (this.targetLane - 1) * GameConfig.LANE_WIDTH;
    this.mesh.position.x = lerp(
      this.mesh.position.x,
      targetX,
      GameConfig.LANE_SWITCH_SPEED * deltaTime
    );

    const tiltAngle = (targetX - this.mesh.position.x) * 0.1;
    this.mesh.rotation.z = lerp(this.mesh.rotation.z, tiltAngle, 10 * deltaTime);
  }

  private updateVerticalMovement(deltaTime: number): void {
    if (this.state === PlayerState.JUMPING) {
      this.verticalVelocity -= GameConfig.GRAVITY * deltaTime;
      this.mesh.position.y += this.verticalVelocity * deltaTime;

      if (this.mesh.position.y <= 0) {
        this.mesh.position.y = 0;
        this.verticalVelocity = 0;
        this.state = PlayerState.RUNNING;
      }
    }
  }

  private updateSlide(deltaTime: number): void {
    if (this.state === PlayerState.SLIDING) {
      this.slideTimer -= deltaTime;
      if (this.slideTimer <= 0) {
        this.state = PlayerState.RUNNING;
      }
    }

    const targetHeight = this.state === PlayerState.SLIDING 
      ? GameConfig.PLAYER_HEIGHT * 0.4 
      : GameConfig.PLAYER_HEIGHT;
    
    this.visualHeight = lerp(this.visualHeight, targetHeight, 15 * deltaTime);
    this.bodyMesh.scale.y = this.visualHeight / GameConfig.PLAYER_HEIGHT;
    this.bodyMesh.position.y = 0.2 + this.visualHeight * 0.35;
    this.headMesh.position.y = this.visualHeight - 0.1;
  }

  private updatePowerups(deltaTime: number): void {
    if (this.hasShield) {
      this.shieldTimer -= deltaTime;
      if (this.shieldTimer <= 0) {
        this.hasShield = false;
      }
    }

    if (this.hasMagnet) {
      this.magnetTimer -= deltaTime;
      if (this.magnetTimer <= 0) {
        this.hasMagnet = false;
      }
    }

    if (this.hasDoubleScore) {
      this.doubleScoreTimer -= deltaTime;
      if (this.doubleScoreTimer <= 0) {
        this.hasDoubleScore = false;
      }
    }
  }

  private updateAnimation(deltaTime: number, speed: number): void {
    if (this.state === PlayerState.RUNNING) {
      this.runAnimationTime += deltaTime * speed * 0.3;
      const bobAmount = Math.sin(this.runAnimationTime) * 0.08;
      this.mesh.position.y = bobAmount;
    }
  }

  public moveLeft(): void {
    if (this.state === PlayerState.DEAD) return;
    this.targetLane = clamp(this.targetLane - 1, 0, GameConfig.LANE_COUNT - 1);
  }

  public moveRight(): void {
    if (this.state === PlayerState.DEAD) return;
    this.targetLane = clamp(this.targetLane + 1, 0, GameConfig.LANE_COUNT - 1);
  }

  public jump(): void {
    if (this.state !== PlayerState.RUNNING) return;
    this.state = PlayerState.JUMPING;
    this.verticalVelocity = GameConfig.JUMP_FORCE;
  }

  public slide(): void {
    if (this.state !== PlayerState.RUNNING) return;
    this.state = PlayerState.SLIDING;
    this.slideTimer = GameConfig.SLIDE_DURATION;
  }

  public activateShield(): void {
    this.hasShield = true;
    this.shieldTimer = GameConfig.POWERUPS.SHIELD_DURATION;
  }

  public activateMagnet(): void {
    this.hasMagnet = true;
    this.magnetTimer = GameConfig.POWERUPS.MAGNET_DURATION;
  }

  public activateDoubleScore(): void {
    this.hasDoubleScore = true;
    this.doubleScoreTimer = GameConfig.POWERUPS.DOUBLE_SCORE_DURATION;
  }

  public die(): void {
    this.state = PlayerState.DEAD;
  }

  public reset(): void {
    this.state = PlayerState.RUNNING;
    this.currentLane = 1;
    this.targetLane = 1;
    this.mesh.position.set(0, 0, 0);
    this.verticalVelocity = 0;
    this.slideTimer = 0;
    this.hasShield = false;
    this.hasMagnet = false;
    this.hasDoubleScore = false;
    this.visualHeight = GameConfig.PLAYER_HEIGHT;
  }

  public getCollisionBox(): { min: THREE.Vector3; max: THREE.Vector3 } {
    const pos = this.mesh.position;
    const width = GameConfig.PLAYER_WIDTH * 0.5;
    const height = this.visualHeight * 0.9;
    
    return {
      min: new THREE.Vector3(pos.x - width, pos.y, pos.z - width),
      max: new THREE.Vector3(pos.x + width, pos.y + height, pos.z + width),
    };
  }
}
