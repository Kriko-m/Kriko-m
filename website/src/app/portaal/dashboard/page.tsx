import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const { data: { user: verified }, error } = await supabase.auth.getUser()
  if (error || !verified) redirect('/portaal')

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  // Portaal is leiding-only sinds de ouderaccounts verdwenen.
  if (!isLeiding) redirect('/portaal')

  const isAdmin = role === 'admin' || role === 'groepsleiding'
  const naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'leiding'
  const voornaam = naam.split(' ')[0]

  const menu = [
    {
      href: '/portaal/leiding',
      icon: '🛡️',
      titel: 'Leidersportaal',
      desc: 'Kampen beheren, antwoorden bekijken en maandelijkse planningen (Echo\'s) uploaden.',
      stat: role === 'groepsleiding' ? 'Groepsleiding' : 'Takleiding',
      kleur: '#2A5C3F',
    },
    {
      href: '/portaal/verslagen',
      icon: '📋',
      titel: 'Verslagen & Notulen',
      desc: 'Bekijk notulen en documenten van vergaderingen.',
      stat: 'Leiding documenten',
      kleur: '#8A9A8A',
    },
    ...(isAdmin ? [{
      href: '/portaal/admin',
      icon: '⚙️',
      titel: 'Beheer',
      desc: 'Bestellingen beheren, instellingen en contactberichten.',
      stat: 'Groepsleiding',
      kleur: '#1A3D2A',
    }] : []),
    {
      href: '/shop',
      icon: '🛒',
      titel: 'Naar de webshop',
      desc: 'Bestel kledij, uniform en accessoires.',
      stat: 'Kriko-M merchandise',
      kleur: '#C9963A',
    },
  ]

  return (
    <>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(120deg,#1A3D2A 0%,#2A5C3F 60%,#C9963A 160%)', borderRadius: 20, padding: '32px 36px', color: '#fff', marginBottom: 36, position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', right: 16, bottom: -24, fontSize: '7rem', opacity: .1, lineHeight: 1, pointerEvents: 'none' }}>⛺</span>
          <div style={{ fontSize: '.7rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(226,197,141,.85)', marginBottom: 8 }}>Leidingsportaal</div>
          <h1 style={{ color: '#fff', fontSize: '1.6rem', margin: '0 0 6px', fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900 }}>
            Hallo, {voornaam}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,.82)', fontSize: '.92rem', margin: 0, lineHeight: 1.5 }}>
            Beheer en bewerk scoutsgegevens in het leidersportaal.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.85)' }}>
              Ingelogd als <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{role}</strong>
            </span>
          </div>
        </div>

        {/* Menu kaarten */}
        <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: '#6A8A75', marginBottom: 16 }}>Waar wil je naartoe?</h2>
        <div className="portal-dashboard-grid">
          {menu.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="dashboard-menu-card"
              style={{ '--kleur': item.kleur, '--kleur-light': `${item.kleur}22` } as React.CSSProperties}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-titel">{item.titel}</span>
              <span className="menu-desc">{item.desc}</span>
              <span className="menu-stat">
                {item.stat} &raquo;
              </span>
            </Link>
          ))}
        </div>

      </main>
    </>
  )
}
