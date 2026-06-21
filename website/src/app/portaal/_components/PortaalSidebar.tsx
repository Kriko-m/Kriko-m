'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface Props {
  isAdmin: boolean
}

const TAKKEN = [
  { key: 'kapoenen', label: 'Kapoenen' },
  { key: 'welpen', label: 'Welpen' },
  { key: 'jonggivers', label: 'Jonggivers' },
  { key: 'givers', label: 'Givers' },
]

export default function PortaalSidebar({ isAdmin: _isAdmin }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTak = searchParams.get('tak') || ''

  const onLeidingPage = pathname === '/portaal/leiding' || pathname.startsWith('/portaal/leiding/')

  return (
    <aside className="portaal-sidebar-nav">
      {/* Home */}
      <Link
        href="/portaal/dashboard"
        className={`portaal-sidebar-link${pathname === '/portaal/dashboard' ? ' active' : ''}`}
      >
        <i className="fa-solid fa-house" style={{ width: 18, textAlign: 'center', fontSize: '0.9rem' }}></i>
        <span>Home</span>
      </Link>

      {/* Kalender */}
      <Link
        href="/portaal/leiding/agenda"
        className={`portaal-sidebar-link${pathname === '/portaal/leiding/agenda' ? ' active' : ''}`}
      >
        <i className="fa-solid fa-calendar-days" style={{ width: 18, textAlign: 'center', fontSize: '0.9rem' }}></i>
        <span>Kalender</span>
      </Link>

      {/* Tak links */}
      {TAKKEN.map(tak => {
        const isTakActive = onLeidingPage && activeTak === tak.key

        return (
          <Link
            key={tak.key}
            href={`/portaal/leiding?tak=${tak.key}`}
            className={`portaal-sidebar-tak${isTakActive ? ' active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <span>{tak.label}</span>
            <i className={`fa-solid fa-chevron-${isTakActive ? 'down' : 'right'}`}></i>
          </Link>
        )
      })}
    </aside>
  )
}
