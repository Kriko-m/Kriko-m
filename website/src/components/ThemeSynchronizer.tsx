'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

export default function ThemeSynchronizer() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const isPortaal = pathname === '/portaal' || pathname.startsWith('/portaal/')

    if (isPortaal) {
      document.body.classList.add('portal-theme', 'portaal')
      document.documentElement.style.backgroundColor = '#D9D9D9'
      document.documentElement.style.overflow = ''
      document.documentElement.style.height = ''
      document.body.style.backgroundColor = '#D9D9D9'
      document.body.style.paddingTop = '0'
      document.body.style.overflow = ''
      document.body.style.height = ''
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
