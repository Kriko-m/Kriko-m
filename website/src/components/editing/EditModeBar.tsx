'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function EditModeBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isLeiding, setIsLeiding] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    // Check edit query param or localStorage state
    const editQuery = searchParams.get('edit') === 'true'
    const storedEdit = localStorage.getItem('kriko_edit_mode') === 'true'
    const active = editQuery || storedEdit
    setIsEditMode(active)

    // Check if user is logged in as leiding via browser cookie / session endpoint
    fetch('/api/admin/portal-resources')
      .then(res => {
        if (res.ok) setIsLeiding(true)
      })
      .catch(() => setIsLeiding(false))
  }, [searchParams])

  function toggleEditMode() {
    const nextState = !isEditMode
    setIsEditMode(nextState)
    localStorage.setItem('kriko_edit_mode', String(nextState))
    
    if (nextState) {
      router.push(`${pathname}?edit=true`)
    } else {
      router.push(pathname)
    }
  }

  if (!isLeiding) return null

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 99999,
      backgroundColor: '#1A3D2A',
      color: '#fff',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.86rem',

      fontWeight: 700,
      fontFamily: 'var(--font-body, Outfit, sans-serif)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      flexWrap: 'wrap',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ backgroundColor: '#C9963A', color: '#1A3D2A', padding: '2px 8px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 900 }}>
          GROEPSLEIDING
        </span>
        <span>
          {isEditMode ? '✏️ Live Bewerkmodus is ACTIEF (Hover over onderdelen om ze te bewerken)' : '👁️ Je bekijkt de site als Bezoeker'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggleEditMode}
          type="button"
          style={{
            backgroundColor: isEditMode ? '#C9963A' : 'rgba(255,255,255,0.15)',
            color: isEditMode ? '#1A3D2A' : '#fff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: 8,
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.82rem',
            transition: 'all 0.15s ease',
          }}
        >
          {isEditMode ? '👁️ Bekijk als Bezoeker' : '✏️ Schakel Bewerkmodus In'}
        </button>

        <Link
          href="/portaal/home"
          style={{
            color: 'rgba(255,255,255,0.85)',
            textDecoration: 'none',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          &larr; Leidingsportaal
        </Link>
      </div>
    </div>
  )
}
