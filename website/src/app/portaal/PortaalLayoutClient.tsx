'use client'

import { useEffect, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import PortaalNav from './_components/PortaalNav'

interface Props {
  children: React.ReactNode
  naam: string
  role?: string
  settings?: import('@/lib/types').Settings | null
}

export default function PortaalLayoutClient({ children, naam, role, settings }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const showNav = pathname !== '/portaal' && pathname !== '/portaal/'
  const isHomePage = pathname === '/portaal/home' || pathname === '/portaal/leiding' || pathname === '/portaal/home/' || pathname === '/portaal/leiding/'

  // Compute dynamic per-page background
  let pageBgType: 'photo' | 'color' | undefined
  let pageBgValue: string | undefined

  if (pathname.includes('/echos')) {
    pageBgType = settings?.echos_bg_type
    pageBgValue = settings?.echos_bg_value
  } else if (pathname.includes('/algemene-info')) {
    pageBgType = settings?.docs_bg_type
    pageBgValue = settings?.docs_bg_value
  } else if (pathname.includes('/agenda')) {
    pageBgType = settings?.agenda_bg_type
    pageBgValue = settings?.agenda_bg_value
  } else if (pathname.includes('/website-beheer')) {
    pageBgType = settings?.beheer_bg_type
    pageBgValue = settings?.beheer_bg_value
  }

  const customBgStyle: React.CSSProperties = {}
  if (!isHomePage) {
    if (pageBgType === 'photo' && pageBgValue) {
      customBgStyle.backgroundColor = '#2A5A40'
      customBgStyle.backgroundImage = `linear-gradient(rgba(42, 90, 64, 0.86), rgba(42, 90, 64, 0.93)), url(${pageBgValue})`
      customBgStyle.backgroundSize = 'cover'
      customBgStyle.backgroundPosition = 'center center'
      customBgStyle.backgroundAttachment = 'fixed'
    } else if (pageBgType === 'color' && pageBgValue) {
      customBgStyle.backgroundColor = pageBgValue
    } else {
      customBgStyle.backgroundColor = '#2A5A40'
    }
  }

  useEffect(() => {
    if (!showNav) return
    const activeColor = (customBgStyle.backgroundColor as string) || (isHomePage ? '#1A3D2A' : '#2A5A40')
    document.body.style.backgroundColor = activeColor
    document.documentElement.style.backgroundColor = activeColor
  }, [showNav, isHomePage, customBgStyle.backgroundColor])

  useEffect(() => {
    if (!showNav) return

    const handleGlobalClick = (e: MouseEvent) => {
      // Ignore clicks with modifiers
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return

      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      const target = anchor.getAttribute('target')
      if (target === '_blank') return

      const download = anchor.getAttribute('download')
      if (download !== null) return

      // Ignore hash links
      if (href.startsWith('#') || (href.includes('#') && href.split('#')[0] === window.location.pathname)) return

      try {
        const targetUrl = new URL(href, window.location.origin)
        const targetPathAndQuery = targetUrl.pathname + targetUrl.search
        const currentUrl = window.location.pathname + window.location.search

        if (targetUrl.origin === window.location.origin && targetPathAndQuery.startsWith('/portaal')) {
          if (targetPathAndQuery !== currentUrl) {
            e.preventDefault()
            startTransition(() => {
              router.push(href)
            })
          }
        }
      } catch {
        // ignore
      }
    }

    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [showNav, router])

  return (
    <>
      {showNav && <PortaalNav naam={naam} role={role} />}
      {showNav ? (
        <div
          className="portaal-page-layout portaal-page-layout--no-sidebar"
          style={{
            height: (pathname === '/portaal/home' || pathname === '/portaal/leiding' || pathname === '/portaal/home/' || pathname === '/portaal/leiding/') ? 'calc(100vh - 76px)' : undefined,
            overflow: (pathname === '/portaal/home' || pathname === '/portaal/leiding' || pathname === '/portaal/home/' || pathname === '/portaal/leiding/') ? 'hidden' : undefined,
          }}
        >
          <main
            className="portaal-page-main portaal-page-main--anchor"
            style={{
              width: '100%',
              height: (pathname === '/portaal/home' || pathname === '/portaal/leiding' || pathname === '/portaal/home/' || pathname === '/portaal/leiding/') ? '100%' : undefined,
              minHeight: (pathname === '/portaal/home' || pathname === '/portaal/leiding' || pathname === '/portaal/home/' || pathname === '/portaal/leiding/') ? '100%' : 'calc(100vh - 76px)',
              maxHeight: (pathname === '/portaal/home' || pathname === '/portaal/leiding' || pathname === '/portaal/home/' || pathname === '/portaal/leiding/') ? '100%' : undefined,
              overflow: (pathname === '/portaal/home' || pathname === '/portaal/leiding' || pathname === '/portaal/home/' || pathname === '/portaal/leiding/') ? 'hidden' : undefined,
              backgroundColor: (pathname === '/portaal/home' || pathname === '/portaal/leiding' || pathname === '/portaal/home/' || pathname === '/portaal/leiding/') ? '#1A3D2A' : undefined,
              ...customBgStyle,
            }}
          >
            {children}
            {isPending && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                background: 'rgba(240, 236, 228, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-finaal.png" alt="" aria-hidden="true" style={{ width: 64, height: 64, objectFit: 'contain', animation: 'portaal-pulse 1.5s infinite ease-in-out' }} />
                  <div style={{ width: 120, height: 4, background: 'rgba(194,217,201,0.8)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', height: '100%', width: '50%', background: '#1A3D2A', borderRadius: 2, animation: 'portaal-loading-bar 1.2s infinite ease-in-out' }} />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      ) : children}
    </>
  )
}
