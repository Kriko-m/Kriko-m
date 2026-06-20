'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

export default function ThemeSynchronizer() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const isPortaal = pathname === '/portaal' || pathname.startsWith('/portaal/')

    if (isPortaal) {
      document.body.classList.add('portal-theme', 'portaal')
      document.body.style.backgroundColor = '#EEF5F1'
      document.body.style.paddingTop = (pathname === '/portaal' || pathname === '/portaal/') ? '0' : '64px'
    } else {
      document.body.classList.remove('portal-theme', 'portaal')
      document.body.style.backgroundColor = ''
      document.body.style.paddingTop = ''
    }
  }, [pathname])

  return null
}
