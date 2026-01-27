<script lang="ts">
  import '@/app.css'
  import ThemeSwitcher from '@/lib/ui/components/ThemeSwitcher.svelte'
  import type { Snippet } from 'svelte'
  import { Menu } from 'svelte-heros'

  type Props = {
    children: Snippet
  }

  let { children }: Props = $props()
</script>

<div class="drawer">
  <input id="app-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content flex min-h-screen flex-col">
    <div class="navbar bg-base-100 shadow-sm">
      <div class="flex-none">
        <label for="app-drawer" class="btn btn-square btn-ghost" aria-label="Menu">
          <Menu />
        </label>
      </div>

      <div class="flex-1">
        <a class="btn btn-ghost text-xl" href="/">My Life Logger</a>
      </div>

      <div class="flex-none">
        <ThemeSwitcher />
      </div>
    </div>

    <main class="flex-1 overflow-auto">
      {@render children()}
    </main>
  </div>

  <div class="drawer-side">
    <label for="app-drawer" class="drawer-overlay" aria-label="Close menu"></label>
    <aside class="min-h-full w-72 bg-base-200">
      <div class="p-4 text-lg font-semibold">Menu</div>
      <ul class="menu px-4 pb-6 w-full">
        <li><a href="/">Home</a></li>
      </ul>
    </aside>
  </div>
</div>
