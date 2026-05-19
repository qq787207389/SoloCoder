import { ref, watch, onMounted } from 'vue'

export type Theme = 'light' | 'dark'
export type FontSize = 'small' | 'medium' | 'large'

export function useTheme() {
  const theme = ref<Theme>('light')
  const fontSize = ref<FontSize>('medium')

  function applyTheme(newTheme: Theme) {
    theme.value = newTheme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }

  function applyFontSize(size: FontSize) {
    fontSize.value = size
    const root = document.documentElement
    root.style.setProperty('--font-size-base', size === 'small' ? '14px' : size === 'large' ? '18px' : '16px')
    localStorage.setItem('fontSize', size)
  }

  function toggleTheme() {
    applyTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      applyTheme(savedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark')
    }

    const savedFontSize = localStorage.getItem('fontSize') as FontSize | null
    if (savedFontSize) {
      applyFontSize(savedFontSize)
    }
  })

  return {
    theme,
    fontSize,
    applyTheme,
    applyFontSize,
    toggleTheme,
  }
}
