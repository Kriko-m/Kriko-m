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
  onSaved: () => void
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
  const [leaders, setLeaders] = useState<Leader[]>(
    initialLeaders.length > 0
      ? initialLeaders
      : [{ name: '', totem: '', phone: '' }]
  )

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

      onSaved()
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #E8F0EB', paddingBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0, color: '#1A3D2A', fontWeight: 900, fontSize: '1.3rem' }}>
              ✏️ Leidingsploeg &amp; Foto Bewerken ({takName})
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#6A8A75', fontWeight: 600 }}>
              Pas de leidingsfoto en leidingsleden aan voor {takName}
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6A8A75' }}
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
          <div style={{ backgroundColor: '#F9FBF9', padding: 18, borderRadius: 12, border: '1px solid #C2D9C9' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1A3D2A', fontSize: '1rem', fontWeight: 800 }}>
              📷 Leidingsfoto ({takName})
            </h4>

            {photo ? (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', backgroundColor: '#F0ECE4', marginBottom: 12, border: '1px solid #E2C58D' }}>
                <Image
                  src={photo}
                  alt={`Leidingsploeg ${takName}`}
                  fill
                  unoptimized
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div style={{ padding: 16, backgroundColor: '#FFF', borderRadius: 8, border: '1px dashed #C2D9C9', color: '#6A8A75', fontSize: '0.88rem', fontStyle: 'italic', marginBottom: 12 }}>
                Nog geen leidingsfoto ingesteld. Upload er een hieronder!
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={photo}
                onChange={e => setPhoto(e.target.value)}
                placeholder="Foto URL (of upload hiernaast)"
                style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.85rem' }}
              />

              <label style={{
                padding: '8px 14px',
                backgroundColor: '#1A3D2A',
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
          </div>

          {/* SECTIE 2: Leidingsleden Lijst */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, color: '#1A3D2A', fontSize: '1rem', fontWeight: 800 }}>
                👥 Leidingsleden ({leaders.length})
              </h4>

              <button
                onClick={handleAddLeader}
                type="button"
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#EEF5F1',
                  color: '#1A3D2A',
                  border: '1.5px solid #1A3D2A',
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                ➕ Leider/Leidster Toevoegen
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {leaders.map((leader, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#F9FBF9',
                    padding: 14,
                    borderRadius: 12,
                    border: '1px solid #E8F0EB',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase' }}>
                      Leiding #{index + 1}
                    </span>

                    {leaders.length > 1 && (
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
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6A8A75', marginBottom: 2 }}>
                        Naam *
                      </label>
                      <input
                        type="text"
                        value={leader.name}
                        onChange={e => handleLeaderChange(index, 'name', e.target.value)}
                        placeholder="bv. Marthe Isik"
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #C2D9C9', borderRadius: 6, fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6A8A75', marginBottom: 2 }}>
                        Telefoonnummer
                      </label>
                      <input
                        type="text"
                        value={leader.phone || ''}
                        onChange={e => handleLeaderChange(index, 'phone', e.target.value)}
                        placeholder="bv. +32 470 34 37 20"
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #C2D9C9', borderRadius: 6, fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6A8A75', marginBottom: 2 }}>
                      Totem / Bijnaam
                    </label>
                    <input
                      type="text"
                      value={leader.totem || ''}
                      onChange={e => handleLeaderChange(index, 'totem', e.target.value)}
                      placeholder="bv. Dageraad rode doortastende Drongo"
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid #C2D9C9', borderRadius: 6, fontSize: '0.88rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, borderTop: '1px solid #E8F0EB', paddingTop: 16 }}>
          <button
            onClick={onClose}
            type="button"
            style={{ padding: '10px 18px', backgroundColor: '#F0ECE4', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', color: '#555' }}
          >
            Annuleren
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            type="button"
            style={{ padding: '10px 24px', backgroundColor: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, cursor: saving ? 'wait' : 'pointer' }}
          >
            {saving ? 'Opslaan...' : '💾 Opslaan'}
          </button>
        </div>
      </div>
    </div>
  )
}
