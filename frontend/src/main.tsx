import CategoriesPage from '@/pages/CategoriesPage'
import DashboardPage from '@/pages/DashboardPage'
import ModalProvider from '@/lib/ui/components/ModalProvider'
import ToastProvider from '@/lib/ui/components/ToastProvider'
import { Route, Router } from '@solidjs/router'
import { render } from 'solid-js/web'
import App from './App'
import './app.css'

render(
  () => (
    <ToastProvider>
      <ModalProvider>
        <Router root={App}>
          <Route path="/" component={DashboardPage} />
          <Route path="/categories" component={CategoriesPage} />
        </Router>
      </ModalProvider>
    </ToastProvider>
  ),
  document.getElementById('root')!,
)
