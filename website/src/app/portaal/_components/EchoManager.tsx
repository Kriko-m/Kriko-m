'use client'

import { useState, useRef } from 'react'
import { Echo } from '@/lib/types'
import { PORTAAL_TAKKEN, TAK_NAMEN, TAK_KLEUREN } from '@/lib/constants'
import ConfirmDialog from './ConfirmDialog'

const MAANDEN = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
const TAKKEN = PORTAAL_TAKKEN.filter(t => t !== 'groepsleiding')

interface Props {
  initialEchos: Echo[]
}

export default function EchoManager({ initialEchos }: Props) {
  const [activeTak, setActiveTak] = useState('kapoenen')
  const [echos, setEchos] = useState<Echo[]>(initialEchos)
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState('')
  const [echoDroppedFile, setEchoDroppedFile] = useState<File | null>(null)
  const [echoDragOver, setEchoDragOver] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  const echoFileInputRef = useRef<HTMLInputElement>(null)

  function showFlash(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(''), 3000)
  }

  const takEchos = echos
    .filter(e => e.tak === activeTak)
    .sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      if (b.month !== a.month) return b.month - a.month
      const aTime = a.created_at || a.uploaded_at || ''
      const bTime = b.created_at || b.uploaded_at || ''
      if (aTime && bTime) return bTime.localeCompare(aTime)
      return 0
    })

  // KE warning: past the 20th and next month's echo not yet uploaded for this tak
  const echoWarnActive = (() => {
    const now = new Date()
    if (now.getDate() < 20) return false
    const nextM = now.getMonth() === 11 ? 1 : now.getMonth() + 2
    const nextY = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
    return !takEchos.some(e => e.month === nextM && e.year === nextY)
  })()

  async function handleUploadEcho(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    setLoading(true)
    const fd = new FormData(formEl)
    const file = echoDroppedFile ?? (fd.get('echoFile') as File)
    const month = fd.get('echoMonth') as string
    const year = fd.get('echoYear') as string

    if (!file || !file.size) {
      showFlash('Selecteer een PDF bestand.')
      setLoading(false)
      return
    }

    // Controleer of er al een Echo voor deze maand & jaar is geüpload voor deze tak (max 1 per maand)
    const alreadyExists = takEchos.some(
      echo => echo.month === Number(month) && echo.year === Number(year)
    )

    if (alreadyExists) {
      showFlash(`Er bestaat al een Kriko Echo voor ${MAANDEN[Number(month)]} ${year}. Verwijder eerst de bestaande Echo.`)
      setLoading(false)
      return
    }

    const uploadFd = new FormData()
    uploadFd.append('file', file)
    uploadFd.append('type', 'echo')
    uploadFd.append('echoTak', activeTak)
    uploadFd.append('echoMonth', month)
    uploadFd.append('echoYear', year)

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: uploadFd })
      const data = await res.json().catch(() => null)

      if (res.ok && data && !data.error) {
        setEchos(prev => [data, ...prev])
        formEl.reset()
        setEchoDroppedFile(null)
        showFlash(`Echo geüpload voor ${TAK_NAMEN[activeTak]}!`)
      } else {
        showFlash(data?.error || 'Fout bij het uploaden van de Echo.')
      }
    } catch (err) {
      console.error('Upload catch error:', err)
      showFlash('Netwerkfout bij uploaden.')
    } finally {
      setLoading(false)
    }
  }

  function handleDeleteEcho(id: string) {
    setConfirmDialog({
      message: 'Wil je deze Echo definitief verwijderen?',
      onConfirm: async () => {
        setConfirmDialog(null)
        const res = await fetch(`/api/admin/echos/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setEchos(prev => prev.filter(e => e.id !== id))
          showFlash('Echo verwijderd.')
        } else {
          showFlash('Fout bij verwijderen.')
        }
      },
    })
  }

  const kleur = TAK_KLEUREN[activeTak] ?? '#1A3D2A'

  const inputStyle = { width: '100%', padding: '14px 18px', border: '1.5px solid #C2D9C9', borderRadius: 12, fontFamily: 'inherit', fontSize: '1rem', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '.88rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }

  return (
    <div style={{ padding: '48px 36px 32px', maxWidth: 1440, margin: '0 auto', width: '100%' }}>
      {flash && (
        <div style={{ background: '#FFFFFF', border: '2px solid #3F7D5A', color: '#1A3D2A', padding: '14px 20px', borderRadius: 14, marginBottom: 28, fontWeight: 700, boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}>
          {flash}
        </div>
      )}

      {/* Tak selection tabs - CENTERED and wider buttons */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
        {TAKKEN.map(tak => {
          const isActive = activeTak === tak
          const takColor = TAK_KLEUREN[tak] || '#1A3D2A'
          return (
            <button
              key={tak}
              type="button"
              onClick={() => {
                setActiveTak(tak)
                setEchoDroppedFile(null)
              }}
              style={{
                padding: '14px 32px',
                minWidth: 140,
                borderRadius: 16,
                border: isActive ? (tak === 'kapoenen' ? '2.5px solid #F5B82E' : '2.5px solid #FFFFFF') : '2px solid rgba(255,255,255,0.4)',
                background: isActive ? takColor : '#FFFFFF',
                color: isActive ? (tak === 'kapoenen' ? '#3a2a00' : '#FFFFFF') : '#1A3D2A',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 6px 20px rgba(0,0,0,0.22)' : '0 3px 10px rgba(0,0,0,0.08)',
              }}
            >
              {TAK_NAMEN[tak] ?? tak}
            </button>
          )
        })}
      </div>

      {/* Grid: Wide Central Upload Column (Left) + Compact Side Column (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: 32,
        alignItems: 'start',
      }} className="echo-manager-grid">
        
        {/* Main Central Column (Wide): Upload Form Card */}
        <div style={{ background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 22, padding: 36, boxShadow: '0 8px 28px rgba(0,0,0,0.1)', borderTop: `6px solid ${kleur}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#1A3D2A', fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>
                Echo Uploaden
              </h2>
              <span style={{ fontSize: '.9rem', color: '#4A6855', fontWeight: 600 }}>Selecteer maand en jaar, en upload de nieuwe editie in PDF</span>
            </div>

            {echoWarnActive && (
              <span style={{ background: '#C9963A', color: '#fff', borderRadius: 20, fontSize: '.8rem', fontWeight: 800, padding: '5px 14px' }}>
                ⚠️ Volgende maand nog niet geüpload!
              </span>
            )}
          </div>

          <form onSubmit={handleUploadEcho} style={{ background: '#FAFBF9', border: '2px dashed #C2D9C9', borderRadius: 18, padding: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Maand</label>
                <select name="echoMonth" required defaultValue={String(new Date().getMonth() + 1)} style={inputStyle}>
                  {MAANDEN.map((m, i) => i > 0 && <option key={i} value={i}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Jaar</label>
                <select name="echoYear" required defaultValue={String(new Date().getFullYear())} style={inputStyle}>
                  <option value={String(new Date().getFullYear() - 1)}>{new Date().getFullYear() - 1}</option>
                  <option value={String(new Date().getFullYear())}>{new Date().getFullYear()}</option>
                  <option value={String(new Date().getFullYear() + 1)}>{new Date().getFullYear() + 1}</option>
                </select>
              </div>
            </div>

            {/* Higher Upload Dropzone Container */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>PDF bestand</label>
              <div
                onDragOver={e => { e.preventDefault(); setEchoDragOver(true) }}
                onDragLeave={() => setEchoDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setEchoDragOver(false)
                  const f = e.dataTransfer.files[0]
                  if (f && f.type === 'application/pdf') setEchoDroppedFile(f)
                  else showFlash('Enkel PDF bestanden zijn toegestaan.')
                }}
                onClick={() => echoFileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${echoDragOver ? '#1A3D2A' : '#C2D9C9'}`,
                  borderRadius: 18,
                  background: echoDragOver ? '#EEF5F1' : '#fff',
                  padding: '64px 24px',
                  minHeight: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <input
                  ref={echoFileInputRef}
                  type="file"
                  name="echoFile"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) setEchoDroppedFile(f)
                  }}
                />
                {echoDroppedFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <i className="fa-solid fa-file-pdf" style={{ color: '#B23A4D', fontSize: '2.4rem' }}></i>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A3D2A' }}>{echoDroppedFile.name}</span>
                    <button type="button" onClick={e => { e.stopPropagation(); setEchoDroppedFile(null) }} style={{ background: 'none', border: 'none', color: '#B23A4D', cursor: 'pointer', fontSize: '1.2rem', padding: 4 }}>✕</button>
                  </div>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '3rem', color: '#6A8A75', marginBottom: 14, display: 'block' }}></i>
                    <span style={{ fontSize: '1.05rem', color: '#6A8A75' }}>Sleep PDF hierheen of <strong style={{ color: '#1A3D2A' }}>klik om te bladeren</strong></span>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !echoDroppedFile}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: '#1A3D2A',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: echoDroppedFile ? 'pointer' : 'not-allowed',
                opacity: echoDroppedFile ? 1 : 0.65,
                fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(26, 61, 42, 0.25)',
              }}
            >
              {loading ? 'Uploaden...' : `Uploaden voor ${TAK_NAMEN[activeTak]}`}
            </button>
          </form>
        </div>

        {/* Compact Right Side Column: Geüploade Echo's List */}
        <div style={{ background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 22, padding: 24, boxShadow: '0 6px 24px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 900, color: '#1A3D2A', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📚</span>
            <span>Geüploade Echo&apos;s</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {takEchos.length === 0 ? (
              <div style={{ padding: '24px 16px', background: '#FAFBF9', border: '1.5px solid #E0E5E1', borderRadius: 12, textAlign: 'center', color: '#6A8A75', fontSize: '.88rem' }}>
                Nog geen Echo&apos;s geüpload voor deze tak.
              </div>
            ) : (
              takEchos.map(echo => {
                const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/echos/${echo.file_name}`
                return (
                  <a
                    key={echo.id}
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="echo-pill-card"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 16px',
                      background: '#FAFBF9',
                      border: '1.5px solid #E0E5E1',
                      borderRadius: 14,
                      textDecoration: 'none',
                      color: '#1A3D2A',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <i className="fa-solid fa-file-pdf" style={{ color: '#B23A4D', fontSize: '1.4rem', flexShrink: 0 }}></i>
                      <div style={{ minWidth: 0 }}>
                        {/* Title: ONLY date (e.g. "Januari 2026") */}
                        <strong style={{ display: 'block', fontSize: '.95rem', fontWeight: 800, color: '#1A3D2A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {MAANDEN[echo.month].charAt(0).toUpperCase() + MAANDEN[echo.month].slice(1)} {echo.year}
                        </strong>
                        <span style={{ fontSize: '.78rem', color: '#C9963A', fontWeight: 700 }}>
                          Bekijk PDF ↗
                        </span>
                      </div>
                    </div>

                    {/* Wis knop — stops click propagation to card link */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteEcho(echo.id)
                      }}
                      style={{
                        padding: '6px 12px',
                        border: '1.5px solid #B23A4D',
                        borderRadius: 8,
                        background: '#fff',
                        color: '#B23A4D',
                        fontSize: '.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginLeft: 8,
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      Wis
                    </button>
                  </a>
                )
              })
            )}
          </div>
        </div>

      </div>

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}
