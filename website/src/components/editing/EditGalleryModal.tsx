'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { useScrollLock } from '@/lib/useScrollLock'

interface EditGalleryModalProps {
  initialPhotos: string[]
  onClose: () => void
  onSaved: (updatedPhotos: string[]) => void
}

export default function EditGalleryModal({
  initialPhotos,
  onClose,
  onSaved,
}: EditGalleryModalProps) {
  useScrollLock(true)
  const [photos, setPhotos] = useState<string[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'verhuur')

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Uploaden van foto mislukt.')
      }

      const data = await res.json()
      if (data.url) {
        setPhotos(prev => [...prev, data.url])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij uploaden foto')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleRemovePhoto(indexToRemove: number) {
    if (photos.length <= 1) {
      if (!confirm('Weet je zeker dat je de laatste foto wilt verwijderen? De galerij zal dan leeg zijn.')) {
        return
      }
    }
    setPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  function handleMovePhoto(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= photos.length) return
    setPhotos(prev => {
      const copy = [...prev]
      const [item] = copy.splice(fromIndex, 1)
      copy.splice(toIndex, 0, item)
      return copy
    })
  }

  function handleSave() {
    onSaved(photos)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 999999,
          backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000000,
          padding: 16,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: 720,
            maxHeight: '90vh',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '2px solid #162544',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#162544',
              color: '#ffffff',
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #243B6B',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  backgroundColor: '#243B6B',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 900,
                }}
              >
                GALERIJ BEHEER
              </span>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Verhuur Foto&#39;s Beheren &amp; Uploaden
              </h3>
            </div>
            <button
              onClick={onClose}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#CBD5E1',
                fontSize: '1.3rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
            {error && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1.5px solid #F87171',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  fontWeight: 700,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: '0.92rem', color: '#475569', fontWeight: 600 }}>
                Aantal foto&#39;s in galerij: <strong>{photos.length}</strong>
              </span>

              {/* Add Photo Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                type="button"
                style={{
                  backgroundColor: '#243B6B',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 16px',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: uploading ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 6px rgba(36, 59, 107, 0.25)',
                }}
              >
                {uploading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Uploaden…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-plus" style={{ color: '#E2C58D' }}></i> Extra Foto Uploaden
                  </>
                )}
              </button>
            </div>

            {/* Photos Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 16,
                marginTop: 8,
              }}
            >
              {photos.map((url, idx) => (
                <div
                  key={url + idx}
                  style={{
                    position: 'relative',
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: '1.5px solid #CBD5E1',
                    backgroundColor: '#F1F5F9',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: 130 }}>
                    <Image
                      src={url}
                      alt={`Verhuur foto ${idx + 1}`}
                      fill
                      unoptimized
                      style={{ objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        backgroundColor: 'rgba(22, 37, 68, 0.85)',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 12,
                      }}
                    >
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#FFFFFF',
                      borderTop: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(idx, idx - 1)}
                        disabled={idx === 0}
                        title="Naar links verplaatsen"
                        style={{
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: 6,
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          opacity: idx === 0 ? 0.4 : 1,
                          fontSize: '0.75rem',
                          color: '#162544',
                        }}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(idx, idx + 1)}
                        disabled={idx === photos.length - 1}
                        title="Naar rechts verplaatsen"
                        style={{
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: 6,
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: idx === photos.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: idx === photos.length - 1 ? 0.4 : 1,
                          fontSize: '0.75rem',
                          color: '#162544',
                        }}
                      >
                        →
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      title="Foto verwijderen"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #F87171',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#DC2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <i className="fa-solid fa-trash"></i> Verwijder
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {photos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B', fontStyle: 'italic' }}>
                Er staan momenteel geen foto&#39;s in de galerij. Klik op &quot;Extra Foto Uploaden&quot; om foto&#39;s toe te voegen.
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '14px 22px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <button
              onClick={onClose}
              type="button"
              style={{
                backgroundColor: 'transparent',
                border: '1.5px solid #CBD5E1',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              type="button"
              style={{
                backgroundColor: '#162544',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '9px 24px',
                fontSize: '0.88rem',
                fontWeight: 900,
                cursor: uploading ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(22, 37, 68, 0.3)',
              }}
            >
              <i className="fa-solid fa-check" style={{ color: '#E2C58D' }}></i> Foto&#39;s Toepassen
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
