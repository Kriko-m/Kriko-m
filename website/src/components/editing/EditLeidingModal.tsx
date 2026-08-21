'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Leader } from '@/lib/types'

interface Props {
  slug: string
  takName: string
  initialPhoto: string | null
  initialLeaders: Leader[]
  onClose: () => void
  onSaved: (savedLeaders: Leader[], savedPhoto: string) => void
}

export default function EditLeidingModal({
  slug,
  takName,
  initialPhoto,
  initialLeaders,
  onClose,
  onSaved,
}: Props) {
  const [photo, setPhoto] = useState<string>(initialPhoto || '')
  const [leaders, setLeaders] = useState<Leader[]>(initialLeaders)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAddLeader() {
    setLeaders([...leaders, { name: '', totem: '', phone: '' }])
  }

  function handleRemoveLeader(index: number) {
    setLeaders(leaders.filter((_, i) => i !== index))
  }

  function handleLeaderChange(index: number, field: keyof Leader, value: string) {
    const updated = [...leaders]
    updated[index] = { ...updated[index], [field]: value }
    setLeaders(updated)
  }

  async function handleFileUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'home-leiding-foto')
      if (photo) formData.append('oldUrl', photo)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Upload mislukt')
      }

      const data = await res.json()
      setPhoto(data.url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij uploaden foto')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    // Filter out completely empty leader rows
    const cleanedLeaders = leaders.filter(l => l.name.trim() !== '')

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          takken: {
            [slug]: {
              photo,
              leaders: cleanedLeaders,
            },
          },
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Opslaan mislukt')
      }

      onSaved(cleanedLeaders, photo)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij opslaan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      backgroundColor: 'rgba(0,0,0,0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backdropFilter: 'blur(4px)',
      fontFamily: 'var(--font-body, Outfit, sans-serif)',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        maxWidth: 680,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 24,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0, color: '#162544', fontWeight: 900, fontSize: '1.3rem', fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>
              ✏️ Leidingsploeg &amp; Foto Bewerken ({takName})
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
              Pas de leidingsfoto en leidingsleden aan voor {takName}
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: '#FDF0F2', color: '#B23A4D', border: '1px solid #E0C0C4', borderRadius: 8, marginBottom: 16, fontSize: '0.88rem', fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* SECTIE 1: Groepsfoto van de Leidingsploeg */}
          <div style={{ backgroundColor: '#F8FAFC', padding: 18, borderRadius: 12, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ margin: 0, color: '#162544', fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>
                📷 Leidingsfoto ({takName})
              </h4>
              {photo ? (
                <button
                  type="button"
                  onClick={() => setPhoto('')}
                  style={{
                    backgroundColor: '#FDF0F2',
                    color: '#B23A4D',
                    border: '1px solid #E0C0C4',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  🗑️ Geen foto gebruiken
                </button>
              ) : null}
            </div>

            {photo && photo.trim() !== '' ? (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', backgroundColor: '#F8FAFC', marginBottom: 12, border: '1px solid #CBD5E1' }}>
                <Image
                  src={photo}
                  alt={`Leidingsploeg ${takName}`}
                  fill
                  unoptimized
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div style={{ padding: 14, backgroundColor: '#FFF', borderRadius: 8, border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '0.88rem', fontStyle: 'italic', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🚫</span>
                <span>Geen foto ingesteld. Het geplakte foto-element wordt <strong>niet getoond</strong> op de publieke takpagina.</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                value={photo}
                onChange={e => setPhoto(e.target.value)}
                placeholder="Foto URL (of upload hiernaast)"
                style={{ flex: 1, minWidth: 200, padding: '8px 10px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: '0.85rem', color: '#162544' }}
              />

              <label style={{
                padding: '8px 14px',
                backgroundColor: '#162544',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: uploading ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                {uploading ? 'Uploaden...' : '📷 Foto Uploaden'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  disabled={uploading}
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handleFileUpload(f)
                  }}
                />
              </label>
            </div>

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', color: '#162544', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={!photo || photo.trim() === ''}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPhoto('')
                    }
                  }}
                  style={{ accentColor: '#162544', width: 16, height: 16 }}
                />
                <span>Geen foto tonen op publieke takpagina</span>
              </label>
            </div>
          </div>

          {/* SECTIE 2: Leidingsleden Lijst */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, color: '#162544', fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>
                👥 Leidingsleden ({leaders.length})
              </h4>

              <button
                onClick={handleAddLeader}
                type="button"
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#EBF0F9',
                  color: '#243B6B',
                  border: '1.5px solid #243B6B',
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                ➕ Leider/Leidster Toevoegen
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {leaders.length === 0 ? (
                <div style={{ padding: 16, backgroundColor: '#FFF', borderRadius: 8, border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '0.88rem', fontStyle: 'italic', textAlign: 'center' }}>
                  Er zijn momenteel geen leidingsleden. Klik op &apos;➕ Leider/Leidster Toevoegen&apos; om iemand toe te voegen.
                </div>
              ) : (
                leaders.map((leader, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: 14,
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#162544', textTransform: 'uppercase' }}>
                        Leiding #{index + 1}
                      </span>

                      <button
                        onClick={() => handleRemoveLeader(index)}
                        type="button"
                        style={{
                          backgroundColor: '#FDF0F2',
                          color: '#B23A4D',
                          border: '1px solid #E0C0C4',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ Verwijderen
                      </button>
                    </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: 2 }}>
                        Naam *
                      </label>
                      <input
                        type="text"
                        value={leader.name}
                        onChange={e => handleLeaderChange(index, 'name', e.target.value)}
                        placeholder=""
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.88rem', color: '#162544' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: 2 }}>
                        Telefoonnummer
                      </label>
                      <input
                        type="text"
                        value={leader.phone || ''}
                        onChange={e => handleLeaderChange(index, 'phone', e.target.value)}
                        placeholder=""
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.88rem', color: '#162544' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: 2 }}>
                      Totem / Bijnaam
                    </label>
                    <input
                      type="text"
                      value={leader.totem || ''}
                      onChange={e => handleLeaderChange(index, 'totem', e.target.value)}
                      placeholder=""
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.88rem', color: '#162544' }}
                    />
                  </div>
                </div>
              ))
            )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
          <button
            onClick={onClose}
            type="button"
            style={{ padding: '10px 18px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', color: '#475569' }}
          >
            Annuleren
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            type="button"
            style={{ padding: '10px 24px', backgroundColor: '#162544', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 900, cursor: saving ? 'wait' : 'pointer' }}
          >
            {saving ? 'Opslaan...' : '💾 Opslaan'}
          </button>
        </div>
      </div>
    </div>
  )
}
