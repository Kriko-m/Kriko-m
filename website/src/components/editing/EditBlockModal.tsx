'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  blockKey: string
  page: string
  section: string
  initialTitle?: string
  initialContent?: string
  initialImageUrl?: string
  onClose: () => void
  onSaved: () => void
}

export default function EditBlockModal({
  blockKey,
  page,
  section,
  initialTitle = '',
  initialContent = '',
  initialImageUrl = '',
  onClose,
  onSaved,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'home-leiding-foto')

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Upload mislukt')
      }

      const data = await res.json()
      setImageUrl(data.url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij uploaden afbeelding')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: blockKey,
          page,
          section,
          title,
          content,
          image_url: imageUrl,
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
      backgroundColor: 'rgba(0,0,0,0.6)',
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
        maxWidth: 580,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 24,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #E8F0EB', paddingBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0, color: '#1A3D2A', fontWeight: 900, fontSize: '1.25rem' }}>
              ✏️ Blok Inhoud Bewerken
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#6A8A75', fontWeight: 600 }}>
              Sleutel: {blockKey}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Titel */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
              Titel
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="bv. Welkom bij Kriko-M!"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontSize: '0.95rem' }}
            />
          </div>

          {/* Tekst / Inhoud */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
              Tekst / Inhoud
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              placeholder="Voer de tekst in..."
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontSize: '0.92rem', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          {/* Afbeelding */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
              Afbeelding (Optioneel)
            </label>

            {imageUrl && (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', backgroundColor: '#F0ECE4', marginBottom: 10, border: '1px solid #E2C58D' }}>
                <Image
                  src={imageUrl}
                  alt="Voorbeeld"
                  fill
                  unoptimized
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://... of upload hieronder"
                style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.85rem' }}
              />

              <label style={{
                padding: '8px 14px',
                backgroundColor: '#EEF5F1',
                border: '1.5px dashed #1A3D2A',
                borderRadius: 8,
                color: '#1A3D2A',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: uploading ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
              }}>
                {uploading ? 'Uploaden...' : '📷 Upload'}
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
        </div>

        {/* Buttons */}
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
