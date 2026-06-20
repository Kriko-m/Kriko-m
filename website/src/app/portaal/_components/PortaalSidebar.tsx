'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface Props {
  isAdmin: boolean
}

const TAKKEN = [
  { key: 'kapoenen', label: 'Kapoenen' },
  { key: 'welpen', label: 'Welpen' },
  { key: 'jonggivers', label: 'Jonggivers' },
  { key: 'givers', label: 'Givers' },
]

const SUB_ITEMS = [
  { key: 'kampen', label: 'Kampen', icon: 'fa-solid fa-tent' },
  { key: 'echos', label: 'Kriko Echo', icon: 'fa-solid fa-newspaper' },
  { key: 'deadlines', label: 'Deadlines', icon: 'fa-solid fa-clock' },
]

export default function PortaalSidebar({ isAdmin: _isAdmin }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTak = searchParams.get('tak') || ''
  const activeTab = searchParams.get('tab') || ''

  const [expanded, setExpanded] = useState<string[]>(activeTak ? [activeTak] : [])

  function toggle(tak: string) {
    setExpanded(prev =>
      prev.includes(tak) ? prev.filter(t => t !== tak) : [...prev, tak]
    )
  }

  const onLeidingPage = pathname.startsWith('/portaal/leiding')

  return (
    <aside className="portaal-sidebar-nav">
      {/* Algemeen */}
      <Link
        href="/portaal/leiding?tak=groep"
        className={`portaal-sidebar-link${onLeidingPage && activeTak === 'groep' ? ' active' : ''}`}
      >
        <i className="fa-solid fa-users" style={{ width: 18, textAlign: 'center', fontSize: '0.9rem' }}></i>
        <span>Algemeen</span>
      </Link>

      {/* Tak accordion */}
      {TAKKEN.map(tak => {
        const isOpen = expanded.includes(tak.key)
        const isTakActive = onLeidingPage && activeTak === tak.key

        return (
          <div key={tak.key}>
            <button
              className={`portaal-sidebar-tak${isTakActive ? ' active' : ''}`}
              onClick={() => toggle(tak.key)}
            >
              <span>{tak.label}</span>
              <i className={`fa-solid fa-chevron-${isOpen ? 'down' : 'right'}`}></i>
            </button>

            {isOpen && (
              <div className="portaal-sidebar-sub-list">
                {SUB_ITEMS.map(sub => (
                  <Link
                    key={sub.key}
                    href={`/portaal/leiding?tak=${tak.key}&tab=${sub.key}`}
                    className={`portaal-sidebar-sub${isTakActive && activeTab === sub.key ? ' active' : ''}`}
                  >
                    <i className={sub.icon}></i>
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </aside>
  )
}
