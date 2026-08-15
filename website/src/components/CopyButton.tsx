'use client'
import { useState } from 'react'

interface Props {
  text: string
  variant?: 'inline' | 'button'
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export default function CopyButton({ text, variant, className, style, children }: Props) {
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle')

  const isButton = variant === 'button' || (variant === undefined && className?.includes('btn'))

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback voor oudere browsers
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setState('ok')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('err')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  // Separate shorthand background property from style to prevent React style conflict warnings during rerenders
  const { background, ...cleanedStyle } = style ?? {}
  const rawBg = cleanedStyle.backgroundColor ?? background
  const customBg: string | undefined = typeof rawBg === 'string'
    ? (rawBg === 'none' ? 'transparent' : rawBg)
    : undefined

  if (isButton) {
    const buttonClass = className ?? 'btn btn-secondary'
    return (
      <button
        onClick={handleClick}
        className={buttonClass}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          ...(customBg ? { backgroundColor: customBg } : {}),
          ...cleanedStyle,
        }}
        type="button"
        title="Klik om te kopiëren"
      >
        {state === 'ok' ? (
          <>
            <i className="fa-solid fa-check"></i>
            <span>Gekopieerd!</span>
          </>
        ) : state === 'err' ? (
          <>
            <i className="fa-solid fa-xmark" style={{ color: '#ef4444' }}></i>
            <span>Mislukt</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }

  const inlineStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    gap: 5,
    padding: '2px 8px',
    margin: '0 2px',
    borderRadius: '4px',
    backgroundColor: state === 'ok' ? 'var(--color-primary, #650b19)' : (customBg ?? 'transparent'),
    color: state === 'ok' ? '#ffffff' : 'var(--color-primary-dark, #650b19)',
    border: state === 'ok' ? '1px solid var(--color-primary)' : '1px solid rgba(101, 11, 25, 0.35)',
    fontSize: '0.9em',
    fontWeight: 600,
    lineHeight: 1.2,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textDecoration: 'none',
    boxShadow: 'none',
    ...cleanedStyle,
  }

  return (
    <button
      onClick={handleClick}
      className={className ?? 'copy-btn'}
      style={inlineStyle}
      type="button"
      title="Klik om te kopiëren"
    >
      {state === 'ok' ? (
        <>
          <i className="fa-solid fa-check" style={{ color: '#fff' }}></i>
          <span>Gekopieerd!</span>
        </>
      ) : state === 'err' ? (
        <>
          <i className="fa-solid fa-xmark" style={{ color: '#dc2626' }}></i>
          <span>Mislukt</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          <i className="fa-regular fa-copy" style={{ fontSize: '0.85em', opacity: 0.7, marginLeft: 2 }}></i>
        </>
      )}
    </button>
  )
}
