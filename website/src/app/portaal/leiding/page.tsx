import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import LeidingPanel from './LeidingPanel'
import { Kamp, Echo, CalendarEvent } from '@/lib/types'

export default async function LeidingPortaalPage({
  searchParams,
}: {
  searchParams: Promise<{ tak?: string; tab?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal/dashboard')

  const { tak, tab } = await searchParams

  const admin = createAdminClient()
  const [authRes, kampenRes, echosRes, calendarRes] = await Promise.all([
    supabase.auth.getUser(),
    admin.from('kampen').select('*, kamp_bestanden(*)').order('datum_van', { ascending: true }),
    admin.from('echos').select('*').order('year', { ascending: false }).order('month', { ascending: false }),
    admin.from('calendar').select('*').order('date', { ascending: true }),
  ])

  if (authRes.error || !authRes.data.user) redirect('/portaal')

  const kampen = (kampenRes.data ?? []) as Kamp[]
  const echos = (echosRes.data ?? []) as Echo[]
  const calendarEvents = (calendarRes.data ?? []) as CalendarEvent[]

  return (
    <>
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <a href="/portaal/dashboard" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>← Dashboard</a>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>🛡️ Leidersportaal</h1>
        </div>

        <LeidingPanel
          initialKampen={kampen}
          initialEchos={echos}
          initialCalendar={calendarEvents}
          role={role}
          initialTak={tak}
          initialTab={tab}
        />
      </main>
    </>
  )
}
