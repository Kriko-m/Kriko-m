'use client'

import { Suspense, useEffect, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import PortaalNav from './_components/PortaalNav'
import PortaalSidebar from './_components/PortaalSidebar'

interface Props {
  children: React.ReactNode
  naam: string
  role?: string
}

export default function PortaalLayoutClient({ children, naam, role }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const showNav = pathname !== '/portaal' && pathname !== '/portaal/'

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
      {showNav && <PortaalNav naam={naam} />}
      {showNav ? (
        <div className="portaal-page-layout">
          <Suspense fallback={<aside className="portaal-sidebar-nav" />}>
            <PortaalSidebar role={role} />
          </Suspense>
          <main className="portaal-page-main portaal-page-main--anchor">
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
