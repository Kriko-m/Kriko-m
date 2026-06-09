'use client'

import { usePathname } from 'next/navigation'
import PortaalNav from './_components/PortaalNav'

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
      {children}
    </>
  )
}
