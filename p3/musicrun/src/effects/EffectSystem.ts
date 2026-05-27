import * as THREE from 'three';
import { COLORS } from '../config';
import { ParticleData } from '../types';

export class EffectSystem {
  private scene: THREE.Scene;
  private particles: THREE.Points | null = null;
  private particleData: ParticleData[] = [];
  private maxParticles: number = 500;
  
  private judgmentTexts: THREE.Group[] = [];
  
  private speedLines: THREE.Line[] = [];
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createParticleSystem();
    this.createSpeedLines();
  }
  
  private createParticleSystem(): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxParticles * 3);
    const colors = new Float32Array(this.maxParticles * 3);
    const sizes = new Float32Array(this.maxParticles);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    
    for (let i = 0; i < this.maxParticles; i++) {
      this.particleData.push({
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        life: 0, maxLife: 1,
        color: COLORS.PRIMARY,
        size: 1,
      });
    }
  }
  
  private createSpeedLines(): void {
    for (let i = 0; i < 20; i++) {
      const points = [];
      points.push(new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 5,
        -Math.random() * 50 - 10
      ));
      points.push(new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 5,
        -Math.random() * 50 - 20
      ));
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: COLORS.PRIMARY,
        transparent: true,
        opacity: 0.3,
      });
      
      const line = new THREE.Line(geometry, material);
      this.speedLines.push(line);
      this.scene.add(line);
    }
  }
  
  spawnParticles(
    position: THREE.Vector3,
    count: number,
    color: number,
    speed: number = 2,
    life: number = 1
  ): void {
    for (let i = 0; i < count; i++) {
      const particle = this.findInactiveParticle();
      if (!particle) continue;
      
      particle.x = position.x;
      particle.y = position.y;
      particle.z = position.z;
      
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * speed;
      particle.vx = Math.cos(angle) * spread;
      particle.vy = Math.random() * speed;
      particle.vz = Math.sin(angle) * spread;
      
      particle.color = color;
      particle.life = life;
      particle.maxLife = life;
      particle.size = 0.5 + Math.random() * 0.5;
    }
  }
  
  private findInactiveParticle(): ParticleData | null {
    for (const particle of this.particleData) {
      if (particle.life <= 0) {
        return particle;
      }
    }
    return null;
  }
  
  spawnJudgmentText(type: 'perfect' | 'good' | 'miss', position: THREE.Vector3): void {
    const group = new THREE.Group();
    
    let text: string;
    
    switch (type) {
      case 'perfect':
        text = 'PERFECT!';
        break;
      case 'good':
        text = 'GOOD';
        break;
      case 'miss':
        text = 'MISS';
        break;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = type === 'perfect' ? '#00ff00' : type === 'good' ? '#ffff00' : '#ff0000';
    ctx.fillText(text, 128, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3, 0.75, 1);
    sprite.position.copy(position);
    sprite.position.y += 2;
    
    group.add(sprite);
    group.userData = { life: 1, maxLife: 1, startY: position.y + 2 };
    
    this.judgmentTexts.push(group);
    this.scene.add(group);
  }
  
  update(delta: number, isSuperSonic: boolean, speed: number): void {
    this.updateParticles(delta);
    this.updateJudgmentTexts(delta);
    this.updateSpeedLines(delta, isSuperSonic, speed);
  }
  
  private updateParticles(delta: number): void {
    if (!this.particles) return;
    
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const colors = this.particles.geometry.attributes.color.array as Float32Array;
    const sizes = this.particles.geometry.attributes.size.array as Float32Array;
    
    for (let i = 0; i < this.particleData.length; i++) {
      const particle = this.particleData[i];
      
      if (particle.life > 0) {
        particle.life -= delta;
        
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.z += particle.vz * delta;
        
        particle.vy -= delta * 2;
        
        const alpha = Math.max(0, particle.life / particle.maxLife);
        const colorObj = new THREE.Color(particle.color);
        
        positions[i * 3] = particle.x;
        positions[i * 3 + 1] = particle.y;
        positions[i * 3 + 2] = particle.z;
        
        colors[i * 3] = colorObj.r * alpha;
        colors[i * 3 + 1] = colorObj.g * alpha;
        colors[i * 3 + 2] = colorObj.b * alpha;
        
        sizes[i] = particle.size * alpha;
      } else {
        positions[i * 3 + 1] = -1000;
      }
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;
    this.particles.geometry.attributes.size.needsUpdate = true;
  }
  
  private updateJudgmentTexts(delta: number): void {
    for (let i = this.judgmentTexts.length - 1; i >= 0; i--) {
      const group = this.judgmentTexts[i];
      group.userData.life -= delta;
      
      const alpha = Math.max(0, group.userData.life / group.userData.maxLife);
      const rise = (1 - alpha) * 2;
      
      group.position.y = group.userData.startY + rise;
      group.children.forEach((child) => {
        if (child instanceof THREE.Sprite) {
          child.material.opacity = alpha;
        }
      });
      
      if (group.userData.life <= 0) {
        this.scene.remove(group);
        this.judgmentTexts.splice(i, 1);
      }
    }
  }
  
  private updateSpeedLines(delta: number, isSuperSonic: boolean, speed: number): void {
    const lineSpeed = isSuperSonic ? speed * 3 : speed * 0.5;
    
    for (const line of this.speedLines) {
      line.position.z += lineSpeed * delta * 60;
      
      if (line.position.z > 10) {
        line.position.z = -60 - Math.random() * 30;
        line.position.x = (Math.random() - 0.5) * 12;
        line.position.y = Math.random() * 6;
      }
      
      const material = line.material as THREE.LineBasicMaterial;
      material.opacity = isSuperSonic ? 0.6 : 0.2;
      material.color.setHex(isSuperSonic ? COLORS.ACCENT : COLORS.PRIMARY);
    }
  }
  
  updateBackgroundParticles(
    particles: THREE.Points,
    spectrum: Uint8Array,
    delta: number
  ): void {
    const positions = particles.geometry.attributes.position.array as Float32Array;
    const colors = particles.geometry.attributes.color.array as Float32Array;
    
    const bassEnergy = spectrum.slice(0, 20).reduce((a, b) => a + b, 0) / 20 / 255;
    const midEnergy = spectrum.slice(20, 100).reduce((a, b) => a + b, 0) / 80 / 255;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      
      positions[i3 + 2] += delta * 5 * (1 + bassEnergy * 2);
      
      if (positions[i3 + 2] > 10) {
        positions[i3] = (Math.random() - 0.5) * 60;
        positions[i3 + 1] = Math.random() * 30;
        positions[i3 + 2] = -150;
      }
      
      const hue = 0.5 + midEnergy * 0.3 + (i % 10) * 0.02;
      const color = new THREE.Color();
      color.setHSL(hue, 0.8, 0.5 + bassEnergy * 0.2);
      
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
  }
  
  updateLighting(
    pointLight: THREE.PointLight,
    trackEdges: THREE.Mesh[],
    spectrum: Uint8Array
  ): void {
    const bassEnergy = spectrum.slice(0, 20).reduce((a, b) => a + b, 0) / 20 / 255;
    const highEnergy = spectrum.slice(150).reduce((a, b) => a + b, 0) / 106 / 255;
    
    pointLight.intensity = 2 + bassEnergy * 3;
    
    const hue = 0.5 + highEnergy * 0.3;
    const color = new THREE.Color();
    color.setHSL(hue, 1, 0.5);
    pointLight.color = color;
    
    trackEdges.forEach((edge, index) => {
      const material = edge.material as THREE.MeshStandardMaterial;
      material.emissive = color;
      material.emissiveIntensity = 0.3 + bassEnergy * 0.5 * (index === 0 ? 1 : 0.8);
    });
  }
  
  dispose(): void {
    if (this.particles) {
      this.scene.remove(this.particles);
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
    
    for (const line of this.speedLines) {
      this.scene.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    }
    
    for (const text of this.judgmentTexts) {
      this.scene.remove(text);
    }
  }
}
