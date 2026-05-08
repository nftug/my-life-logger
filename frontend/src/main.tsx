import { Dialog } from '@/lib/ui/components/Dialog'
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
        </Routes>
      </App>
    </BrowserRouter>
    <Dialog.Root />
  </StrictMode>,
)
