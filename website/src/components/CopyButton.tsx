'use client'
import { useState } from 'react'

interface Props {
  text: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export default function CopyButton({ text, className, style, children }: Props) {
  const [state, setState] = useState<'idle'|'ok'|'err'>('idle')

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

  return (
    <button onClick={handleClick} className={className} style={style} type="button">
      {state === 'ok'
        ? <><i className="fas fa-check" style={{ marginRight: 6 }}></i>Gekopieerd!</>
        : state === 'err'
        ? <><i className="fas fa-times" style={{ marginRight: 6 }}></i>Mislukt</>
        : children}
    </button>
  )
}
