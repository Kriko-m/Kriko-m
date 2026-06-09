import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase'
import PortaalNav from '../_components/PortaalNav'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker'
  const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'groepsleiding'

  // Bestellingen tellen
  const admin = createAdminClient()
  const [authRes, ordersRes, parentChildrenRes, inschrijvingenRes] = await Promise.all([
    supabase.auth.getUser(),
    admin.from('orders').select('id, status').eq('email', user.email!),
    admin.from('parent_children').select('id').eq('parent_id', user.id),
    admin.from('kampinschrijvingen').select('id').eq('door', user.id),
  ])

  if (authRes.error || !authRes.data.user) redirect('/portaal')

  const orders = ordersRes.data
  const aantalBestellingen = orders?.length ?? 0
  const openBestellingen = orders?.filter(o => o.status === 'pending').length ?? 0
  const aantalKinderen = parentChildrenRes.data?.length ?? 0
  const aantalInschrijvingen = inschrijvingenRes.data?.length ?? 0

  const voornaam = naam.split(' ')[0]

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'

  const menu = isLeiding
    ? [
        {
          href: '/portaal/leiding',
          icon: '🛡️',
          titel: 'Leidersportaal',
          desc: 'Kampen beheren en maandelijkse planningen (Echo\'s) uploaden.',
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
    : [
        {
          href: '/portaal/kinderen',
          icon: '👧',
          titel: 'Gekoppelde leden',
          desc: 'Beheer de kinderen gekoppeld aan jouw account.',
          stat: aantalKinderen > 0
            ? `${aantalKinderen} ${aantalKinderen === 1 ? 'kind' : 'kinderen'} gekoppeld`
            : 'Geen kinderen gekoppeld',
          kleur: '#F4C842',
        },
        {
          href: '/portaal/kampen',
          icon: '🏕️',
          titel: 'Kampen & Weekenden',
          desc: 'Schrijf je kinderen in voor weekenden en kampen.',
          stat: aantalInschrijvingen > 0
            ? `${aantalInschrijvingen} active ${aantalInschrijvingen === 1 ? 'inschrijving' : 'inschrijvingen'}`
            : 'Schrijf in voor een kamp',
          kleur: '#4A7BBF',
        },
        {
          href: '/portaal/echos',
          icon: '📰',
          titel: 'Kriko Echo\'s',
          desc: 'Bekijk en download de maandelijkse planningen per tak.',
          stat: 'Tak bulletins',
          kleur: '#8A9A8A',
        },
        {
          href: '/portaal/bestellingen',
          icon: '🛍️',
          titel: 'Mijn bestellingen',
          desc: 'Bekijk je bestellingen en meld betalingen.',
          stat: aantalBestellingen > 0
            ? `${openBestellingen > 0 ? openBestellingen + ' wachten op betaling · ' : ''}${aantalBestellingen} totaal`
            : 'Nog geen bestellingen',
          kleur: '#C9963A',
        },
        {
          href: '/shop',
          icon: '🛒',
          titel: 'Naar de webshop',
          desc: 'Bestel kledij, uniform en accessoires.',
          stat: 'Kriko-M merchandise',
          kleur: '#2A5C3F',
        },
      ]

  return (
    <>
      <PortaalNav naam={naam} isAdmin={isAdmin} role={user.app_metadata?.role} />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(120deg,#1A3D2A 0%,#2A5C3F 60%,#C9963A 160%)', borderRadius: 20, padding: '32px 36px', color: '#fff', marginBottom: 36, position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', right: 16, bottom: -24, fontSize: '7rem', opacity: .1, lineHeight: 1, pointerEvents: 'none' }}>⛺</span>
          <div style={{ fontSize: '.7rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(226,197,141,.85)', marginBottom: 8 }}>Ouderportaal</div>
          <h1 style={{ color: '#fff', fontSize: '1.6rem', margin: '0 0 6px', fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900 }}>
            Hallo, {voornaam}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,.82)', fontSize: '.92rem', margin: 0, lineHeight: 1.5 }}>
            {isLeiding
              ? 'Beheer en bewerk scoutsgegevens in het leidersportaal.'
              : 'Beheer alles voor jouw kinderen bij Scouts Kriko-M.'}
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
            {isLeiding ? (
              <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.85)' }}>
                Ingelogd als <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{role}</strong>
              </span>
            ) : (
              <>
                <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.7)' }}>
                  <strong style={{ color: '#fff' }}>{aantalBestellingen}</strong> {aantalBestellingen === 1 ? 'bestelling' : 'bestellingen'}
                </span>
                {openBestellingen > 0 && (
                  <span style={{ fontSize: '.85rem', color: '#f59e0b' }}>
                    ⚠ <strong>{openBestellingen}</strong> wachten op betaling
                  </span>
                )}
              </>
            )}
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
