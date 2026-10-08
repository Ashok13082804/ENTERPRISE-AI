import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const applyThemeToDOM = (theme: Theme) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
}

// Determine initial theme
let initialTheme: Theme = 'dark'
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('enterprise-theme')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed?.state?.theme) {
        initialTheme = parsed.state.theme
      }
    }
  } catch (e) {
    initialTheme = 'dark'
  }
  applyThemeToDOM(initialTheme)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: initialTheme,
      isDark: initialTheme === 'dark',
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
          applyThemeToDOM(nextTheme)
          return { theme: nextTheme, isDark: nextTheme === 'dark' }
        }),
      setTheme: (theme: Theme) => {
        applyThemeToDOM(theme)
        set({ theme, isDark: theme === 'dark' })
      },
    }),
    {
      name: 'enterprise-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyThemeToDOM(state.theme)
        }
      },
    }
  )
)
