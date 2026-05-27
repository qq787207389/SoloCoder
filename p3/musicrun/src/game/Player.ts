import * as THREE from 'three';
import { GAME_CONFIG } from '../config';
import { PlayerAction, JudgmentResult } from '../types';

export class Player {
  private mesh: THREE.Group;
  private currentLane = 1;
  private targetLane = 1;
  private laneChangeProgress = 1;
  
  private isJumping = false;
  private jumpProgress = 0;
  private baseY = 0;
  
  private isSliding = false;
  private slideProgress = 0;
  
  private baseScale = 1;
  private currentScale = 1;
  
  private laneWidth: number;
  private laneCount: number;
  
  constructor(mesh: THREE.Group) {
    this.mesh = mesh;
    this.laneWidth = GAME_CONFIG.LANE_WIDTH;
    this.laneCount = GAME_CONFIG.LANE_COUNT;
    this.baseY = GAME_CONFIG.PLAYER_Y;
  }
  
  update(delta: number): void {
    if (this.laneChangeProgress < 1) {
      this.laneChangeProgress = Math.min(1, this.laneChangeProgress + delta / GAME_CONFIG.LANE_CHANGE_DURATION);
      const smoothProgress = this.easeOutCubic(this.laneChangeProgress);
      const targetX = this.getLaneX(this.targetLane);
      const startX = this.getLaneX(this.currentLane);
      this.mesh.position.x = startX + (targetX - startX) * smoothProgress;
      
      if (this.laneChangeProgress >= 1) {
        this.currentLane = this.targetLane;
      }
    }
    
    if (this.isJumping) {
      this.jumpProgress += delta / GAME_CONFIG.JUMP_DURATION;
      if (this.jumpProgress >= 1) {
        this.jumpProgress = 0;
        this.isJumping = false;
        this.mesh.position.y = this.baseY;
      } else {
        const jumpHeight = Math.sin(this.jumpProgress * Math.PI) * GAME_CONFIG.JUMP_HEIGHT;
        this.mesh.position.y = this.baseY + jumpHeight;
      }
    }
    
    if (this.isSliding) {
      this.slideProgress += delta / GAME_CONFIG.SLIDE_DURATION;
      if (this.slideProgress >= 1) {
        this.slideProgress = 0;
        this.isSliding = false;
        this.currentScale = this.baseScale;
        this.mesh.scale.setScalar(this.baseScale);
      } else {
        const slideFactor = 0.5 + 0.5 * Math.cos(this.slideProgress * Math.PI * 2);
        this.currentScale = this.baseScale * (1 - slideFactor * 0.5);
        this.mesh.scale.set(this.baseScale, this.currentScale * 0.5, this.baseScale);
        this.mesh.position.y = this.baseY * this.currentScale * 0.5;
      }
    }
    
    this.mesh.rotation.y += delta * 2;
  }
  
  performAction(action: PlayerAction): boolean {
    switch (action) {
      case 'jump':
        if (!this.isJumping && !this.isSliding) {
          this.isJumping = true;
          this.jumpProgress = 0;
          return true;
        }
        return false;
        
      case 'slide':
        if (!this.isJumping && !this.isSliding) {
          this.isSliding = true;
          this.slideProgress = 0;
          return true;
        }
        return false;
        
      case 'left':
        if (this.targetLane > 0) {
          this.targetLane--;
          if (this.laneChangeProgress >= 1) {
            this.currentLane = this.targetLane + 1;
          }
          this.laneChangeProgress = 0;
          return true;
        }
        return false;
        
      case 'right':
        if (this.targetLane < this.laneCount - 1) {
          this.targetLane++;
          if (this.laneChangeProgress >= 1) {
            this.currentLane = this.targetLane - 1;
          }
          this.laneChangeProgress = 0;
          return true;
        }
        return false;
    }
  }
  
  judgeAction(_action: PlayerAction, beatOffset: number): JudgmentResult {
    const absOffset = Math.abs(beatOffset);
    
    if (absOffset <= GAME_CONFIG.PERFECT_WINDOW) {
      return { type: 'perfect', timingOffset: beatOffset };
    } else if (absOffset <= GAME_CONFIG.GOOD_WINDOW) {
      return { type: 'good', timingOffset: beatOffset };
    }
    
    return { type: 'miss', timingOffset: beatOffset };
  }
  
  private getLaneX(lane: number): number {
    const totalWidth = (this.laneCount - 1) * this.laneWidth;
    return lane * this.laneWidth - totalWidth / 2;
  }
  
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }
  
  getCurrentLane(): number {
    return this.currentLane;
  }
  
  getTargetLane(): number {
    return this.targetLane;
  }
  
  getIsJumping(): boolean {
    return this.isJumping;
  }
  
  getIsSliding(): boolean {
    return this.isSliding;
  }
  
  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
  
  getBoundingBox(): THREE.Box3 {
    const box = new THREE.Box3().setFromObject(this.mesh);
    return box;
  }
  
  setSuperSonic(active: boolean): void {
    const material = (this.mesh.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    if (active) {
      material.emissiveIntensity = 1.5;
      material.color.setHex(0xffff00);
      this.mesh.scale.setScalar(1.2);
    } else {
      material.emissiveIntensity = 0.5;
      material.color.setHex(0x00ffff);
      this.mesh.scale.setScalar(1);
    }
  }
  
  reset(): void {
    this.currentLane = 1;
    this.targetLane = 1;
    this.laneChangeProgress = 1;
    this.isJumping = false;
    this.isSliding = false;
    this.mesh.position.set(0, this.baseY, 0);
    this.mesh.scale.setScalar(1);
    this.setSuperSonic(false);
  }
}
