import * as THREE from 'three';

export class ParticleSystem {
  private particles: THREE.Points;
  private positions: Float32Array;
  private velocities: Float32Array;
  private lifetimes: Float32Array;
  private maxParticles: number;
  private activeCount: number = 0;

  constructor(maxParticles: number = 200) {
    this.maxParticles = maxParticles;
    
    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(maxParticles * 3);
    this.velocities = new Float32Array(maxParticles * 3);
    this.lifetimes = new Float32Array(maxParticles);

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xd4a574,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    this.particles.visible = true;
  }

  public getMesh(): THREE.Points {
    return this.particles;
  }

  public emit(position: THREE.Vector3, count: number = 5): void {
    for (let i = 0; i < count && this.activeCount < this.maxParticles; i++) {
      const index = this.activeCount;
      this.positions[index * 3] = position.x + (Math.random() - 0.5) * 0.5;
      this.positions[index * 3 + 1] = position.y + Math.random() * 0.3;
      this.positions[index * 3 + 2] = position.z + (Math.random() - 0.5) * 0.5;

      this.velocities[index * 3] = (Math.random() - 0.5) * 2;
      this.velocities[index * 3 + 1] = Math.random() * 2 + 1;
      this.velocities[index * 3 + 2] = (Math.random() - 0.5) * 2;

      this.lifetimes[index] = 0.5 + Math.random() * 0.5;
      this.activeCount++;
    }
  }

  public update(deltaTime: number): void {
    for (let i = this.activeCount - 1; i >= 0; i--) {
      this.lifetimes[i] -= deltaTime;

      if (this.lifetimes[i] <= 0) {
        this.activeCount--;
        if (i !== this.activeCount) {
          this.positions[i * 3] = this.positions[this.activeCount * 3];
          this.positions[i * 3 + 1] = this.positions[this.activeCount * 3 + 1];
          this.positions[i * 3 + 2] = this.positions[this.activeCount * 3 + 2];
          this.velocities[i * 3] = this.velocities[this.activeCount * 3];
          this.velocities[i * 3 + 1] = this.velocities[this.activeCount * 3 + 1];
          this.velocities[i * 3 + 2] = this.velocities[this.activeCount * 3 + 2];
          this.lifetimes[i] = this.lifetimes[this.activeCount];
        }
        continue;
      }

      this.positions[i * 3] += this.velocities[i * 3] * deltaTime;
      this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * deltaTime;
      this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * deltaTime;
      this.velocities[i * 3 + 1] -= 5 * deltaTime;
    }

    (this.particles.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    this.particles.geometry.setDrawRange(0, this.activeCount);
  }

  public clear(): void {
    this.activeCount = 0;
    this.particles.geometry.setDrawRange(0, 0);
  }
}
