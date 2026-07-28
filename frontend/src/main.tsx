<<<<<<< HEAD
import { Dialog } from '@/lib/ui/components/Dialog'
import CategoriesPage from '@/pages/CategoriesPage'
import HistoryPage from '@/pages/HistoryPage'
import IndexPage from '@/pages/IndexPage'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import './app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<IndexPage />} />
        </Routes>
      </App>
    </BrowserRouter>
    <Dialog.Root />
  </StrictMode>,
=======
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
>>>>>>> origin/main
)
