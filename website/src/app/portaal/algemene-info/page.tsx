import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'

export const metadata = { title: 'Algemene info – Portaal' }

// Action cards (zoals op de takpagina's). Voorlopig enkel "How to camp";
// verdere inhoud volgt later.
const ACTIONS = [
  {
    icon: 'fa-solid fa-tent',
    label: 'How to camp',
    href: '#',
    desc: 'Alles wat je moet weten om een kamp te organiseren.',
  },
]

export default async function AlgemeneInfoPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')

  const { data: { user: verified }, error } = await supabase.auth.getUser()
  if (error || !verified) redirect('/portaal')

  const role = verified.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal')

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: '#1A3D2A', fontWeight: 900, fontSize: '1.6rem' }}>Algemene info</h1>
        <p style={{ margin: '6px 0 0', color: '#6A8A75', fontSize: '.92rem' }}>
          Handige info en richtlijnen voor de leiding.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {ACTIONS.map(action => (
          <Link
            key={action.label}
            href={action.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: '36px 22px', border: '2px solid #C2D9C9', borderRadius: 16,
              background: '#fff', textAlign: 'center', textDecoration: 'none', color: '#1A3D2A',
            }}
          >
            <i className={action.icon} style={{ fontSize: '2.4rem', color: '#1A3D2A' }} />
            <strong style={{ fontSize: '1rem' }}>{action.label}</strong>
            <span style={{ fontSize: '.84rem', color: '#6A8A75', lineHeight: 1.4 }}>{action.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
