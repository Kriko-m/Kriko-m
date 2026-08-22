'use client'

import React, { useState } from 'react'
import { useScrollLock } from '@/lib/useScrollLock'

interface EditTakContactModalProps {
  slug: string
  takName: string
  initialEmail: string
  initialWhatsapp: string
  onClose: () => void
  onSaved: (savedEmail: string, savedWhatsapp: string) => void
}

export default function EditTakContactModal({
  slug,
  takName,
  initialEmail,
  initialWhatsapp,
  onClose,
  onSaved,
}: EditTakContactModalProps) {
  useScrollLock(true)
  const [email, setEmail] = useState(initialEmail)
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          takken: {
            [slug]: {
              email: email.trim(),
              whatsapp_url: whatsapp.trim(),
            },
          },
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Opslaan mislukt')
      }

      onSaved(email.trim(), whatsapp.trim())
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij opslaan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          zIndex: 99999,
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: 16,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: 520,
            backgroundColor: '#ffffff',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            border: '2px solid #162544',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header in portal blue */}
          <div
            style={{
              backgroundColor: '#162544',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  backgroundColor: '#243B6B',
                  color: '#ffffff',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 900,
                }}
              >
                CONTACT BEHEER
              </span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                {takName} — Contact &amp; WhatsApp
              </h3>
            </div>
            <button
              onClick={onClose}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#CBD5E1',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1.5px solid #F87171',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#162544',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                  letterSpacing: '.04em',
                }}
              >
                Tak E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="taknaam@kriko-m.be"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: 8,
                  fontSize: '0.92rem',
                  color: '#162544',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#162544',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                  letterSpacing: '.04em',
                }}
              >
                WhatsApp Groep Link (Ouderchat)
              </label>
              <input
                type="url"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: 8,
                  fontSize: '0.92rem',
                  color: '#162544',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 4, display: 'block' }}>
                Ouders kunnen via deze uitnodigingslink direct lid worden van de WhatsApp-groep van deze tak.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            <button
              onClick={onClose}
              type="button"
              style={{
                backgroundColor: 'transparent',
                border: '1.5px solid #CBD5E1',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: '0.86rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              type="button"
              style={{
                backgroundColor: '#162544',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                fontSize: '0.86rem',
                fontWeight: 900,
                cursor: saving ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {saving ? 'Opslaan…' : 'Opslaan'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
