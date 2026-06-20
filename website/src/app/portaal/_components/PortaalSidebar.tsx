'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  isAdmin: boolean
}

export default function PortaalSidebar({ isAdmin }: Props) {
  const pathname = usePathname()

  const links = [
    { href: '/portaal/dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
    { href: '/portaal/leiding', label: 'Leiding', icon: 'fa-solid fa-shield-halved' },
    { href: '/portaal/verslagen', label: 'Verslagen', icon: 'fa-solid fa-clipboard-list' },
    { href: '/portaal/archief', label: 'Archief', icon: 'fa-solid fa-folder-open' },
    ...(isAdmin ? [{ href: '/portaal/admin', label: 'Beheer', icon: 'fa-solid fa-gear' }] : []),
  ]

  return (
    <aside className="portaal-sidebar-nav">
      {links.map(l => {
        const active = pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`portaal-sidebar-link${active ? ' active' : ''}`}
          >
            <i className={l.icon}></i>
            <span>{l.label}</span>
          </Link>
        )
      })}
    </aside>
  )
}
