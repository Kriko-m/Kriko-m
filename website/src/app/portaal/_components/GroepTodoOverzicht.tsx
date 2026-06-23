'use client'
import { useEffect, useState } from 'react'
import { TodoItem } from '@/lib/types'
import { PORTAAL_TAKKEN, TAK_NAMEN, TAK_KLEUREN } from '@/lib/constants'

const MONTH_ORDER = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8]
const MAANDEN: Record<number, string> = {
  1: 'januari', 2: 'februari', 3: 'maart', 4: 'april', 5: 'mei', 6: 'juni',
  7: 'juli', 8: 'augustus', 9: 'september', 10: 'oktober', 11: 'november', 12: 'december',
}

const TAKKEN = PORTAAL_TAKKEN as readonly string[]

export default function GroepTodoOverzicht({ onClose }: { onClose: () => void }) {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTak, setActiveTak] = useState<string>(TAKKEN[0])
  const [addingMonth, setAddingMonth] = useState<number | null>(null)
  const [addTitle, setAddTitle] = useState('')
  const [multiMonths, setMultiMonths] = useState<number[]>([])
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/todos?all=1')
      if (res.ok) setTodos(await res.json())
      else setError('Kon to-do\'s niet laden.')
      setLoading(false)
    })()
  }, [])

  function takTodos(tak: string, month: number) {
    return todos.filter(t => t.tak === tak && t.month === month).sort((a, b) => a.title.localeCompare(b.title))
  }

  async function toggle(t: TodoItem) {
    const res = await fetch(`/api/admin/todos/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !t.completed }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTodos(prev => prev.map(x => x.id === t.id ? updated : x))
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/todos/${id}`, { method: 'DELETE' })
    if (res.ok) setTodos(prev => prev.filter(x => x.id !== id))
  }

  async function add() {
    if (!addTitle.trim()) return
    const monthsToAdd = multiMonths.length > 0 ? multiMonths : (addingMonth ? [addingMonth] : [])
    if (monthsToAdd.length === 0) return

    try {
      for (const month of monthsToAdd) {
        const res = await fetch('/api/admin/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: addTitle.trim(), month, tak: activeTak }),
        })
        if (res.ok) {
          const created = await res.json()
          setTodos(prev => [...prev, created])
        }
      }
      setAddTitle('')
      setAddingMonth(null)
      setMultiMonths([])
    } catch {
      setError('Kon taak niet toevoegen.')
    }
  }

  async function resetAll() {
    const takTodosToDelete = todos.filter(t => t.tak === activeTak)
    if (takTodosToDelete.length === 0) {
      setShowResetConfirm(false)
      return
    }

    try {
      for (const t of takTodosToDelete) {
        await fetch(`/api/admin/todos/${t.id}`, { method: 'DELETE' })
      }
      setTodos(prev => prev.filter(t => t.tak !== activeTak))
      setShowResetConfirm(false)
    } catch {
      setError('Kon taken niet verwijderen.')
    }
  }

  const takColor = TAK_KLEUREN[activeTak] ?? '#1A3D2A'

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={onClose} />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none', padding: 12 }}>
        <div style={{ pointerEvents: 'auto', width: '99%', maxWidth: '1150px', maxHeight: '95vh', background: '#fff', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '18px 24px', borderBottom: '2px solid #E8F0EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: '#1A3D2A', fontWeight: 900, fontSize: '1.25rem' }}>To-do Beheerder</h3>
              <p style={{ margin: '3px 0 0', color: '#6A8A75', fontSize: '.8rem' }}>Beheer en voeg taken toe per tak en maand</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setShowResetConfirm(true)} type="button" style={{ padding: '8px 12px', border: '1.5px solid #B23A4D', borderRadius: 8, background: 'none', color: '#B23A4D', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer' }}>Reset alles</button>
              <button onClick={onClose} type="button" style={{ width: 36, height: 36, border: 'none', borderRadius: 10, background: '#F0ECE4', color: '#1A3D2A', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          </div>

          {error && <div style={{ margin: '10px 24px 0', background: '#fdf0f2', border: '1.5px solid #e0c0c4', color: '#B23A4D', padding: '10px 14px', borderRadius: 10, fontSize: '.8rem', fontWeight: 600 }}>{error}</div>}

          {/* Content */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Tak Sidebar */}
            <div style={{ width: 165, borderRight: '2px solid #E8F0EB', overflowY: 'auto', padding: 10, background: '#FAFCFA', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TAKKEN.map(tak => (
                <button
                  key={tak}
                  onClick={() => { setActiveTak(tak); setAddingMonth(null); setMultiMonths([]); setAddTitle('') }}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    border: activeTak === tak ? `2.5px solid ${takColor}` : '2px solid transparent',
                    background: activeTak === tak ? '#EEF5F1' : 'transparent',
                    borderRadius: 10,
                    fontSize: '.85rem',
                    fontWeight: activeTak === tak ? 700 : 600,
                    color: activeTak === tak ? takColor : '#6A8A75',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  {TAK_NAMEN[tak] ?? tak}
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#6A8A75' }}>Laden…</div>
              ) : (
                <>
                  {/* Tak Header */}
                  <div style={{ padding: '14px 20px', borderBottom: `3px solid ${takColor}`, background: '#fff' }}>
                    <h4 style={{ margin: 0, color: takColor, fontSize: '1.05rem', fontWeight: 800 }}>{TAK_NAMEN[activeTak] ?? activeTak}</h4>
                  </div>

                  {/* Months Grid */}
                  <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                      {MONTH_ORDER.map(month => {
                        const items = takTodos(activeTak, month)
                        const isAdding = addingMonth === month
                        const count = items.length

                        return (
                          <div key={month} style={{ border: '1.5px solid #E2EBE5', borderRadius: 12, background: '#FAFCFA', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div>
                              <h5 style={{ margin: 0, color: '#1A3D2A', fontSize: '.95rem', fontWeight: 800 }}>{MAANDEN[month]}</h5>
                            </div>

                            {/* Todo Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {items.length === 0 && !isAdding && (
                                <p style={{ color: '#8A9A8A', fontSize: '.8rem', margin: 0 }}>Geen taken</p>
                              )}
                              {items.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: '#fff', borderRadius: 8, border: '1px solid #E8F0EB' }}>
                                  <input
                                    type="checkbox"
                                    checked={t.completed}
                                    onChange={() => toggle(t)}
                                    style={{ marginTop: 2, cursor: 'pointer', width: 16, height: 16, flexShrink: 0 }}
                                  />
                                  <span style={{ flex: 1, fontSize: '.82rem', textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#8A9A8A' : '#1A3D2A', fontWeight: t.completed ? 500 : 600, lineHeight: 1.35 }}>
                                    {t.title}
                                  </span>
                                  <button
                                    onClick={() => remove(t.id)}
                                    style={{ background: 'none', border: 'none', color: '#B23A4D', cursor: 'pointer', fontSize: '.75rem', padding: 2, flexShrink: 0 }}
                                    title="Verwijder"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add Form */}
                            {isAdding ? (
                              <form onSubmit={e => { e.preventDefault(); add() }} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8, borderTop: '1px solid #E8F0EB' }}>
                                <input
                                  autoFocus
                                  value={addTitle}
                                  onChange={e => setAddTitle(e.target.value)}
                                  placeholder="Taak toevoegen…"
                                  style={{ width: '100%', padding: '8px 10px', fontSize: '.82rem', border: '1.5px solid #C2D9C9', borderRadius: 8, boxSizing: 'border-box' }}
                                />
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button type="submit" style={{ flex: 1, padding: '6px 10px', background: takColor, color: '#fff', border: 'none', borderRadius: 6, fontSize: '.8rem', fontWeight: 700, cursor: 'pointer' }}>
                                    Voeg toe
                                  </button>
                                  <button type="button" onClick={() => { setAddingMonth(null); setAddTitle(''); setMultiMonths([]) }} style={{ padding: '6px 10px', background: 'none', border: '1px solid #C2D9C9', borderRadius: 6, fontSize: '.8rem', color: '#6A8A75', cursor: 'pointer' }}>
                                    ✕
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <button
                                onClick={() => { setAddingMonth(month); setAddTitle(''); setMultiMonths([]) }}
                                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: takColor, fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', padding: '4px 0' }}
                              >
                                + toevoegen
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Multi-Month Tool */}
                  <div style={{ padding: '14px 20px', borderTop: '2px solid #E8F0EB', background: '#EEF5F133' }}>
                    <details style={{ cursor: 'pointer' }}>
                      <summary style={{ color: '#1A3D2A', fontWeight: 700, fontSize: '.85rem', userSelect: 'none', marginBottom: 8 }}>
                        💡 Voeg toe aan meerdere maanden
                      </summary>
                      <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input
                          type="text"
                          placeholder="Voer taaknaam in…"
                          value={addTitle}
                          onChange={e => setAddTitle(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', fontSize: '.82rem', border: '1.5px solid #C2D9C9', borderRadius: 8, boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {MONTH_ORDER.map(month => (
                            <label key={month} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px', background: multiMonths.includes(month) ? takColor : '#fff', border: `1.5px solid ${multiMonths.includes(month) ? takColor : '#C2D9C9'}`, borderRadius: 8, color: multiMonths.includes(month) ? '#fff' : '#1A3D2A', fontSize: '.8rem', fontWeight: 600 }}>
                              <input
                                type="checkbox"
                                checked={multiMonths.includes(month)}
                                onChange={e => {
                                  if (e.target.checked) setMultiMonths([...multiMonths, month])
                                  else setMultiMonths(multiMonths.filter(m => m !== month))
                                }}
                                style={{ width: 14, height: 14, cursor: 'pointer' }}
                              />
                              {MAANDEN[month].slice(0, 3)}
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            if (multiMonths.length > 0) {
                              setAddingMonth(null)
                              add()
                            }
                          }}
                          disabled={multiMonths.length === 0 || !addTitle.trim()}
                          style={{ padding: '8px 16px', background: multiMonths.length > 0 && addTitle.trim() ? takColor : '#C2D9C9', color: '#fff', border: 'none', borderRadius: 8, fontSize: '.82rem', fontWeight: 700, cursor: multiMonths.length > 0 && addTitle.trim() ? 'pointer' : 'not-allowed', opacity: multiMonths.length > 0 && addTitle.trim() ? 1 : 0.6 }}
                        >
                          {multiMonths.length > 0 ? `Voeg toe aan ${multiMonths.length} maand${multiMonths.length > 1 ? 'en' : ''}` : 'Selecteer maanden'}
                        </button>
                      </div>
                    </details>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001 }} onClick={() => setShowResetConfirm(false)} />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, pointerEvents: 'none', padding: 16 }}>
            <div style={{ pointerEvents: 'auto', background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: 400 }}>
              <h3 style={{ margin: '0 0 8px', color: '#1A3D2A', fontSize: '1.1rem', fontWeight: 800 }}>Alles verwijderen?</h3>
              <p style={{ margin: '0 0 20px', color: '#6A8A75', fontSize: '.85rem', lineHeight: 1.4 }}>Dit zal alle taken voor <strong>{TAK_NAMEN[activeTak] ?? activeTak}</strong> verwijderen. Dit kan niet ongedaan gemaakt worden.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowResetConfirm(false)} type="button" style={{ padding: '8px 16px', border: '1.5px solid #C2D9C9', borderRadius: 8, background: 'none', color: '#6A8A75', fontSize: '.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Annuleer</button>
                <button onClick={resetAll} type="button" style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#B23A4D', color: '#fff', fontSize: '.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Ja, verwijder alles</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
