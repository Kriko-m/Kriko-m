'use client'
import { useState } from 'react'

interface Props {
  text: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export default function CopyButton({ text, className, style, children }: Props) {
  const [copied, setCopied] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: open mailto
      window.location.href = `mailto:${text}`
    }
  }

  return (
    <button onClick={handleClick} className={className} style={style} type="button">
      {copied ? <><i className="fas fa-check" style={{ marginRight: 6 }}></i>Gekopieerd!</> : children}
    </button>
  )
}
