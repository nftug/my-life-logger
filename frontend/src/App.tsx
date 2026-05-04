import ThemeSwitcher from '@/lib/ui/components/ThemeSwitcher'
import { Bars3Icon } from '@heroicons/react/24/solid'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const App = ({ children }: { children: ReactNode }) => (
  <div className="drawer">
    <input id="app-drawer" type="checkbox" className="drawer-toggle" />
    <div className="drawer-content min-h-screen">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-none">
          <label htmlFor="app-drawer" className="btn btn-square btn-ghost" aria-label="Menu">
            <Bars3Icon className="h-6 w-6" />
          </label>
        </div>

        <div className="flex-1">
          <Link className="btn btn-ghost text-xl" to="/">
            My Life Logger
          </Link>
        </div>

        <div className="flex-none">
          <ThemeSwitcher />
        </div>
      </div>

      <main className="overflow-auto" style={{ height: 'calc(100vh - 4rem)' }}>
        {children}
      </main>
    </div>

    <div className="drawer-side">
      <label htmlFor="app-drawer" className="drawer-overlay" aria-label="Close menu" />
      <aside className="min-h-full w-72 bg-base-200">
        <div className="p-4 text-lg font-semibold">Menu</div>
        <ul className="menu px-4 pb-6 w-full">
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </aside>
    </div>
  </div>
)

export default App
