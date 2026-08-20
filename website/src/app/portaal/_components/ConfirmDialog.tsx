'use client'

import { useEffect } from 'react'

interface Props {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  showCancel?: boolean
  onConfirm: () => void
  onCancel?: () => void
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Verwijderen',
  cancelLabel = 'Annuleren',
  danger = true,
  showCancel = true,
  onConfirm,
  onCancel,
}: Props) {
  const handleCancel = onCancel || onConfirm

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel()
      if (e.key === 'Enter') { e.preventDefault(); onConfirm() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onConfirm, handleCancel])

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={handleCancel}
    >
      <div
        style={{ background: '#fff', borderRadius: 16, padding: '28px 28px 24px', maxWidth: 420, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: danger ? '#FEE9EC' : '#EEF5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className={`fa-solid ${danger ? 'fa-triangle-exclamation' : 'fa-circle-info'}`} style={{ color: danger ? '#B23A4D' : '#1A3D2A', fontSize: '1rem' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
            {title && (
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1a1a1a' }}>
                {title}
              </h4>
            )}
            <p style={{ margin: 0, fontSize: '.95rem', color: '#4a4a4a', lineHeight: 1.5, fontWeight: 500 }}>
              {message}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {showCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: '8px 20px', background: '#f5f5f5', border: 'none', borderRadius: 9, fontFamily: 'inherit', fontWeight: 600, fontSize: '.88rem', color: '#555', cursor: 'pointer' }}
            >
              {cancelLabel}
            </button>
          )}
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
