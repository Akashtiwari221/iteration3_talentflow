import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

if (typeof document !== 'undefined') {
  const rootEl = document.getElementById('root')
  if (!rootEl) throw new Error("Root element with id 'root' not found")
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Starting MSW in development mode...')
    const { worker } = require('./mocks/browser.jsx')
    if (worker && worker.start) {
      worker.start({ 
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      }).then(() => {
        console.log('✅ MSW started successfully')
      }).catch((error) => {
        console.error('❌ MSW failed to start:', error)
      })
    } else {
      console.error('❌ MSW worker not found')
    }
  }

  createRoot(rootEl).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}