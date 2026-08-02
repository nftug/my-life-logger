import ThemeSwitcher from '@/lib/ui/components/ThemeSwitcher'
import { CurrentDateSync } from '@/lib/state/currentDate'
import { Bars3Icon, CalendarDaysIcon, ClockIcon, TagIcon } from '@heroicons/react/24/solid'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { to: '/', label: '今日の記録', icon: ClockIcon, end: true },
  { to: '/history', label: '過去の記録', icon: CalendarDaysIcon, end: false },
  { to: '/categories', label: 'カテゴリ', icon: TagIcon, end: false },
]

const App = ({ children }: { children: ReactNode }) => (
  <>
    <CurrentDateSync />
    <div className="drawer h-dvh lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex h-dvh min-h-0 flex-col bg-base-200/45">
        <div className="navbar sticky top-0 z-30 shrink-0 border-b border-base-200 bg-base-100/90 px-4 backdrop-blur lg:hidden">
          <label
            htmlFor="app-drawer"
            className="btn btn-square btn-ghost"
            aria-label="メニューを開く"
          >
            <Bars3Icon className="h-6 w-6" />
          </label>
          <span className="ml-2 flex-1 text-lg font-semibold">My Life Logger</span>
          <ThemeSwitcher />
        </div>
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
      <div className="drawer-side z-40">
        <label htmlFor="app-drawer" className="drawer-overlay" aria-label="メニューを閉じる" />
        <aside className="flex min-h-full w-64 flex-col border-r border-base-200 bg-base-100 p-4">
          <div className="mb-8 flex items-center justify-between px-2 pt-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                LIFE LOG
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">My Life Logger</h1>
            </div>
            <ThemeSwitcher />
          </div>
          <nav aria-label="メインメニュー">
            <ul className="menu gap-1 p-0">
              {navigation.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) => (isActive ? 'active font-medium' : '')}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  </>
)

export default App
