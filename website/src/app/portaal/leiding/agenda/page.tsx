import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import LeidingCalendar from '../../_components/LeidingCalendar'
import { Kamp, CalendarEvent } from '@/lib/types'

export default async function FullAgendaPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal')

  const admin = createAdminClient()
  const [authRes, kampenRes, calendarRes, settingsRes] = await Promise.all([
    supabase.auth.getUser(),
    admin.from('kampen').select('*, kamp_bestanden(*)').order('datum_van', { ascending: true }),
    admin.from('calendar').select('*').order('date', { ascending: true }),
    admin.from('settings').select('leiding_ics_token').eq('id', 1).single(),
  ])

  if (authRes.error || !authRes.data.user) redirect('/portaal')

  const kampen = (kampenRes.data ?? []) as Kamp[]
  const calendarEvents = (calendarRes.data ?? []) as CalendarEvent[]
  const icsToken = (settingsRes.data?.leiding_ics_token ?? '') as string
  const canPublish = role === 'admin' || role === 'groepsleiding'

  return (
    <div className="portaal-dashboard-bg-wrapper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-bg.webp"
        className="portaal-dashboard-bg-img"
        alt=""
        aria-hidden="true"
      />

      <div className="portaal-dashboard-card">
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1A3D2A', fontFamily: 'var(--font-heading, Nunito, sans-serif)', marginBottom: 20 }}>
          📅 Volledige Agenda
        </h2>
        <LeidingCalendar
          initialCalendar={calendarEvents}
          kampen={kampen}
          canPublish={canPublish}
          icsToken={icsToken}
        />
      </div>
    </div>
  )
}
