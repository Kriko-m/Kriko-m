'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import PortaalNav from './_components/PortaalNav'
import PortaalSidebar from './_components/PortaalSidebar'

interface Props {
  children: React.ReactNode
  naam: string
  isAdmin: boolean
  role?: string
}

export default function PortaalLayoutClient({ children, naam, isAdmin, role }: Props) {
  const pathname = usePathname()
  const showNav = pathname !== '/portaal' && pathname !== '/portaal/'

  return (
    <>
      {showNav && <PortaalNav naam={naam} isAdmin={isAdmin} role={role} />}
      {showNav ? (
        <div className="portaal-page-layout">
          <Suspense fallback={<aside className="portaal-sidebar-nav" />}>
            <PortaalSidebar isAdmin={isAdmin} />
          </Suspense>
          <main className="portaal-page-main">{children}</main>
        </div>
      ) : children}
    </>
  )
}
