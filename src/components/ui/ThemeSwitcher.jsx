import React, { useEffect, useMemo, useState } from 'react'
import './ThemeSwitcher.css'

const themes = [
  { id: 'ocean', name: 'Ocean', colors: ['#0ea5e9', '#0369a1'] },
  { id: 'sunset', name: 'Sunset', colors: ['#f59e0b', '#ef4444'] },
  { id: 'forest', name: 'Forest', colors: ['#22c55e', '#14532d'] },
  { id: 'midnight', name: 'Midnight', colors: ['#0f172a', '#1e293b'] },
  { id: 'orchid', name: 'Orchid', colors: ['#a855f7', '#6b21a8'] },
  { id: 'solar', name: 'Solar', colors: ['#fbbf24', '#f59e0b'] },
  { id: 'slate', name: 'Slate', colors: ['#64748b', '#334155'] },
]

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('tf_theme') || 'ocean')

  const applyTheme = useMemo(() => (id) => {
    document.body.classList.remove(
      ...themes.map(t => `theme-${t.id}`)
    )
    document.body.classList.add(`theme-${id}`)
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  const handlePick = (id) => {
    setTheme(id)
    localStorage.setItem('tf_theme', id)
    setOpen(false)
  }

  return (
    <div className="theme-switcher" style={{ position: 'fixed', bottom: '20px', right: '160px', zIndex: 1001 }}>
      <button
        className="theme-trigger"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        title="Change theme"
      >
        🎨 Theme
      </button>
      {open && (
        <div className="theme-popover" role="menu">
          <div className="theme-grid">
            {themes.map((t) => (
              <button
                key={t.id}
                className={`theme-item ${theme === t.id ? 'active' : ''}`}
                onClick={() => handlePick(t.id)}
                role="menuitemradio"
                aria-checked={theme === t.id}
                title={t.name}
              >
                <span className="theme-swatch" style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }} />
                <span className="theme-name">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
