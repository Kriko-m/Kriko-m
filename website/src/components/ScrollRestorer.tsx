'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollRestorer() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [pathname])

  return null
}
