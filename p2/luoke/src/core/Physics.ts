import { GRAVITY, MAX_FALL_SPEED } from '../utils/constants';
import { Rect, Vector2, Platform } from '../utils/types';

export class PhysicsEngine {
  public static applyGravity(velocity: Vector2): void {
    velocity.y += GRAVITY;
    if (velocity.y > MAX_FALL_SPEED) {
      velocity.y = MAX_FALL_SPEED;
    }
  }

  public static checkCollision(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  public static checkPlatformCollision(
    entity: Rect,
    velocity: Vector2,
    platforms: Platform[]
  ): { collided: boolean; grounded: boolean; platform: Platform | null } {
    let grounded = false;
    let collidedPlatform: Platform | null = null;

    for (const platform of platforms) {
      if (
        velocity.y >= 0 &&
        entity.x + entity.width > platform.x &&
        entity.x < platform.x + platform.width &&
        entity.y + entity.height >= platform.y &&
        entity.y + entity.height <= platform.y + 20
      ) {
        grounded = true;
        collidedPlatform = platform;
      }
    }

    return { collided: grounded, grounded, platform: collidedPlatform };
  }

  public static resolveCollision(
    entityPosition: Vector2,
    entityVelocity: Vector2,
    entitySize: { width: number; height: number },
    platforms: Platform[]
  ): { grounded: boolean; newPosition: Vector2; newVelocity: Vector2 } {
    const newPosition = { ...entityPosition };
    const newVelocity = { ...entityVelocity };
    let grounded = false;

    newPosition.x += newVelocity.x;

    for (const platform of platforms) {
      if (platform.type !== 'solid' && platform.type !== 'breakable') continue;

      const entityRect = {
        x: newPosition.x,
        y: newPosition.y,
        width: entitySize.width,
        height: entitySize.height
      };

      if (this.checkCollision(entityRect, platform)) {
        if (newVelocity.x > 0) {
          newPosition.x = platform.x - entitySize.width;
        } else if (newVelocity.x < 0) {
          newPosition.x = platform.x + platform.width;
        }
        newVelocity.x = 0;
      }
    }

    newPosition.y += newVelocity.y;

    for (const platform of platforms) {
      if (platform.type !== 'solid' && platform.type !== 'breakable') continue;

      const entityRect = {
        x: newPosition.x,
        y: newPosition.y,
        width: entitySize.width,
        height: entitySize.height
      };

      if (this.checkCollision(entityRect, platform)) {
        if (newVelocity.y > 0) {
          newPosition.y = platform.y - entitySize.height;
          grounded = true;
        } else if (newVelocity.y < 0) {
          newPosition.y = platform.y + platform.height;
        }
        newVelocity.y = 0;
      }
    }

    return { grounded, newPosition, newVelocity };
  }

  public static checkSpikeCollision(
    entity: Rect,
    platforms: Platform[]
  ): boolean {
    for (const platform of platforms) {
      if (platform.type === 'spike' && this.checkCollision(entity, platform)) {
        return true;
      }
    }
    return false;
  }
}
