import { describe, it, expect } from 'vitest'
import { easings } from './animation'

describe('Easing Functions', () => {
  it('linear easing should return same value', () => {
    expect(easings.linear(0)).toBe(0)
    expect(easings.linear(0.5)).toBe(0.5)
    expect(easings.linear(1)).toBe(1)
  })

  it('easeIn easing should be slower at start', () => {
    expect(easings.easeIn(0.25)).toBeLessThan(0.25)
    expect(easings.easeIn(0.5)).toBeLessThan(0.5)
  })

  it('easeOut easing should be faster at start', () => {
    expect(easings.easeOut(0.25)).toBeGreaterThan(0.25)
    expect(easings.easeOut(0.5)).toBeGreaterThan(0.5)
  })

  it('easeInOut should maintain symmetry', () => {
    expect(easings.easeInOut(0.5)).toBe(0.5)
    expect(easings.easeInOut(0.25)).toBeLessThan(0.25)
    expect(easings.easeInOut(0.75)).toBeGreaterThan(0.75)
  })
})
