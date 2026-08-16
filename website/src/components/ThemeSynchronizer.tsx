'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

export default function ThemeSynchronizer() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const isPortaal = pathname === '/portaal' || pathname.startsWith('/portaal/')
    const isPortaalHome = pathname === '/portaal/home' || pathname === '/portaal/leiding' || pathname === '/portaal/home/' || pathname === '/portaal/leiding/'

    if (isPortaal) {
      document.body.classList.add('portal-theme', 'portaal')
      if (isPortaalHome) {
        document.documentElement.style.backgroundColor = '#1A3D2A'
        document.documentElement.style.overflow = 'hidden'
        document.documentElement.style.height = '100vh'
        document.body.style.backgroundColor = '#1A3D2A'
        document.body.style.paddingTop = '76px'
        document.body.style.overflow = 'hidden'
        document.body.style.height = '100vh'
      } else {
        document.documentElement.style.backgroundColor = ''
        document.documentElement.style.overflow = ''
        document.documentElement.style.height = ''
        document.body.style.backgroundColor = ''
        document.body.style.paddingTop = (pathname === '/portaal' || pathname === '/portaal/') ? '0' : '76px'
        document.body.style.overflow = ''
        document.body.style.height = ''
      }
    } else {
      document.body.classList.remove('portal-theme', 'portaal')
      document.documentElement.style.backgroundColor = ''
      document.documentElement.style.overflow = ''
      document.documentElement.style.height = ''
      document.body.style.backgroundColor = ''
      document.body.style.paddingTop = ''
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
  }, [pathname])

  return null
}
