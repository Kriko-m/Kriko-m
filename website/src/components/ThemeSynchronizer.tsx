'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ThemeSynchronizer() {
  const pathname = usePathname()

  useEffect(() => {
    const isPortaal = pathname === '/portaal' || pathname.startsWith('/portaal/')

    if (isPortaal) {
      document.body.classList.add('portal-theme', 'portaal')
      document.body.style.backgroundColor = '#EEF5F1'
      if (pathname === '/portaal' || pathname === '/portaal/') {
        document.body.style.paddingTop = '0'
      } else {
        document.body.style.paddingTop = '64px'
      }
    } else {
      document.body.classList.remove('portal-theme', 'portaal')
      document.body.style.backgroundColor = ''
      document.body.style.paddingTop = ''
    }
  }, [pathname])

  return null
}
