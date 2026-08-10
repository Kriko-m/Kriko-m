'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { PORTAAL_TAKKEN, GROEPSLEIDING_ONLY_TAKKEN, TAK_NAMEN } from '@/lib/constants'

interface Props {
  role?: string
}

export default function PortaalSidebar({ role }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTak = searchParams.get('tak') || ''

  const onLeidingPage = pathname === '/portaal/leiding' || pathname.startsWith('/portaal/leiding/')
  const isGroepsleiding = role === 'admin' || role === 'groepsleiding'

  // Groepsleiding-only takken verbergen voor gewone leiding.
  const takken = PORTAAL_TAKKEN.filter(
    tak => isGroepsleiding || !(GROEPSLEIDING_ONLY_TAKKEN as readonly string[]).includes(tak)
  )

  return (
    <aside className="portaal-sidebar-nav">
      {/* Home */}
      <Link
        href="/portaal/home"
        className={`portaal-sidebar-link${pathname === '/portaal/home' ? ' active' : ''}`}
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

      {/* Algemene info */}
      <Link
        href="/portaal/algemene-info"
        className={`portaal-sidebar-link${pathname === '/portaal/algemene-info' ? ' active' : ''}`}
      >
        <i className="fa-solid fa-circle-info" style={{ width: 18, textAlign: 'center', fontSize: '0.9rem' }}></i>
        <span>Algemene info</span>
      </Link>

      {/* Tak links */}
      {takken.map(tak => {
        const isTakActive = onLeidingPage && activeTak === tak

        return (
          <Link
            key={tak}
            href={`/portaal/leiding?tak=${tak}`}
            className={`portaal-sidebar-tak${isTakActive ? ' active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <span>{TAK_NAMEN[tak] ?? tak}</span>
          </Link>
        )
      })}
    </aside>
  )
}
