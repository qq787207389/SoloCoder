import { describe, it, expect } from 'vitest'
import { defaultThemes, getTheme } from './themes'

describe('Themes', () => {
  it('should have default themes', () => {
    expect(defaultThemes.light).toBeDefined()
    expect(defaultThemes.dark).toBeDefined()
    expect(defaultThemes.vintage).toBeDefined()
    expect(defaultThemes.westeros).toBeDefined()
  })

  it('each theme should have required properties', () => {
    Object.values(defaultThemes).forEach(theme => {
      expect(theme.name).toBeDefined()
      expect(Array.isArray(theme.colors)).toBe(true)
      expect(theme.colors.length).toBeGreaterThan(0)
      expect(theme.backgroundColor).toBeDefined()
      expect(theme.textColor).toBeDefined()
      expect(theme.gridColor).toBeDefined()
      expect(theme.tooltipBg).toBeDefined()
    })
  })

  it('getTheme should return theme by name', () => {
    const theme = getTheme('dark')
    expect(theme.name).toBe('dark')
  })

  it('getTheme should return light theme for unknown name', () => {
    const theme = getTheme('unknown')
    expect(theme.name).toBe('light')
  })

  it('getTheme should return custom theme object', () => {
    const customTheme = {
      name: 'custom',
      colors: ['#ff0000', '#00ff00'],
      backgroundColor: '#ffffff',
      textColor: '#000000',
      gridColor: '#cccccc',
      tooltipBg: 'rgba(0,0,0,0.8)'
    }
    const theme = getTheme(customTheme)
    expect(theme.name).toBe('custom')
    expect(theme.colors).toEqual(customTheme.colors)
  })
})
