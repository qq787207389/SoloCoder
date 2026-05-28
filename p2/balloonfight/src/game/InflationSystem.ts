import { GameConfig } from '@/config/GameConfig';

export class InflationSystem {
  current: number;
  max: number;
  drainRate: number;
  recoverRate: number;
  isCoolingDown: boolean;
  cooldownTimer: number;
  baseRecoverRate: number;

  constructor(max: number = 100) {
    this.max = max;
    this.current = max;
    this.drainRate = GameConfig.INFLATION_DRAIN_RATE;
    this.baseRecoverRate = GameConfig.INFLATION_RECOVER_RATE;
    this.recoverRate = this.baseRecoverRate;
    this.isCoolingDown = false;
    this.cooldownTimer = 0;
  }

  drain(amount: number): boolean {
    if (this.isCoolingDown) return false;
    if (this.current < amount) {
      this.current = 0;
      this.isCoolingDown = true;
      this.cooldownTimer = GameConfig.INFLATION_COOLDOWN;
      return false;
    }
    this.current -= amount;
    if (this.current <= 0) {
      this.current = 0;
      this.isCoolingDown = true;
      this.cooldownTimer = GameConfig.INFLATION_COOLDOWN;
    }
    return true;
  }

  recover(delta: number): void {
    if (this.isCoolingDown) {
      this.cooldownTimer -= delta;
      if (this.cooldownTimer <= 0) {
        this.isCoolingDown = false;
        this.current = this.max * 0.3;
      }
      return;
    }
    this.current = Math.min(this.max, this.current + this.recoverRate * (delta / 1000));
  }

  refill(): void {
    this.current = this.max;
    this.isCoolingDown = false;
    this.cooldownTimer = 0;
  }

  canInflate(): boolean {
    return !this.isCoolingDown && this.current > 0;
  }

  getPercentage(): number {
    return this.current / this.max;
  }

  setRecoverRateMultiplier(multiplier: number): void {
    this.recoverRate = this.baseRecoverRate * multiplier;
  }

  resetRecoverRate(): void {
    this.recoverRate = this.baseRecoverRate;
  }

  reset(): void {
    this.current = this.max;
    this.isCoolingDown = false;
    this.cooldownTimer = 0;
    this.recoverRate = this.baseRecoverRate;
  }
}
