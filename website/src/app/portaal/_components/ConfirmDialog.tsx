'use client'

import { useEffect } from 'react'

interface Props {
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ message, confirmLabel = 'Verwijderen', danger = true, onConfirm, onCancel }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onConfirm, onCancel])

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onCancel}
    >
      <div
        style={{ background: '#fff', borderRadius: 16, padding: '28px 28px 24px', maxWidth: 420, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: danger ? '#FEE9EC' : '#EEF5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className={`fa-solid ${danger ? 'fa-triangle-exclamation' : 'fa-circle-info'}`} style={{ color: danger ? '#B23A4D' : '#1A3D2A', fontSize: '1rem' }} />
          </div>
          <p style={{ margin: 0, fontSize: '.95rem', color: '#1a1a1a', lineHeight: 1.5, fontWeight: 500, paddingTop: 6 }}>
            {message}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '8px 20px', background: '#f5f5f5', border: 'none', borderRadius: 9, fontFamily: 'inherit', fontWeight: 600, fontSize: '.88rem', color: '#555', cursor: 'pointer' }}
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{ padding: '8px 20px', background: danger ? '#B23A4D' : '#1A3D2A', color: '#fff', border: 'none', borderRadius: 9, fontFamily: 'inherit', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
