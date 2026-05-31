import { MotoState, createMoto, updateMoto } from './motorcycle';
import { Track } from './track';
import { InputState } from './input';
import { ObstacleType, TRACK_SEGMENT_LEN } from './types';
import { clamp, normalizeAngle } from './utils';

const AI_NAMES = ['暴风', '闪电', '旋风', '铁骑', '烈焰'];
const AI_COLORS = ['#E04040', '#4080E0', '#40C040', '#E0A020', '#A040C0'];
const AI_SKILLS = [0.85, 0.80, 0.75, 0.70, 0.65];

export class AIController {
  motos: MotoState[] = [];

  createOpponents(track: Track, count: number): MotoState[] {
    this.motos = [];
    for (let i = 0; i < count; i++) {
      const startSeg = 5 + i;
      const p = track.points[Math.min(startSeg, track.points.length - 1)];
      const perpAngle = p.angle + Math.PI / 2;
      const lateralOffset = ((i % 3) - 1) * 12;
      const mx = p.x + Math.cos(perpAngle) * lateralOffset;
      const my = p.y + Math.sin(perpAngle) * lateralOffset;
      const moto = createMoto(mx, my, p.angle, AI_NAMES[i % AI_NAMES.length], AI_COLORS[i % AI_COLORS.length], false);
      this.motos.push(moto);
    }
    return this.motos;
  }

  update(track: Track, dt: number) {
    for (let i = 0; i < this.motos.length; i++) {
      const moto = this.motos[i];
      const skill = AI_SKILLS[i % AI_SKILLS.length];
      const input = this.computeInput(moto, track, skill);
      updateMoto(moto, input, track, dt);
    }
  }

  private computeInput(moto: MotoState, track: Track, skill: number): InputState {
    if (moto.crashed || moto.finished) {
      return { up: false, down: false, left: false, right: false, leanForward: false, leanBackward: false, select: false };
    }

    const segIdx = track.getSegmentIndex(moto.x, moto.y);
    const lookAheadDist = Math.floor(8 + skill * 12);
    const lookAhead = Math.min(segIdx + lookAheadDist, track.points.length - 1);
    const target = track.points[lookAhead];

    const targetAngle = Math.atan2(target.y - moto.y, target.x - moto.x);
    const angleDiff = normalizeAngle(targetAngle - moto.angle);

    let steerLeft = false;
    let steerRight = false;
    let accel = true;
    let brake = false;
    let leanForward = false;
    let leanBackward = false;

    const steerThreshold = 0.05 + (1 - skill) * 0.05;
    if (angleDiff < -steerThreshold) {
      steerLeft = true;
    } else if (angleDiff > steerThreshold) {
      steerRight = true;
    }

    const currentSeg = track.points[segIdx];
    if (currentSeg) {
      for (const obs of currentSeg.obstacles) {
        const perpA = currentSeg.angle + Math.PI / 2;
        const ox = currentSeg.x + Math.cos(perpA) * obs.relX;
        const oy = currentSeg.y + Math.sin(perpA) * obs.relX;
        const dx = ox - moto.x;
        const dy = oy - moto.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < 40) {
          if (obs.type === ObstacleType.MUD || obs.type === ObstacleType.PUDDLE) {
            if (Math.random() < skill) {
              if (obs.relX > 0) steerLeft = true;
              else steerRight = true;
            }
          } else if (obs.type === ObstacleType.WASHBOARD) {
            if (Math.random() < skill) {
              brake = true;
              accel = false;
            }
          } else if (obs.type === ObstacleType.ROCK) {
            if (Math.random() < skill * 0.9) {
              if (obs.relX > 0) steerLeft = true;
              else steerRight = true;
            }
          } else if (obs.type === ObstacleType.RAMP || obs.type === ObstacleType.BUMP) {
            accel = true;
          }
        }
      }

      const nextIdx = Math.min(segIdx + 5, track.points.length - 1);
      const nextSeg = track.points[nextIdx];
      if (nextSeg) {
        const curvature = Math.abs(normalizeAngle(nextSeg.angle - currentSeg.angle));
        if (curvature > 0.03) {
          const brakeThreshold = 1.8 - skill * 0.5;
          if (moto.speed > brakeThreshold) {
            brake = true;
          }
        }
      }
    }

    if (!moto.onGround) {
      if (moto.pitch > 0.1) leanForward = true;
      if (moto.pitch < -0.15) leanBackward = true;
    }

    if (!track.isOnTrack(moto.x, moto.y)) {
      const trackDir = Math.atan2(
        currentSeg.y - moto.y,
        currentSeg.x - moto.x
      );
      const toTrackDiff = normalizeAngle(trackDir - moto.angle);
      if (toTrackDiff < 0) steerLeft = true;
      else if (toTrackDiff > 0) steerRight = true;
    }

    if (Math.random() > skill * 0.98) {
      accel = false;
    }
    if (Math.random() > skill * 0.995) {
      if (angleDiff < 0) steerRight = true;
      else steerLeft = true;
    }

    return {
      up: accel,
      down: brake,
      left: steerLeft,
      right: steerRight,
      leanForward,
      leanBackward,
      select: false,
    };
  }
}
