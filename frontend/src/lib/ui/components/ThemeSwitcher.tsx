import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import { useEffect, useState } from 'react'

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const applyTheme = (value: 'light' | 'dark') => {
    setTheme(value)
    document.documentElement.setAttribute('data-theme', value)
    localStorage.setItem('theme', value)
  }

  const toggleTheme = () => {
    applyTheme(theme === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved)
      return
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark ? 'dark' : 'light')
  }, [])

  return (
    <button className="btn btn-square btn-ghost" aria-label="Toggle theme" onClick={toggleTheme}>
      {theme === 'dark' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
    </button>
  )
}

export default ThemeSwitcher
