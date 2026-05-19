import { Theme } from './types'

export const defaultThemes: Record<string, Theme> = {
  light: {
    name: 'light',
    colors: ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E86452', '#6DC8EC', '#9270CA', '#FF9D4D', '#269A99', '#FF99C3'],
    backgroundColor: '#ffffff',
    textColor: '#333333',
    gridColor: '#e0e0e0',
    tooltipBg: 'rgba(255, 255, 255, 0.95)'
  },
  dark: {
    name: 'dark',
    colors: ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E86452', '#6DC8EC', '#9270CA', '#FF9D4D', '#269A99', '#FF99C3'],
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    gridColor: '#333355',
    tooltipBg: 'rgba(30, 30, 50, 0.95)'
  },
  vintage: {
    name: 'vintage',
    colors: ['#d87c7c', '#919e8b', '#d7ab82', '#6e7074', '#61a0a8', '#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'],
    backgroundColor: '#fef8ef',
    textColor: '#666666',
    gridColor: '#e5ddd0',
    tooltipBg: 'rgba(254, 248, 239, 0.95)'
  },
  westeros: {
    name: 'westeros',
    colors: ['#516b91', '#59c4e6', '#edafda', '#93b7e3', '#a5e7f0', '#c4c4eb', '#c9e0bb', '#f6c59a', '#f6a5aa', '#d49ed4'],
    backgroundColor: '#ffffff',
    textColor: '#516b91',
    gridColor: '#e5e9f2',
    tooltipBg: 'rgba(255, 255, 255, 0.95)'
  }
}

export function getTheme(theme: string | Theme): Theme {
  if (typeof theme === 'string') {
    return defaultThemes[theme] || defaultThemes.light
  }
  return theme
}
