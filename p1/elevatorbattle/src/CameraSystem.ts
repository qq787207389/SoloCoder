import { Camera, TILE_SIZE, Rect, Direction } from './types';
import { MapSystem } from './MapSystem';
import { Collision } from './Collision';
import { Player } from './Player';

export class CameraSystem {
  private cameras: Camera[] = [];
  private nextId: number = 0;
  private globalAlert: boolean = false;
  private reinforcementTimer: number = 0;
  private onReinforcements: (() => void) | null = null;

  constructor() {}

  public initialize(mapSystem: MapSystem, level: number): void {
    this.cameras = [];
    this.globalAlert = false;
    this.reinforcementTimer = 0;

    const floors = mapSystem.getFloors();

    for (const floor of floors) {
      for (const pos of floor.cameraPositions) {
        const sweepSpeed = 1 + level * 0.3;
        const sweepRange = Math.PI / 3 + level * 0.1;
        const viewDistance = 150 + level * 20;

        this.cameras.push({
          id: this.nextId++,
          x: pos.x * TILE_SIZE + TILE_SIZE / 2,
          y: pos.y * TILE_SIZE + TILE_SIZE / 2,
          angle: 0,
          sweepSpeed,
          sweepRange,
          sweepDirection: 1,
          viewDistance,
          alertTimer: 0,
          spotted: false,
        });
      }
    }
  }

  public update(dt: number, player: Player, mapSystem: MapSystem): void {
    const playerRect = player.getRect();
    const playerCenterX = playerRect.x + playerRect.width / 2;
    const playerCenterY = playerRect.y + playerRect.height / 2;

    for (const camera of this.cameras) {
      camera.angle += camera.sweepSpeed * camera.sweepDirection * dt;

      if (Math.abs(camera.angle) > camera.sweepRange) {
        camera.sweepDirection *= -1;
      }

      const dx = playerCenterX - camera.x;
      const dy = playerCenterY - camera.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < camera.viewDistance && dy > 0) {
        const angleToPlayer = Math.atan2(dx, dy) - Math.PI / 2;
        const angleDiff = Math.abs(angleToPlayer - camera.angle);

        if (angleDiff < 0.3 && this.hasLineOfSight(camera, playerCenterX, playerCenterY, mapSystem)) {
          camera.alertTimer += dt;
          camera.spotted = true;

          if (camera.alertTimer > 0.5) {
            this.globalAlert = true;
            this.reinforcementTimer += dt;

            if (this.reinforcementTimer > 3) {
              this.callReinforcements();
              this.reinforcementTimer = 0;
            }
          }
        } else {
          camera.spotted = false;
          camera.alertTimer = Math.max(0, camera.alertTimer - dt * 0.5);
        }
      } else {
        camera.spotted = false;
        camera.alertTimer = Math.max(0, camera.alertTimer - dt * 0.5);
      }
    }

    if (!this.isAnyCameraSpotted()) {
      this.reinforcementTimer = Math.max(0, this.reinforcementTimer - dt * 0.3);
    }
  }

  private hasLineOfSight(
    camera: Camera,
    targetX: number,
    targetY: number,
    mapSystem: MapSystem
  ): boolean {
    const dx = targetX - camera.x;
    const dy = targetY - camera.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / dist;
    const dirY = dy / dist;

    const result = Collision.raycast(
      camera.x,
      camera.y,
      dirX,
      dirY,
      dist,
      (x, y) => mapSystem.isSolid(x, y)
    );

    return !result.hit || result.distance >= dist * 0.9;
  }

  private isAnyCameraSpotted(): boolean {
    return this.cameras.some(c => c.spotted && c.alertTimer > 0.3);
  }

  private callReinforcements(): void {
    if (this.onReinforcements) {
      this.onReinforcements();
    }
  }

  public getCameras(): Camera[] {
    return this.cameras;
  }

  public isGlobalAlert(): boolean {
    return this.globalAlert;
  }

  public setOnReinforcements(callback: () => void): void {
    this.onReinforcements = callback;
  }

  public getReinforcementTimer(): number {
    return this.reinforcementTimer;
  }

  public triggerAlert(): void {
    this.globalAlert = true;
  }
}
