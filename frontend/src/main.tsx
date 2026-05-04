import IndexPage from '@/pages/IndexPage'
import { Dialog } from '@/lib/ui/components/Dialog'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import './app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App><IndexPage /></App>} />
      </Routes>
    </BrowserRouter>
    <Dialog.Root />
  </StrictMode>,
)
