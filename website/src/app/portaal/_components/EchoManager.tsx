'use client'

import { useState, useRef } from 'react'
import { Echo } from '@/lib/types'
import { PORTAAL_TAKKEN, TAK_NAMEN, TAK_KLEUREN } from '@/lib/constants'
import ConfirmDialog from './ConfirmDialog'

const MAANDEN = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
const TAKKEN = PORTAAL_TAKKEN.filter(t => t !== 'groepsleiding')

interface Props {
  initialEchos: Echo[]
  isGroepsleiding?: boolean
}

export default function EchoManager({ initialEchos, isGroepsleiding = false }: Props) {
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
    setTimeout(() => setFlash(''), 4000)
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

  const pendingEchos = takEchos.filter(e => !e.approved)
  const approvedEchos = takEchos.filter(e => e.approved)

  // Count pending echos per tak for badge indicators
  const pendingCountByTak = echos.filter(e => !e.approved).reduce((acc, e) => {
    acc[e.tak] = (acc[e.tak] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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

    // Controleer of er al een geüploade Echo voor deze maand & jaar is (max 1 per maand)
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
        showFlash(`Echo geüpload voor ${TAK_NAMEN[activeTak]}! Deze wacht nu op goedkeuring.`)
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

  async function handleApproveEcho(id: string) {
    try {
      const res = await fetch(`/api/admin/echos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      })
      const updated = await res.json()
      if (res.ok && updated && !updated.error) {
        setEchos(prev => prev.map(e => e.id === id ? { ...e, approved: true } : e))
        showFlash('Echo goedgekeurd en gepubliceerd op de website!')
      } else {
        showFlash(updated?.error || 'Fout bij goedkeuren.')
      }
    } catch (err) {
      console.error('Approve Echo error:', err)
      showFlash('Netwerkfout bij goedkeuren.')
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
    <div style={{ maxWidth: 1440, margin: '0 auto', width: '100%' }} className="portaal-page-container">
      <header className="portaal-page-header" style={{ margin: '-28px -20px 28px -20px' }}>
        <div className="portaal-page-header-inner">
          <div>
            <h1 className="portaal-page-header-title">
              <i className="fa-solid fa-newspaper"></i> Kriko Echo Beheer
            </h1>
            <p className="portaal-page-header-desc">
              Upload en beheer de maandelijkse Kriko Echo edities per tak.
            </p>
          </div>
        </div>
      </header>

      {flash && (
        <div style={{ background: '#FFFFFF', border: '2px solid #3F7D5A', color: '#1A3D2A', padding: '14px 20px', borderRadius: 14, marginBottom: 28, fontWeight: 700, boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}>
          {flash}
        </div>
      )}

      {/* Tak selection tabs - CENTERED and wider buttons */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center' }} className="echo-tak-selector-row">
        {TAKKEN.map(tak => {
          const isActive = activeTak === tak
          const takColor = TAK_KLEUREN[tak] || '#1A3D2A'
          const pendingCount = pendingCountByTak[tak] || 0

          return (
            <button
              key={tak}
              type="button"
              className="echo-tak-btn"
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
                position: 'relative',
              }}
            >
              {TAK_NAMEN[tak] ?? tak}
              {isGroepsleiding && pendingCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  background: '#C9963A',
                  color: '#fff',
                  fontSize: '.74rem',
                  fontWeight: 900,
                  borderRadius: 10,
                  padding: '2px 8px',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Grid: Wide Central Upload Column (Left) + Compact Side Column (Right) */}
      <div className="echo-manager-grid">
        
        {/* Main Central Column (Wide): Upload Form Card */}
        <div style={{ background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 22, padding: 36, boxShadow: '0 8px 28px rgba(0,0,0,0.1)', borderTop: `6px solid ${kleur}` }} className="echo-upload-card">
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

          <form onSubmit={handleUploadEcho} style={{ background: '#FAFBF9', border: '2px dashed #C2D9C9', borderRadius: 18, padding: 32 }} className="echo-upload-form">
            <div className="echo-form-row" style={{ display: 'grid', gap: 20, marginBottom: 24 }}>
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
                className="echo-dropzone"
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

        {/* Compact Right Side Column: Te Goedkeuren & Kriko Echo's */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Sectie 1: Nog goed te keuren Echo's */}
          {pendingEchos.length > 0 && (
            <div style={{ background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 22, padding: 24, boxShadow: '0 6px 24px rgba(0,0,0,0.04)', borderTop: '6px solid #1A3D2A' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 900, color: '#1A3D2A', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⏳</span>
                <span>Nog goed te keuren</span>
                <span style={{ background: '#1A3D2A', color: '#fff', fontSize: '.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: 12, marginLeft: 'auto' }}>
                  {pendingEchos.length}
                </span>
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '.82rem', color: '#4A6855', fontWeight: 600 }}>
                {isGroepsleiding ? 'Geüploade Echo\'s die wachten op jouw goedkeuring.' : 'Echo\'s in afwachting van goedkeuring door groepsleiding.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingEchos.map(echo => {
                  const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/echos/${echo.file_name}`
                  return (
                    <div
                      key={echo.id}
                      style={{
                        padding: '14px 16px',
                        background: '#FFFDF9',
                        border: '1.5px solid #E6D7B8',
                        borderRadius: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
                        >
                          <i className="fa-solid fa-file-pdf" style={{ color: '#B23A4D', fontSize: '1.4rem', flexShrink: 0 }}></i>
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ display: 'block', fontSize: '.95rem', fontWeight: 800, color: '#1A3D2A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {MAANDEN[echo.month].charAt(0).toUpperCase() + MAANDEN[echo.month].slice(1)} {echo.year}
                            </strong>
                            <span style={{ fontSize: '.76rem', color: '#C9963A', fontWeight: 700 }}>
                              Bekijk PDF ↗
                            </span>
                          </div>
                        </a>
                      </div>

                      {/* Control buttons for groepsleiding or status badge for leiding */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px dashed #E6D7B8' }}>
                        {isGroepsleiding ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDeleteEcho(echo.id)}
                              title="Afkeuren en verwijderen"
                              style={{
                                padding: '6px 12px',
                                border: '1.5px solid #B23A4D',
                                borderRadius: 8,
                                background: '#FFF',
                                color: '#B23A4D',
                                fontSize: '.8rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              ✕ Afkeuren
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveEcho(echo.id)}
                              title="Goedkeuren en op website publiceren"
                              style={{
                                padding: '6px 14px',
                                border: 'none',
                                borderRadius: 8,
                                background: '#1A3D2A',
                                color: '#FFF',
                                fontSize: '.8rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                boxShadow: '0 2px 6px rgba(26,61,42,0.2)',
                              }}
                            >
                              ✓ Goedkeuren
                            </button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontSize: '.78rem', color: '#856404', background: '#FFF3CD', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
                              ⏳ Wacht op goedkeuring
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteEcho(echo.id)}
                              style={{
                                padding: '4px 8px',
                                border: '1px solid #B23A4D',
                                borderRadius: 6,
                                background: '#fff',
                                color: '#B23A4D',
                                fontSize: '.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Annuleren
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sectie 2: Kriko Echo's (op website) */}
          <div style={{ background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 22, padding: 24, boxShadow: '0 6px 24px rgba(0,0,0,0.04)', borderTop: '6px solid #1A3D2A' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 900, color: '#1A3D2A', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📚</span>
              <span>Kriko Echo&apos;s</span>
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '.82rem', color: '#4A6855', fontWeight: 600 }}>
              Zichtbaar op de officiële website.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {approvedEchos.length === 0 ? (
                <div style={{ padding: '24px 16px', background: '#FAFBF9', border: '1.5px solid #E0E5E1', borderRadius: 12, textAlign: 'center', color: '#6A8A75', fontSize: '.88rem' }}>
                  Nog geen Kriko Echo&apos;s beschikbaar.
                </div>
              ) : (
                approvedEchos.map(echo => {
                  const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/echos/${echo.file_name}`
                  return (
                    <div
                      key={echo.id}
                      className="echo-pill-card"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px 16px',
                        background: '#FAFBF9',
                        border: '1.5px solid #E0E5E1',
                        borderRadius: 14,
                        color: '#1A3D2A',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          minWidth: 0,
                          flex: 1,
                          textDecoration: 'none',
                          color: 'inherit',
                        }}
                      >
                        <i className="fa-solid fa-file-pdf" style={{ color: '#B23A4D', fontSize: '1.4rem', flexShrink: 0 }}></i>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ display: 'block', fontSize: '.95rem', fontWeight: 800, color: '#1A3D2A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {MAANDEN[echo.month].charAt(0).toUpperCase() + MAANDEN[echo.month].slice(1)} {echo.year}
                          </strong>
                          <span style={{ fontSize: '.78rem', color: '#1A3D2A', opacity: 0.8, fontWeight: 700 }}>
                            Bekijk PDF ↗
                          </span>
                        </div>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteEcho(echo.id)}
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
                        }}
                      >
                        Wis
                      </button>
                    </div>
                  )
                })
              )}
            </div>
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
