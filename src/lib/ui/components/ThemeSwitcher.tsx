import { Icon } from 'solid-heroicons'
import { moon, sun } from 'solid-heroicons/solid'
import { createSignal, onMount, Show } from 'solid-js'

const ThemeSwitcher = () => {
  const [theme, setTheme] = createSignal<'light' | 'dark'>('light')

  const applyTheme = (value: 'light' | 'dark') => {
    setTheme(value)
    document.documentElement.setAttribute('data-theme', value)
    localStorage.setItem('theme', value)
  }

  const toggleTheme = () => {
    applyTheme(theme() === 'light' ? 'dark' : 'light')
  }

  onMount(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved)
      return
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark ? 'dark' : 'light')
  })

  return (
    <button class="btn btn-square btn-ghost" aria-label="Toggle theme" onClick={toggleTheme}>
      <Show when={theme() === 'dark'} fallback={<Icon path={sun} class="h-5 w-5" />}>
        <Icon path={moon} class="h-5 w-5" />
      </Show>
    </button>
  )
}

export default ThemeSwitcher
