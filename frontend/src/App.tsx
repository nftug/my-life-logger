import ThemeSwitcher from '@/lib/ui/components/ThemeSwitcher'
<<<<<<< HEAD
import { Bars3Icon, CalendarDaysIcon, ClockIcon, TagIcon } from '@heroicons/react/24/solid'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { to: '/', label: '今日の記録', icon: ClockIcon, end: true },
  { to: '/history', label: '過去の記録', icon: CalendarDaysIcon, end: false },
  { to: '/categories', label: 'カテゴリ', icon: TagIcon, end: false },
]

const App = ({ children }: { children: ReactNode }) => (
  <div className="drawer lg:drawer-open">
    <input id="app-drawer" type="checkbox" className="drawer-toggle" />
    <div className="drawer-content min-h-screen bg-base-200/45">
      <div className="navbar sticky top-0 z-30 border-b border-base-200 bg-base-100/90 px-4 backdrop-blur lg:hidden">
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
      <main className="min-h-screen overflow-auto">{children}</main>
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
        <p className="mt-auto px-2 pb-2 text-xs leading-relaxed text-base-content/45">
          今日の時間を、やさしく見える化。
        </p>
      </aside>
    </div>
  </div>
)
=======
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
>>>>>>> origin/main

export default App
