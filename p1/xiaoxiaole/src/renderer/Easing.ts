export type EasingFunction = (t: number) => number

export const Easing = {
  linear: (t: number): number => t,
  
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => 
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number => 
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  easeInBounce: (t: number): number => 1 - Easing.easeOutBounce(1 - t),
  easeOutBounce: (t: number): number => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  },
  
  easeInElastic: (t: number): number => 
    t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3),
  easeOutElastic: (t: number): number => 
    t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1
}

export interface Animation {
  startValue: number
  endValue: number
  startTime: number
  duration: number
  easing: EasingFunction
  onUpdate?: (value: number) => void
  onComplete?: () => void
}

export class AnimationManager {
  private animations: Map<string, Animation> = new Map()

  animate(
    key: string,
    startValue: number,
    endValue: number,
    duration: number,
    easing: EasingFunction = Easing.easeOutCubic,
    onUpdate?: (value: number) => void,
    onComplete?: () => void
  ): void {
    this.animations.set(key, {
      startValue,
      endValue,
      startTime: performance.now(),
      duration,
      easing,
      onUpdate,
      onComplete
    })
  }

  update(): void {
    const now = performance.now()
    const completed: string[] = []

    for (const [key, anim] of this.animations.entries()) {
      const elapsed = now - anim.startTime
      const progress = Math.min(elapsed / anim.duration, 1)
      const easedProgress = anim.easing(progress)
      const currentValue = anim.startValue + (anim.endValue - anim.startValue) * easedProgress

      if (anim.onUpdate) {
        anim.onUpdate(currentValue)
      }

      if (progress >= 1) {
        completed.push(key)
        if (anim.onComplete) {
          anim.onComplete()
        }
      }
    }

    for (const key of completed) {
      this.animations.delete(key)
    }
  }

  isAnimating(key?: string): boolean {
    if (key) {
      return this.animations.has(key)
    }
    return this.animations.size > 0
  }

  clear(): void {
    this.animations.clear()
  }
}
