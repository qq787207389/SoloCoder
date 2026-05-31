import {
  TerrainType, ObstacleType, TERRAIN_PROPS,
  MOTO_W, MOTO_H, MAX_SPEED, ACCEL, BRAKE_FORCE,
  FRICTION, TURN_RATE, GRAVITY, JUMP_FORCE,
  CRASH_RECOVERY_TIME, TireTrack, PickupType,
} from './types';
import { clamp, lerp } from './utils';
import { InputState } from './input';
import { Track } from './track';

export interface MotoState {
  x: number;
  y: number;
  angle: number;
  speed: number;
  lateralSpeed: number;
  height: number;
  verticalSpeed: number;
  pitch: number;
  tilt: number;
  crashed: boolean;
  crashTimer: number;
  onGround: boolean;
  washboardShake: number;
  damage: number;
  speedBoost: number;
  boostTimer: number;
  distance: number;
  finished: boolean;
  finishTime: number;
  tireTracks: TireTrack[];
  isPlayer: boolean;
  name: string;
  color: string;
  trackProgress: number;
}

export function createMoto(x: number, y: number, angle: number, name: string, color: string, isPlayer: boolean): MotoState {
  return {
    x, y, angle,
    speed: 0,
    lateralSpeed: 0,
    height: 0,
    verticalSpeed: 0,
    pitch: 0,
    tilt: 0,
    crashed: false,
    crashTimer: 0,
    onGround: true,
    washboardShake: 0,
    damage: 0,
    speedBoost: 0,
    boostTimer: 0,
    distance: 0,
    finished: false,
    finishTime: 0,
    tireTracks: [],
    isPlayer,
    name,
    color,
    trackProgress: 0,
  };
}

