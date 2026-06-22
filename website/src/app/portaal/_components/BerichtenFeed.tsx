'use client'

import { useState } from 'react'
import { LeidingBericht } from '@/lib/types'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'zonet'
  if (min < 60) return `${min} min geleden`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} uur geleden`
  const days = Math.floor(hr / 24)
  if (days === 1) return 'gisteren'
  if (days < 7) return `${days} dagen geleden`
  return new Date(dateStr).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
}

function Avatar({ naam }: { naam: string }) {
  const initial = naam.trim().charAt(0).toUpperCase()
  return (
    <div style={{
      width: 38,
      height: 38,
      borderRadius: '50%',
      background: '#1A3D2A',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: '.95rem',
      flexShrink: 0,
      fontFamily: 'var(--font-outfit), sans-serif',
    }}>
      {initial}
    </div>
  )
}

interface Props {
  initialBerichten: LeidingBericht[]
  canPost: boolean
  authorNaam: string
}

export default function BerichtenFeed({ initialBerichten, canPost, authorNaam }: Props) {
  const [berichten, setBerichten] = useState<LeidingBericht[]>(initialBerichten)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    setPosting(true)
    setError('')
    const res = await fetch('/api/admin/berichten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: draft.trim() }),
    })
    if (res.ok) {
      const created: LeidingBericht = await res.json()
      setBerichten(prev => [created, ...prev])
      setDraft('')
    } else {
      setError('Kon bericht niet plaatsen.')
    }
    setPosting(false)
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/berichten/${id}`, { method: 'DELETE' })
    if (res.ok) setBerichten(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Compose box — groepsleiding only */}
      {canPost && (
        <form onSubmit={handlePost} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Avatar naam={authorNaam} />
            <div style={{ flex: 1 }}>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Schrijf een bericht voor de leiding..."
                rows={draft ? 3 : 1}
                maxLength={2000}
                style={{
                  width: '100%',
                  padding: '9px 13px',
                  border: '1.5px solid #C2D9C9',
                  borderRadius: 20,
                  fontFamily: 'inherit',
                  fontSize: '.88rem',
                  resize: 'none',
                  outline: 'none',
                  background: '#F7FAF8',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s, border-radius 0.15s',
                  lineHeight: 1.45,
                  ...(draft ? { borderRadius: 12 } : {}),
                }}
                onFocus={e => { e.target.style.borderColor = '#1A3D2A' }}
                onBlur={e => { e.target.style.borderColor = '#C2D9C9' }}
              />
              {draft && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setDraft('')}
                    style={{ padding: '6px 14px', background: 'none', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '.8rem', fontWeight: 600, color: '#6A8A75', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Annuleer
                  </button>
                  <button
                    type="submit"
                    disabled={posting || !draft.trim()}
                    style={{ padding: '6px 16px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: '.8rem', fontWeight: 700, cursor: posting ? 'not-allowed' : 'pointer', opacity: posting ? 0.7 : 1, fontFamily: 'inherit' }}
                  >
                    {posting ? 'Bezig…' : 'Posten'}
                  </button>
                </div>
              )}
            </div>
          </div>
          {error && <p style={{ color: '#B23A4D', fontSize: '.78rem', margin: '6px 0 0 48px' }}>{error}</p>}
        </form>
      )}

      {/* Divider only if there are posts */}
      {berichten.length > 0 && canPost && (
        <div style={{ borderTop: '1px solid #EEF2EF', marginBottom: 14 }} />
      )}

      {/* Feed */}
      {berichten.length === 0 ? (
        <p style={{ color: '#6A8A75', fontSize: '.82rem', margin: 0, paddingLeft: canPost ? 48 : 0 }}>
          {canPost ? 'Nog geen berichten geplaatst.' : 'Geen berichten momenteel.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {berichten.map(b => (
            <div key={b.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Avatar naam={b.author_naam} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  background: '#F7FAF8',
                  border: '1px solid #E4EDE7',
                  borderRadius: '0 14px 14px 14px',
                  padding: '10px 14px',
                  position: 'relative',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '.85rem', color: '#1A3D2A' }}>{b.author_naam}</span>
                    {canPost && (
                      <button
                        onClick={() => handleDelete(b.id)}
                        style={{ background: 'none', border: 'none', color: '#B23A4D', fontSize: '.75rem', cursor: 'pointer', padding: '0 2px', lineHeight: 1, opacity: 0.6, transition: 'opacity 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                        title="Verwijder bericht"
                        aria-label="Verwijder bericht"
                      >
                        <i className="fa-solid fa-trash-can" style={{ fontSize: '.7rem' }}></i>
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '.85rem', color: '#2A3D2E', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {b.content}
                  </p>
                </div>
                <span style={{ fontSize: '.72rem', color: '#8A9A8A', marginLeft: 4, marginTop: 3, display: 'block' }}>
                  {timeAgo(b.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
