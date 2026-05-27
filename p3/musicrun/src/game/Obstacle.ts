import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../config';
import { ObstacleData } from '../types';

export class Obstacle {
  private mesh: THREE.Mesh | THREE.Group;
  private data: ObstacleData;
  private worldPosition: number = 0;
  private isActive = true;

  private baseScale: number = 1;
  
  constructor(data: ObstacleData, scene: THREE.Scene) {
    this.data = data;
    this.mesh = this.createMesh();
    this.updatePosition();
    scene.add(this.mesh);
  }
  
  private createMesh(): THREE.Group {
    const group = new THREE.Group();
    
    switch (this.data.type) {
      case 'jump':
        this.createJumpObstacle(group);
        break;
      case 'slide':
        this.createSlideObstacle(group);
        break;
      case 'lane':
        this.createLaneObstacle(group);
        break;
    }
    
    return group;
  }
  
  private createJumpObstacle(group: THREE.Group): void {
    const geometry = new THREE.BoxGeometry(
      GAME_CONFIG.LANE_WIDTH * 0.8,
      GAME_CONFIG.OBSTACLE_HEIGHT_JUMP,
      1.5
    );
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.DANGER,
      emissive: COLORS.DANGER,
      emissiveIntensity: 0.3,
      metalness: 0.6,
      roughness: 0.3,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = GAME_CONFIG.OBSTACLE_HEIGHT_JUMP / 2;
    mesh.castShadow = true;
    group.add(mesh);
    
    const glowGeometry = new THREE.BoxGeometry(
      GAME_CONFIG.LANE_WIDTH * 0.9,
      GAME_CONFIG.OBSTACLE_HEIGHT_JUMP + 0.2,
      1.6
    );
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.DANGER,
      transparent: true,
      opacity: 0.15,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = GAME_CONFIG.OBSTACLE_HEIGHT_JUMP / 2;
    group.add(glow);
    
    this.baseScale = 1;
  }
  
  private createSlideObstacle(group: THREE.Group): void {
    const geometry = new THREE.BoxGeometry(
      GAME_CONFIG.LANE_WIDTH * 0.9,
      0.1,
      2
    );
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.WARNING,
      emissive: COLORS.WARNING,
      emissiveIntensity: 0.4,
      metalness: 0.7,
      roughness: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = GAME_CONFIG.OBSTACLE_HEIGHT_JUMP + 0.6;
    group.add(mesh);
    
    const pillarGeometry = new THREE.CylinderGeometry(0.1, 0.15, GAME_CONFIG.OBSTACLE_HEIGHT_JUMP + 0.5, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.WARNING,
      emissive: COLORS.WARNING,
      emissiveIntensity: 0.2,
    });
    
    const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    leftPillar.position.set(
      -GAME_CONFIG.LANE_WIDTH * 0.35,
      (GAME_CONFIG.OBSTACLE_HEIGHT_JUMP + 0.5) / 2 + 0.1,
      0
    );
    group.add(leftPillar);
    
    const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    rightPillar.position.set(
      GAME_CONFIG.LANE_WIDTH * 0.35,
      (GAME_CONFIG.OBSTACLE_HEIGHT_JUMP + 0.5) / 2 + 0.1,
      0
    );
    group.add(rightPillar);
    
    this.baseScale = 1;
  }
  
  private createLaneObstacle(group: THREE.Group): void {
    const geometry = new THREE.ConeGeometry(0.6, 1.2, 6);
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.SECONDARY,
      emissive: COLORS.SECONDARY,
      emissiveIntensity: 0.3,
      metalness: 0.5,
      roughness: 0.4,
    });
    
    for (let i = 0; i < 3; i++) {
      const spike = new THREE.Mesh(geometry, material);
      spike.position.set(
        (i - 1) * 0.5,
        0.6,
        i * 0.3 - 0.3
      );
      spike.rotation.x = Math.PI;
      group.add(spike);
    }
    
    this.baseScale = 1;
  }
  
  update(_delta: number, playerZ: number, beatIntensity: number = 0): void {
    if (!this.isActive) return;
    
    const pulseScale = 1 + beatIntensity * 0.15;
    this.mesh.scale.setScalar(this.baseScale * pulseScale);
    
    const distance = this.worldPosition - playerZ;
    this.mesh.position.z = -distance;
    
    if (distance > GAME_CONFIG.VISIBLE_TRACK_LENGTH) {
      this.mesh.visible = false;
    } else if (distance < -10) {
      this.isActive = false;
      this.mesh.visible = false;
    } else {
      this.mesh.visible = true;
    }
  }
  
  private updatePosition(): void {
    const laneX = this.getLaneX(this.data.lane);
    this.mesh.position.x = laneX;
    this.mesh.position.z = -this.worldPosition;
  }
  
  private getLaneX(lane: number): number {
    const totalWidth = (GAME_CONFIG.LANE_COUNT - 1) * GAME_CONFIG.LANE_WIDTH;
    return lane * GAME_CONFIG.LANE_WIDTH - totalWidth / 2;
  }
  
  setWorldPosition(z: number): void {
    this.worldPosition = z;
    this.updatePosition();
  }
  
  getWorldPosition(): number {
    return this.worldPosition;
  }
  
  getData(): ObstacleData {
    return this.data;
  }
  
  getIsActive(): boolean {
    return this.isActive;
  }
  
  getBoundingBox(): THREE.Box3 {
    return new THREE.Box3().setFromObject(this.mesh);
  }
  
  getType(): 'jump' | 'slide' | 'lane' {
    return this.data.type;
  }
  
  getLane(): number {
    return this.data.lane;
  }
  
  pulse(): void {
    // Intentionally empty - pulse effect handled by beatIntensity parameter
  }
  
  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
    if (this.mesh instanceof THREE.Group) {
      this.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
  }
}
