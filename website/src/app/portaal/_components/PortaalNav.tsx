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
    <header className="portaal-nav">
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
        <Link href="/portaal/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <Image src="/images/logo-finaal.png" alt="Kriko-M" width={36} height={36} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900, fontSize: '1.1rem', color: '#fff', letterSpacing: '.04em' }}>Portaal</span>
        </Link>

        <nav style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap', justifyContent: 'flex-start', paddingLeft: 24 }}>
          {links.map(l => {
            const active = pathname.startsWith(l.href)
            return (
              <Link key={l.href} href={l.href}
                style={{
                  padding: '8px 16px',
                  borderRadius: 50,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-heading, Nunito, sans-serif)',
                  color: active ? '#C9963A' : 'rgba(255,255,255,.8)',
                  background: active ? 'rgba(201,150,58,0.12)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}>
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <span style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.6)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{naam}</span>
          <button onClick={handleLogout} className="btn"
            style={{
              padding: '6px 16px',
              borderRadius: 50,
              border: '1.5px solid rgba(255,255,255,.3)',
              background: 'transparent',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: 'none',
              fontFamily: 'var(--font-heading, Nunito, sans-serif)',
              transition: 'all var(--transition-fast)'
            }}>
            Uitloggen
          </button>
        </div>
      </div>
    </header>
  )
}