export function updateMoto(moto: MotoState, input: InputState, track: Track, dt: number) {
  if (moto.crashed) {
    moto.crashTimer -= dt;
    if (moto.crashTimer <= 0) {
      moto.crashed = false;
      moto.speed = 0;
      moto.height = 0;
      moto.verticalSpeed = 0;
      moto.pitch = 0;
      moto.damage = Math.max(0, moto.damage - 30);
    }
    return;
  }

  if (moto.finished) return;

  const segIdx = track.getSegmentIndex(moto.x, moto.y);
  const seg = track.points[segIdx];
  if (!seg) return;

  const terrain = seg.terrain;
  const props = TERRAIN_PROPS[terrain];
  const currentMaxSpeed = props.maxSpeed + moto.speedBoost;

  if (input.up) {
    moto.speed += ACCEL * dt;
  } else if (input.down) {
    if (moto.speed > 0.2) {
      moto.speed -= BRAKE_FORCE * dt;
    } else {
      moto.speed -= ACCEL * 0.35 * dt;
    }
  }

  moto.speed -= moto.speed * props.friction * dt;
  if (!input.up && moto.speed > 0) {
    moto.speed -= FRICTION * 0.5 * dt;
  }
  moto.speed -= Math.abs(moto.tilt) * 0.008 * dt;
  moto.speed = clamp(moto.speed, -1.5, currentMaxSpeed);

  if (!moto.onGround) {
    if (input.up || input.leanForward) {
      moto.pitch -= 0.035 * dt;
    }
    if (input.down || input.leanBackward) {
      moto.pitch += 0.035 * dt;
    }
    moto.pitch = clamp(moto.pitch, -0.6, 0.6);
    moto.pitch *= 0.995;
  }

  const turnFactor = moto.onGround ? 1.0 : 0.25;
  const speedFactor = clamp(Math.abs(moto.speed) / MAX_SPEED, 0.15, 1.0);
  const effectiveTurnRate = TURN_RATE * turnFactor * speedFactor * dt;

  if (input.left) {
    moto.angle -= effectiveTurnRate;
    moto.tilt = lerp(moto.tilt, -0.45, 0.12 * dt);
  } else if (input.right) {
    moto.angle += effectiveTurnRate;
    moto.tilt = lerp(moto.tilt, 0.45, 0.12 * dt);
  } else {
    moto.tilt = lerp(moto.tilt, 0, 0.2 * dt);
  }

  if (props.slideFactor > 0 && moto.onGround) {
    const slideDir = moto.tilt > 0.05 ? 1 : moto.tilt < -0.05 ? -1 : 0;
    if (slideDir !== 0) {
      moto.lateralSpeed += slideDir * props.slideFactor * Math.abs(moto.speed) * dt;
    }
  }
  moto.lateralSpeed *= Math.pow(0.88, dt);
  moto.lateralSpeed = clamp(moto.lateralSpeed, -2.0, 2.0);

  const perpAngle = moto.angle + Math.PI / 2;
  moto.x += (Math.cos(moto.angle) * moto.speed + Math.cos(perpAngle) * moto.lateralSpeed) * dt;
  moto.y += (Math.sin(moto.angle) * moto.speed + Math.sin(perpAngle) * moto.lateralSpeed) * dt;

  if (moto.onGround) {
    for (const obs of seg.obstacles) {
      const perpA = seg.angle + Math.PI / 2;
      const ox = seg.x + Math.cos(perpA) * obs.relX;
      const oy = seg.y + Math.sin(perpA) * obs.relX;
      const dx = moto.x - ox;
      const dy = moto.y - oy;

      if (Math.abs(dx) < obs.w / 2 + MOTO_W / 2 && Math.abs(dy) < obs.h / 2 + MOTO_H / 2) {
        switch (obs.type) {
          case ObstacleType.MUD:
            moto.speed *= Math.pow(0.96, dt);
            break;
          case ObstacleType.PUDDLE:
            moto.lateralSpeed += (Math.random() - 0.5) * 0.4 * dt;
            moto.speed *= Math.pow(0.98, dt);
            break;
          case ObstacleType.BUMP:
            if (moto.speed > 0.8 && moto.height === 0) {
              moto.height = 0.1;
              moto.verticalSpeed = JUMP_FORCE * clamp(moto.speed / MAX_SPEED, 0.3, 1.0);
              moto.onGround = false;
              moto.pitch = 0.15;
            }
            break;
          case ObstacleType.RAMP:
            if (moto.speed > 1.2 && moto.height === 0) {
              moto.height = 0.1;
              moto.verticalSpeed = JUMP_FORCE * 1.4 * clamp(moto.speed / MAX_SPEED, 0.4, 1.0);
              moto.onGround = false;
              moto.pitch = -0.2;
            }
            break;
          case ObstacleType.WASHBOARD:
            moto.washboardShake = 20;
            moto.speed *= Math.pow(0.97, dt);
            if (moto.speed > MAX_SPEED * 0.75) {
              if (Math.random() < 0.03 * dt) {
                crashMoto(moto);
              }
            }
            break;
          case ObstacleType.ROCK:
            if (moto.speed > 1.8) {
              crashMoto(moto);
            } else if (moto.speed > 0.5) {
              moto.speed *= 0.4;
              moto.damage += 10;
            } else {
              moto.speed = 0;
            }
            break;
        }
      }
    }

    for (const pickup of seg.pickups) {
      if (pickup.collected) continue;
      const dx = moto.x - pickup.x;
      const dy = moto.y - pickup.y;
      if (dx * dx + dy * dy < 14 * 14) {
        pickup.collected = true;
        if (pickup.type === PickupType.WRENCH) {
          moto.damage = Math.max(0, moto.damage - 40);
        } else if (pickup.type === PickupType.FUEL) {
          moto.speedBoost = 0.8;
          moto.boostTimer = 300;
        }
      }
    }
  }

  if (!moto.onGround) {
    moto.verticalSpeed -= GRAVITY * dt;
    moto.height += moto.verticalSpeed * dt;

    if (moto.height <= 0) {
      moto.height = 0;
      moto.onGround = true;

      const landMult = props.jumpLandMult;

      if (moto.damage > 70) {
        crashMoto(moto);
      } else if (Math.abs(moto.pitch) > 0.4 / landMult) {
        if (moto.pitch < -0.25 / landMult) {
          crashMoto(moto);
        } else {
          moto.speed *= 0.65;
          moto.damage += 15;
        }
      } else if (moto.pitch > 0.12) {
        moto.verticalSpeed = 1.0;
        moto.height = 0.1;
        moto.onGround = false;
      }

      if (moto.onGround) {
        moto.pitch = 0;
        moto.verticalSpeed = 0;
      }
    }
  }

  if (moto.washboardShake > 0) {
    moto.washboardShake -= dt;
    if (moto.washboardShake > 0) {
      moto.x += (Math.random() - 0.5) * 1.2;
      moto.y += (Math.random() - 0.5) * 1.2;
    }
  }

  if (moto.boostTimer > 0) {
    moto.boostTimer -= dt;
    if (moto.boostTimer <= 0) {
      moto.speedBoost = 0;
    }
  }

  if (!track.isOnTrack(moto.x, moto.y)) {
    moto.speed *= Math.pow(0.97, dt);
    if (Math.abs(moto.speed) > 1.2) {
      moto.lateralSpeed += (Math.random() - 0.5) * 0.15 * dt;
    }
  }

  if (Math.abs(moto.speed) > 0.3 && moto.onGround && Math.random() < 0.4) {
    const perpA = moto.angle + Math.PI / 2;
    const trackOffset = 2;
    moto.tireTracks.push({
      x: moto.x + Math.cos(perpA) * trackOffset,
      y: moto.y + Math.sin(perpA) * trackOffset,
      age: 0,
      angle: moto.angle,
    });
    moto.tireTracks.push({
      x: moto.x - Math.cos(perpA) * trackOffset,
      y: moto.y - Math.sin(perpA) * trackOffset,
      age: 0,
      angle: moto.angle,
    });
  }

  for (let i = moto.tireTracks.length - 1; i >= 0; i--) {
    moto.tireTracks[i].age += dt;
    if (moto.tireTracks[i].age > 400) {
      moto.tireTracks.splice(i, 1);
    }
  }

  if (moto.tireTracks.length > 400) {
    moto.tireTracks.splice(0, moto.tireTracks.length - 400);
  }

  moto.distance = track.getDistanceOnTrack(moto.x, moto.y);
  moto.trackProgress = segIdx;

  const finishIdx = track.points.length - 5;
  if (segIdx >= finishIdx && !moto.finished) {
    moto.finished = true;
  }
}

function crashMoto(moto: MotoState) {
  moto.crashed = true;
  moto.crashTimer = CRASH_RECOVERY_TIME;
  moto.speed = 0;
  moto.lateralSpeed = 0;
  moto.height = 0;
  moto.verticalSpeed = 0;
  moto.pitch = 0;
  moto.onGround = true;
  moto.damage = Math.min(100, moto.damage + 25);
}
