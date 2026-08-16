'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  role?: string
}

export default function PortaalSidebar({ role }: Props) {
  const pathname = usePathname()
  const isGroepsleiding = role === 'admin' || role === 'groepsleiding'

  return (
    <aside className="portaal-sidebar-nav">
      {/* 1. Home */}
      <Link
        href="/portaal/home"
        className={`portaal-sidebar-link${pathname === '/portaal/home' || pathname === '/portaal/leiding' ? ' active' : ''}`}
      >
        <i className="fa-solid fa-house" style={{ width: 18, textAlign: 'center', fontSize: '0.9rem' }}></i>
        <span>Home</span>
      </Link>

      {/* 2. Echo pagina */}
      <Link
        href="/portaal/echos"
        className={`portaal-sidebar-link${pathname === '/portaal/echos' ? ' active' : ''}`}
      >
        <i className="fa-solid fa-newspaper" style={{ width: 18, textAlign: 'center', fontSize: '0.9rem' }}></i>
        <span>Kriko Echo</span>
      </Link>

      {/* 3. Documenten & Links */}
      <Link
        href="/portaal/algemene-info"
        className={`portaal-sidebar-link${pathname === '/portaal/algemene-info' ? ' active' : ''}`}
      >
        <i className="fa-solid fa-folder-open" style={{ width: 18, textAlign: 'center', fontSize: '0.9rem' }}></i>
        <span>Documenten & Links</span>
      </Link>

      {/* 4. Kalender / Agenda */}
      <Link
        href="/portaal/leiding/agenda"
        className={`portaal-sidebar-link${pathname === '/portaal/leiding/agenda' ? ' active' : ''}`}
      >
        <i className="fa-solid fa-calendar-days" style={{ width: 18, textAlign: 'center', fontSize: '0.9rem' }}></i>
        <span>Kalender</span>
      </Link>

      {/* 5. Website Beheer — Enkel voor Groepsleiding */}
      {isGroepsleiding && (
        <Link
          href="/portaal/website-beheer"
          className={`portaal-sidebar-link${pathname === '/portaal/website-beheer' ? ' active' : ''}`}
        >
          <i className="fa-solid fa-globe" style={{ width: 18, textAlign: 'center', fontSize: '0.9rem' }}></i>
          <span>Website Beheer</span>
        </Link>
      )}
    </aside>
  )
}
