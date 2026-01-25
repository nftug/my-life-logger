<script lang="ts">
  import '@/app.css'
  import { DarkMode, Navbar, NavBrand, ThemeProvider } from 'flowbite-svelte'
  import type { Snippet } from 'svelte'

  type Props = {
    children: Snippet
  }

  let { children }: Props = $props()
</script>

<ThemeProvider>
  <Navbar
    class="px-4 py-0 bg-white dark:border-gray-700 dark:bg-gray-900"
    navContainerClass="h-16 items-center"
  >
    <NavBrand href="/" class="text-xl font-semibold">My Life Logger</NavBrand>

    <DarkMode />
  </Navbar>

  <main style="height: calc(100vh - 4rem);" class="mx-auto overflow-auto">
    {@render children()}
  </main>
</ThemeProvider>
