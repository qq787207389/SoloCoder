import { Player } from './Player';
import { GameConfig } from '@/config/GameConfig';
import { circleCollision } from '@/utils/PhysicsHelper';

export interface CollisionEvent {
  type: 'player_hit' | 'environment' | 'powerup' | 'balloon' | 'event';
  player: Player;
  other: Player | any;
}

export class CollisionManager {
  players: Player[];
  collisionCooldown: Map<number, number>;
  cooldownTime: number;

  constructor() {
    this.players = [];
    this.collisionCooldown = new Map();
    this.cooldownTime = 500;
  }

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  removePlayer(player: Player): void {
    const index = this.players.indexOf(player);
    if (index > -1) {
      this.players.splice(index, 1);
    }
  }

  update(delta: number): CollisionEvent[] {
    const events: CollisionEvent[] = [];

    this.collisionCooldown.forEach((timer, id) => {
      this.collisionCooldown.set(id, timer - delta);
      if (timer - delta <= 0) {
        this.collisionCooldown.delete(id);
      }
    });

    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const p1 = this.players[i];
        const p2 = this.players[j];

        if (!p1.isAlive || !p2.isAlive || p1.isClone || p2.isClone) continue;

        const collisionId = p1.id * 1000 + p2.id;
        if (this.collisionCooldown.has(collisionId)) continue;

        if (p1.checkBalloonCollision(p2) || p1.checkBodyCollision(p2)) {
          if (p1.y < p2.y) {
            events.push({
              type: 'player_hit',
              player: p1,
              other: p2,
            });
          } else if (p2.y < p1.y) {
            events.push({
              type: 'player_hit',
              player: p2,
              other: p1,
            });
          } else {
            p1.velocityX *= -0.5;
            p2.velocityX *= -0.5;
          }

          this.collisionCooldown.set(collisionId, this.cooldownTime);
        }
      }
    }

    return events;
  }

  checkPointCollision(
    x: number,
    y: number,
    radius: number,
    excludePlayers: Player[] = []
  ): Player | null {
    for (const player of this.players) {
      if (excludePlayers.includes(player) || !player.isAlive || player.isClone) continue;

      if (
        circleCollision(
          x, y, radius,
          player.x, player.y - 30, player.getBalloonCollisionRadius()
        ) ||
        circleCollision(
          x, y, radius,
          player.x, player.y, player.getBodyCollisionRadius()
        )
      ) {
        return player;
      }
    }
    return null;
  }

  checkRectCollision(
    x: number,
    y: number,
    width: number,
    height: number,
    excludePlayers: Player[] = []
  ): Player | null {
    for (const player of this.players) {
      if (excludePlayers.includes(player) || !player.isAlive || player.isClone) continue;

      const closestX = Math.max(x, Math.min(player.x, x + width));
      const closestY = Math.max(y, Math.min(player.y - 30, y + height));
      const distX = player.x - closestX;
      const distY = player.y - 30 - closestY;
      const distSq = distX * distX + distY * distY;

      if (distSq < player.getBalloonCollisionRadius() * player.getBalloonCollisionRadius()) {
        return player;
      }
    }
    return null;
  }

  reset(): void {
    this.players = [];
    this.collisionCooldown.clear();
  }
}
