'use client'
import { useEffect, useState } from 'react'
import { TodoItem } from '@/lib/types'
import { PORTAAL_TAKKEN, TAK_NAMEN, TAK_KLEUREN } from '@/lib/constants'

// Scoutsjaar-volgorde: september → augustus.
const MONTH_ORDER = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8]
const MAAND_KORT: Record<number, string> = {
  1: 'jan', 2: 'feb', 3: 'mrt', 4: 'apr', 5: 'mei', 6: 'jun',
  7: 'jul', 8: 'aug', 9: 'sep', 10: 'okt', 11: 'nov', 12: 'dec',
}

const TAKKEN = PORTAAL_TAKKEN as readonly string[]

export default function GroepTodoOverzicht({ onClose }: { onClose: () => void }) {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addCell, setAddCell] = useState<string | null>(null) // `${tak}-${month}`
  const [addTitle, setAddTitle] = useState('')

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/todos?all=1')
      if (res.ok) setTodos(await res.json())
      else setError('Kon to-do’s niet laden.')
      setLoading(false)
    })()
  }, [])

  function cellTodos(tak: string, month: number) {
    return todos.filter(t => t.tak === tak && t.month === month)
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

  async function add(tak: string, month: number) {
    if (!addTitle.trim()) return
    const res = await fetch('/api/admin/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: addTitle.trim(), month, tak }),
    })
    if (res.ok) {
      const created = await res.json()
      setTodos(prev => [...prev, created])
      setAddTitle('')
      setAddCell(null)
    } else {
      setError('Kon taak niet toevoegen.')
    }
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999 }} onClick={onClose} />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none', padding: 16 }}>
        <div style={{ pointerEvents: 'auto', width: '98%', maxWidth: 1280, maxHeight: '92vh', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #E8F0EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: '#1A3D2A', fontWeight: 900, fontSize: '1.25rem' }}>To-do overzicht</h3>
              <p style={{ margin: '2px 0 0', color: '#6A8A75', fontSize: '.82rem' }}>Alle taken per tak en per maand (huidig werkjaar).</p>
            </div>
            <button onClick={onClose} type="button" style={{ width: 34, height: 34, border: '1.5px solid #C2D9C9', borderRadius: 8, background: 'none', color: '#6A8A75', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
          </div>

          {error && <div style={{ margin: '12px 24px 0', background: '#fdf0f2', border: '1.5px solid #e0c0c4', color: '#B23A4D', padding: '8px 12px', borderRadius: 8, fontSize: '.82rem', fontWeight: 600 }}>{error}</div>}

          {/* Matrix */}
          <div style={{ overflow: 'auto', padding: 16 }}>
            {loading ? (
              <p style={{ color: '#6A8A75', fontSize: '.9rem', padding: 16 }}>Laden…</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: `64px repeat(${TAKKEN.length}, minmax(180px, 1fr))`, gap: 8, minWidth: 760 }}>
                {/* Header row */}
                <div />
                {TAKKEN.map(tak => (
                  <div key={tak} style={{ textAlign: 'center', fontWeight: 800, fontSize: '.82rem', color: '#1A3D2A', padding: '6px 4px', borderBottom: `3px solid ${TAK_KLEUREN[tak] ?? '#C2D9C9'}`, position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
                    {TAK_NAMEN[tak] ?? tak}
                  </div>
                ))}

                {/* Month rows */}
                {MONTH_ORDER.map(month => (
                  <FragmentRow
                    key={month}
                    month={month}
                    takken={TAKKEN}
                    cellTodos={cellTodos}
                    onToggle={toggle}
                    onRemove={remove}
                    addCell={addCell}
                    setAddCell={setAddCell}
                    addTitle={addTitle}
                    setAddTitle={setAddTitle}
                    onAdd={add}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function FragmentRow({
  month, takken, cellTodos, onToggle, onRemove, addCell, setAddCell, addTitle, setAddTitle, onAdd,
}: {
  month: number
  takken: readonly string[]
  cellTodos: (tak: string, month: number) => TodoItem[]
  onToggle: (t: TodoItem) => void
  onRemove: (id: string) => void
  addCell: string | null
  setAddCell: (v: string | null) => void
  addTitle: string
  setAddTitle: (v: string) => void
  onAdd: (tak: string, month: number) => void
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 10, fontWeight: 800, fontSize: '.78rem', color: '#6A8A75', textTransform: 'uppercase' }}>
        {MAAND_KORT[month]}
      </div>
      {takken.map(tak => {
        const cellKey = `${tak}-${month}`
        const items = cellTodos(tak, month)
        const adding = addCell === cellKey
        return (
          <div key={cellKey} style={{ border: '1px solid #E2EBE5', borderRadius: 10, background: '#FAFCFA', padding: 8, minHeight: 52, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '.8rem' }}>
                <input type="checkbox" checked={t.completed} onChange={() => onToggle(t)} style={{ marginTop: 2, cursor: 'pointer', flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0, wordBreak: 'break-word', textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#8A9A8A' : '#1A3D2A', fontWeight: t.completed ? 500 : 600 }}>{t.title}</span>
                <button onClick={() => onRemove(t.id)} title="Verwijder" style={{ background: 'none', border: 'none', color: '#B23A4D', cursor: 'pointer', fontSize: '.78rem', padding: 0, flexShrink: 0 }}>✕</button>
              </div>
            ))}

            {adding ? (
              <form onSubmit={e => { e.preventDefault(); onAdd(tak, month) }} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input
                  autoFocus
                  value={addTitle}
                  onChange={e => setAddTitle(e.target.value)}
                  placeholder="Nieuwe taak…"
                  style={{ width: '100%', padding: '4px 6px', fontSize: '.78rem', border: '1.5px solid #C2D9C9', borderRadius: 6, boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 4 }}>
                  <button type="submit" style={{ flex: 1, padding: '3px 6px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 5, fontSize: '.72rem', fontWeight: 700, cursor: 'pointer' }}>Voeg toe</button>
                  <button type="button" onClick={() => { setAddCell(null); setAddTitle('') }} style={{ padding: '3px 6px', background: 'none', border: '1px solid #C2D9C9', borderRadius: 5, fontSize: '.72rem', color: '#6A8A75', cursor: 'pointer' }}>✕</button>
                </div>
              </form>
            ) : (
              <button onClick={() => { setAddCell(cellKey); setAddTitle('') }} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#6A8A75', fontSize: '.74rem', fontWeight: 700, cursor: 'pointer', padding: '2px 0' }}>+ taak</button>
            )}
          </div>
        )
      })}
    </>
  )
}
