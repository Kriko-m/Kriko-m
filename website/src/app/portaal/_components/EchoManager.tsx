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
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const file = echoDroppedFile ?? (fd.get('echoFile') as File)
    const month = fd.get('echoMonth') as string
    const year = fd.get('echoYear') as string

    if (!file || !file.size) {
      showFlash('Selecteer een PDF bestand.')
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
      if (res.ok) {
        const newEcho = await res.json()
        setEchos(prev => [newEcho, ...prev])
        e.currentTarget.reset()
        setEchoDroppedFile(null)
        showFlash(`Kriko Echo geüpload voor ${TAK_NAMEN[activeTak]}!`)
      } else {
        showFlash('Fout bij het uploaden van de Echo.')
      }
    } catch {
      showFlash('Netwerkfout bij uploaden.')
    }
    setLoading(false)
  }

  function handleDeleteEcho(id: string) {
    setConfirmDialog({
      message: 'Wil je deze Kriko Echo definitief verwijderen?',
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

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '.84rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: '#1A3D2A', fontWeight: 900, fontSize: '1.8rem' }}>
          🗞️ Kriko Echo
        </h1>
        <p style={{ margin: '6px 0 0', color: '#6A8A75', fontSize: '.95rem' }}>
          Upload en beheer hier eenvoudig het maandblad per tak.
        </p>
      </header>

      {flash && (
        <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '12px 18px', borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>
          {flash}
        </div>
      )}

      {/* Tak selection tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
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
                padding: '10px 20px',
                borderRadius: 14,
                border: `2px solid ${isActive ? takColor : '#C2D9C9'}`,
                background: isActive ? takColor : '#fff',
                color: isActive ? (tak === 'kapoenen' ? '#3a2a00' : '#fff') : '#1A3D2A',
                fontWeight: 800,
                fontSize: '.92rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
            >
              {TAK_NAMEN[tak] ?? tak}
            </button>
          )
        })}
      </div>

      {/* Main Upload & Listing Card */}
      <div style={{ background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', borderTop: `6px solid ${kleur}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#1A3D2A' }}>
              Echo voor {TAK_NAMEN[activeTak]}
            </h2>
            <span style={{ fontSize: '.84rem', color: '#6A8A75' }}>Selecteer een maand en upload een PDF-bestand</span>
          </div>

          {echoWarnActive && (
            <span style={{ background: '#C9963A', color: '#fff', borderRadius: 20, fontSize: '.78rem', fontWeight: 800, padding: '4px 12px' }}>
              ⚠️ Echo voor volgende maand nog niet geüpload!
            </span>
          )}
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUploadEcho} style={{ background: '#FAFBF9', border: '2px dashed #C2D9C9', borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
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

          <div style={{ marginBottom: 16 }}>
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
                borderRadius: 12,
                background: echoDragOver ? '#EEF5F1' : '#fff',
                padding: '24px 16px',
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <i className="fa-solid fa-file-pdf" style={{ color: '#B23A4D', fontSize: '1.4rem' }}></i>
                  <span style={{ fontSize: '.92rem', fontWeight: 700, color: '#1A3D2A' }}>{echoDroppedFile.name}</span>
                  <button type="button" onClick={e => { e.stopPropagation(); setEchoDroppedFile(null) }} style={{ background: 'none', border: 'none', color: '#B23A4D', cursor: 'pointer', fontSize: '.9rem', padding: 4 }}>✕</button>
                </div>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '1.8rem', color: '#6A8A75', marginBottom: 8, display: 'block' }}></i>
                  <span style={{ fontSize: '.9rem', color: '#6A8A75' }}>Sleep een PDF hierheen of <strong style={{ color: '#1A3D2A' }}>klik om te bladeren</strong></span>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !echoDroppedFile}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: '#1A3D2A',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: '.95rem',
              cursor: echoDroppedFile ? 'pointer' : 'not-allowed',
              opacity: echoDroppedFile ? 1 : 0.6,
              fontFamily: 'inherit'
            }}
          >
            {loading ? 'Uploaden...' : `Upload Kriko Echo voor ${TAK_NAMEN[activeTak]} 🚀`}
          </button>
        </form>

        {/* Existing Echos List */}
        <div>
          <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 800, color: '#1A3D2A' }}>
            Geüploade Echo&apos;s ({TAK_NAMEN[activeTak]})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {takEchos.length === 0 ? (
              <p style={{ color: '#6A8A75', fontSize: '.9rem', margin: 0 }}>Nog geen Echo&apos;s geüpload voor deze tak.</p>
            ) : (
              takEchos.map(echo => (
                <div key={echo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#FAFBF9', border: '1.5px solid #E0E5E1', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <i className="fa-solid fa-file-pdf" style={{ color: '#B23A4D', fontSize: '1.4rem' }}></i>
                    <div>
                      <strong style={{ display: 'block', fontSize: '.96rem', color: '#1A3D2A' }}>
                        Kriko Echo — {MAANDEN[echo.month].charAt(0).toUpperCase() + MAANDEN[echo.month].slice(1)} {echo.year}
                      </strong>
                      <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/echos/${echo.file_name}`} target="_blank" rel="noreferrer" style={{ fontSize: '.82rem', color: '#C9963A', textDecoration: 'none', fontWeight: 700 }}>
                        Bekijk / Download PDF ↗
                      </a>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteEcho(echo.id)} style={{ padding: '6px 14px', border: '1.5px solid #B23A4D', borderRadius: 8, background: '#fff', color: '#B23A4D', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer' }}>
                    Verwijderen
                  </button>
                </div>
              ))
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
