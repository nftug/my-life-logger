import ThemeSwitcher from '@/lib/ui/components/ThemeSwitcher'
import { A } from '@solidjs/router'
import { Icon } from 'solid-heroicons'
import { bars_3, chartBarSquare, tag } from 'solid-heroicons/solid'
import type { ParentProps } from 'solid-js'

const App = (props: ParentProps) => {
  const closeDrawer = () => {
    const drawer = document.getElementById('app-drawer') as HTMLInputElement | null
    if (drawer) {
      drawer.checked = false
    }
  }

  return (
    <div class="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex h-screen flex-col overflow-hidden bg-base-200">
        <div class="navbar sticky top-0 z-30 shrink-0 border-b border-base-300 bg-base-100">
          <div class="flex-none lg:hidden">
            <label for="app-drawer" class="btn btn-square btn-ghost" aria-label="Menu">
              <Icon path={bars_3} class="h-6 w-6" />
            </label>
          </div>

          <div class="flex-1">
            <A class="btn btn-ghost text-lg font-semibold" href="/">
              My Life Logger
            </A>
          </div>

          <div class="flex-none">
            <ThemeSwitcher />
          </div>
        </div>

        <main class="page-shell">{props.children}</main>
      </div>

      <div class="drawer-side z-20">
        <label for="app-drawer" class="drawer-overlay" aria-label="Close menu" />
        <aside class="min-h-full w-72 border-r border-base-300 bg-base-100">
          <div class="border-b border-base-300 p-4 text-lg font-semibold">Navigation</div>
          <ul class="menu w-full gap-1 p-3">
            <li>
              <A
                href="/"
                onClick={closeDrawer}
                class="gap-2"
                activeClass="menu-active font-semibold"
                end
              >
                <Icon path={chartBarSquare} class="h-4 w-4" />
                Dashboard
              </A>
            </li>
            <li>
              <A
                href="/categories"
                onClick={closeDrawer}
                class="gap-2"
                activeClass="menu-active font-semibold"
              >
                <Icon path={tag} class="h-4 w-4" />
                Categories
              </A>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  )
}

export default App
