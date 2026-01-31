import ThemeSwitcher from '@/lib/ui/components/ThemeSwitcher'
import { A } from '@solidjs/router'
import { Icon } from 'solid-heroicons'
import { bars_3 } from 'solid-heroicons/solid'
import type { ParentProps } from 'solid-js'

const App = (props: ParentProps) => (
  <div class="drawer">
    <input id="app-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content min-h-screen">
      <div class="navbar bg-base-100 shadow-sm">
        <div class="flex-none">
          <label for="app-drawer" class="btn btn-square btn-ghost" aria-label="Menu">
            <Icon path={bars_3} class="h-6 w-6" />
          </label>
        </div>

        <div class="flex-1">
          <A class="btn btn-ghost text-xl" href="/">
            My Life Logger
          </A>
        </div>

        <div class="flex-none">
          <ThemeSwitcher />
        </div>
      </div>

      <main class="overflow-auto" style={{ height: 'calc(100vh - 4rem)' }}>
        {props.children}
      </main>
    </div>

    <div class="drawer-side">
      <label for="app-drawer" class="drawer-overlay" aria-label="Close menu" />
      <aside class="min-h-full w-72 bg-base-200">
        <div class="p-4 text-lg font-semibold">Menu</div>
        <ul class="menu px-4 pb-6 w-full">
          <li>
            <A href="/">Home</A>
          </li>
        </ul>
      </aside>
    </div>
  </div>
)

export default App
