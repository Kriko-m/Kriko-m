import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import PortaalNav from '../../_components/PortaalNav'
import KampenAdmin from './KampenAdmin'

export default async function AdminKampenPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'groepsleiding'
  if (!isAdmin) redirect('/portaal/dashboard')

  const naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker'
  const admin = createAdminClient()

  const [authRes, kampenRes] = await Promise.all([
    supabase.auth.getUser(),
    admin
      .from('kampen')
      .select('*, kamp_bestanden(*)')
      .order('datum_van', { ascending: true })
  ])

  if (authRes.error || !authRes.data.user) redirect('/portaal')
  const kampen = kampenRes.data

  return (
    <>
      <PortaalNav naam={naam} isAdmin={isAdmin} role={user.app_metadata?.role} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <a href="/portaal/admin" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>← Beheer</a>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>🏕️ Kampen beheren</h1>
        </div>
        <KampenAdmin kampen={kampen ?? []} />
      </main>
    </>
  )
}
