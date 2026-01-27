<script lang="ts">
  import { onMount } from 'svelte'
  import { Moon, Sun } from 'svelte-heros'

  let theme: 'light' | 'dark' = $state('light')

  const applyTheme = (value: 'light' | 'dark') => {
    theme = value
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', value)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', value)
    }
  }

  const toggleTheme = () => {
    applyTheme(theme === 'light' ? 'dark' : 'light')
  }

  onMount(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved)
      return
    }
    const prefersDark =
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark ? 'dark' : 'light')
  })
</script>

<button class="btn btn-square btn-ghost" aria-label="Toggle theme" onclick={toggleTheme}>
  {#if theme === 'dark'}
    <Moon />
  {:else}
    <Sun />
  {/if}
</button>
