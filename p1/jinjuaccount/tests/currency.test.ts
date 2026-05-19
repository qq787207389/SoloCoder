import { describe, it, expect } from 'vitest'

describe('Currency Converter', () => {
  const mockRates = {
    CNY: 1,
    USD: 0.14,
    EUR: 0.13,
    JPY: 21.5,
  }

  function convert(amount: number, from: string, to: string): number {
    const inBase = amount / mockRates[from as keyof typeof mockRates]
    return inBase * mockRates[to as keyof typeof mockRates]
  }

  it('should convert CNY to USD correctly', () => {
    const result = convert(100, 'CNY', 'USD')
    expect(result).toBeCloseTo(14, 5)
  })

  it('should convert CNY to EUR correctly', () => {
    const result = convert(100, 'CNY', 'EUR')
    expect(result).toBeCloseTo(13, 5)
  })

  it('should convert USD to CNY correctly', () => {
    const result = convert(14, 'USD', 'CNY')
    expect(result).toBeCloseTo(100, 5)
  })

  it('should convert JPY to CNY correctly', () => {
    const result = convert(2150, 'JPY', 'CNY')
    expect(result).toBeCloseTo(100, 5)
  })

  it('should return same amount for same currency', () => {
    const result = convert(100, 'CNY', 'CNY')
    expect(result).toBe(100)
  })

  it('should handle zero amount correctly', () => {
    const result = convert(0, 'CNY', 'USD')
    expect(result).toBe(0)
  })

  it('should handle decimal amounts correctly', () => {
    const result = convert(99.99, 'CNY', 'USD')
    expect(result).toBeCloseTo(13.9986, 4)
  })
})

describe('Budget Calculation', () => {
  function checkBudgetWarning(spent: number, budget: number, threshold: number): boolean {
    return spent / budget >= threshold / 100
  }

  function getBudgetPercentage(spent: number, budget: number): number {
    return (spent / budget) * 100
  }

  it('should detect budget over threshold (80%)', () => {
    expect(checkBudgetWarning(85, 100, 80)).toBe(true)
    expect(checkBudgetWarning(75, 100, 80)).toBe(false)
  })

  it('should detect budget exactly at threshold', () => {
    expect(checkBudgetWarning(80, 100, 80)).toBe(true)
  })

  it('should calculate percentage correctly', () => {
    expect(getBudgetPercentage(50, 100)).toBe(50)
    expect(getBudgetPercentage(75, 100)).toBe(75)
    expect(getBudgetPercentage(100, 100)).toBe(100)
    expect(getBudgetPercentage(120, 100)).toBe(120)
  })

  it('should handle zero budget gracefully', () => {
    expect(() => getBudgetPercentage(50, 0)).toThrow()
  })
})
