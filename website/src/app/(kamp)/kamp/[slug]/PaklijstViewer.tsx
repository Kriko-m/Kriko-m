'use client'
import { useState, useEffect } from 'react'

interface PaklijstCategorie {
  categorie: string
  items: string[]
}

export default function PaklijstViewer({ paklijst, slug }: { paklijst: PaklijstCategorie[]; slug: string }) {
  const totalItems = paklijst.reduce((sum, cat) => sum + cat.items.length, 0)
  // Per kamp gescheiden opslag — anders lekken afvinkstatussen tussen kampen
  // (en kon de voortgang >100% worden).
  const storageKey = `paklijst-checked-${slug}`

  const [expanded, setExpanded] = useState<Record<number, boolean>>(
    () => Object.fromEntries(paklijst.map((_, i) => [i, i === 0]))
  )
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) setChecked(JSON.parse(stored))
    } catch {}
  }, [storageKey])

  function toggleCheck(key: string) {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function toggleExpand(idx: number) {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const totalChecked = Object.values(checked).filter(Boolean).length
  const pct = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {mounted ? `${totalChecked} / ${totalItems} ingepakt` : `0 / ${totalItems} ingepakt`}
          </span>
          <span style={{
            fontSize: '.8rem', fontWeight: 700,
            color: pct === 100 ? 'var(--color-success)' : 'var(--color-text-muted)',
          }}>
            {mounted && pct === 100 ? '✓ Klaar om te vertrekken!' : `${mounted ? pct : 0}%`}
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: mounted ? `${pct}%` : '0%',
            background: pct === 100 ? 'var(--color-success)' : 'var(--color-primary)',
            transition: 'width .4s ease',
          }} />
        </div>
      </div>

      {/* Category list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {paklijst.map((cat, ci) => {
          const catChecked = cat.items.filter((_, ii) => checked[`${ci}-${ii}`]).length
          const allDone = catChecked === cat.items.length && cat.items.length > 0
          const isOpen = expanded[ci]

          return (
            <div key={ci} style={{
              border: `1px solid ${allDone ? 'hsl(145,40%,75%)' : 'var(--color-border)'}`,
              borderRadius: 'var(--border-radius-sm)',
              overflow: 'hidden',
              transition: 'border-color .2s',
            }}>
              <button
                type="button"
                onClick={() => toggleExpand(ci)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 16px',
                  background: allDone ? 'hsl(145,40%,96%)' : 'var(--color-bg-linen)',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  transition: 'background .2s',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '.65rem', opacity: .6 }}>{isOpen ? '▼' : '▶'}</span>
                  {cat.categorie}
                </span>
                <span style={{
                  fontSize: '.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 12,
                  background: allDone ? 'hsl(145,50%,88%)' : 'var(--color-bg-white)',
                  color: allDone ? 'hsl(145,55%,30%)' : 'var(--color-text-muted)',
                  border: `1px solid ${allDone ? 'hsl(145,40%,75%)' : 'var(--color-border)'}`,
                  transition: 'all .2s',
                }}>
                  {allDone ? '✓ klaar' : `${catChecked}/${cat.items.length}`}
                </span>
              </button>

              {isOpen && (
                <div style={{ padding: '10px 16px 14px', background: 'var(--color-bg-white)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cat.items.map((item, ii) => {
                    const key = `${ci}-${ii}`
                    const isChecked = !!checked[key]
                    return (
                      <label key={ii} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheck(key)}
                          style={{ width: 17, height: 17, accentColor: 'var(--color-primary)', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <span style={{
                          fontSize: '.88rem',
                          color: isChecked ? 'var(--color-text-muted)' : 'var(--color-text-dark)',
                          textDecoration: isChecked ? 'line-through' : 'none',
                        }}>
                          {item}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {mounted && totalChecked > 0 && (
        <button
          type="button"
          onClick={() => {
            setChecked({})
            try { localStorage.removeItem(storageKey) } catch {}
          }}
          style={{ marginTop: 14, fontSize: '.78rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontFamily: 'inherit' }}
        >
          Alles uitvinken
        </button>
      )}
    </div>
  )
}
