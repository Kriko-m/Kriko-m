import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import PortaalNav from '../_components/PortaalNav'
import LeidingPanel from './LeidingPanel'
import { Kamp, Echo } from '@/lib/types'

export default async function LeidingPortaalPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portaal')

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal/dashboard')

  const naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker'
  const isAdmin = role === 'admin' || role === 'groepsleiding'

  const admin = createAdminClient()
  const [kampenRes, echosRes] = await Promise.all([
    admin.from('kampen').select('*, kamp_bestanden(*)').order('datum_van', { ascending: true }),
    admin.from('echos').select('*').order('year', { ascending: false }).order('month', { ascending: false }),
  ])

  const kampen = (kampenRes.data ?? []) as Kamp[]
  const echos = (echosRes.data ?? []) as Echo[]

  return (
    <>
      <PortaalNav naam={naam} isAdmin={isAdmin} role={role} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <a href="/portaal/dashboard" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>← Dashboard</a>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>🛡️ Leidersportaal</h1>
        </div>

        <LeidingPanel initialKampen={kampen} initialEchos={echos} role={role} />
      </main>
    </>
  )
}
