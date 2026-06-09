'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useEffect } from 'react'

interface Props {
  naam: string
  isAdmin: boolean
  role?: string
}

export default function PortaalNav({ naam, isAdmin, role }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    document.body.classList.add('portal-theme', 'portaal')
    return () => {
      document.body.classList.remove('portal-theme', 'portaal')
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    try { localStorage.removeItem('kriko_cart') } catch {}
    router.push('/portaal')
    router.refresh()
  }

  const isLeiding = isAdmin || role === 'leiding'

  const links = isLeiding
    ? [
        { href: '/portaal/dashboard', label: '🏠 Dashboard' },
        { href: '/portaal/leiding', label: '🛡️ Leiding' },
        { href: '/portaal/verslagen', label: '📋 Verslagen' },
        ...(isAdmin ? [{ href: '/portaal/admin', label: '⚙️ Beheer' }] : []),
      ]
    : [
        { href: '/portaal/dashboard', label: '🏠 Dashboard' },
        { href: '/portaal/kinderen', label: '👧 Leden' },
        { href: '/portaal/kampen', label: '🏕️ Kampen' },
        { href: '/portaal/echos', label: '📰 Echo\'s' },
        { href: '/portaal/bestellingen', label: '🛍️ Bestellingen' },
      ]

  return (
    <header style={{ background: '#1A3D2A', color: '#fff', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,.15)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
        <Link href="/portaal/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <Image src="/images/logo-finaal.png" alt="Kriko-M" width={36} height={36} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900, fontSize: '1.1rem', color: '#fff', letterSpacing: '.04em' }}>Portaal</span>
        </Link>

        <nav style={{ display: 'flex', gap: 2, flex: 1, flexWrap: 'wrap' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: '.82rem', fontWeight: 600, textDecoration: 'none',
                color: pathname.startsWith(l.href) ? '#C9963A' : 'rgba(255,255,255,.75)',
                background: pathname.startsWith(l.href) ? 'rgba(201,150,58,.12)' : 'none',
              }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.6)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{naam}</span>
          <button onClick={handleLogout}
            style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,.3)', background: 'none', color: 'rgba(255,255,255,.8)', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer' }}>
            Uitloggen
          </button>
        </div>
      </div>
    </header>
  )
}
