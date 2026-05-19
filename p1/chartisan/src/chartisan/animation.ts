export type EasingFunction = (t: number) => number

export const easings: Record<string, EasingFunction> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export interface AnimationController {
  start: (duration: number, easing: string, onUpdate: (progress: number) => void, onComplete?: () => void) => void
  stop: () => void
  isRunning: () => boolean
}

export function createAnimationController(): AnimationController {
  let animationId: number | null = null
  let startTime: number | null = null

  return {
    start(duration, easing, onUpdate, onComplete) {
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
      }

      const easingFn = easings[easing] || easings.linear

      const animate = (timestamp: number) => {
        if (startTime === null) {
          startTime = timestamp
        }

        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easingFn(progress)

        onUpdate(easedProgress)

        if (progress < 1) {
          animationId = requestAnimationFrame(animate)
        } else {
          animationId = null
          startTime = null
          onComplete?.()
        }
      }

      animationId = requestAnimationFrame(animate)
    },

    stop() {
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
      startTime = null
    },

    isRunning() {
      return animationId !== null
    }
  }
}
