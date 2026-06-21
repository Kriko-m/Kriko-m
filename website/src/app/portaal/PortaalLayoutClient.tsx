'use client'

import { Suspense, useState, useEffect, useTransition } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import PortaalNav from './_components/PortaalNav'
import PortaalSidebar from './_components/PortaalSidebar'
import PortaalLoading from './loading'

interface Props {
  children: React.ReactNode
  naam: string
  isAdmin: boolean
  role?: string
}

export default function PortaalLayoutClient({ children, naam, isAdmin, role }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
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
      } catch (err) {
        // ignore
      }
    }

    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [showNav, router])

  return (
    <>
      {showNav && <PortaalNav naam={naam} isAdmin={isAdmin} role={role} />}
      {showNav ? (
        <div className="portaal-page-layout">
          <Suspense fallback={<aside className="portaal-sidebar-nav" />}>
            <PortaalSidebar isAdmin={isAdmin} />
          </Suspense>
          <main className="portaal-page-main">
            {isPending ? <PortaalLoading /> : children}
          </main>
        </div>
      ) : children}
    </>
  )
}
