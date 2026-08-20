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



  // Clear website edit mode whenever navigating inside the portal
  useEffect(() => {
    try {
      sessionStorage.removeItem('kriko_edit_mode')
      localStorage.removeItem('kriko_edit_mode')
    } catch {}
  }, [])

  const activeColor = '#F2F6F4'

  useEffect(() => {
    if (!showNav) return
    document.body.style.backgroundColor = activeColor
    document.documentElement.style.backgroundColor = activeColor
    document.body.style.backgroundImage = ''
    return () => {
      document.body.style.backgroundImage = ''
    }
  }, [showNav, activeColor])

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
        >
          <main
            className="portaal-page-main portaal-page-main--anchor"
            style={{
              width: '100%',
              backgroundColor: '#F2F6F4',
            }}
          >
            {children}
            {isPending && (
              <div
                className="portaal-loading-overlay"
                style={{
                  position: 'fixed',
                  top: 76,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  background: 'rgba(240, 236, 228, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 110,
                }}
              >
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
