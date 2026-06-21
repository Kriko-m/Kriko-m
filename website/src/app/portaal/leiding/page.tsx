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
  if (!isLeiding) redirect('/portaal')

  const { tak, tab } = await searchParams

  const admin = createAdminClient()
  const [authRes, kampenRes, echosRes, calendarRes, settingsRes] = await Promise.all([
    supabase.auth.getUser(),
    admin.from('kampen').select('*, kamp_bestanden(*)').order('datum_van', { ascending: true }),
    admin.from('echos').select('*').order('year', { ascending: false }).order('month', { ascending: false }),
    admin.from('calendar').select('*').order('date', { ascending: true }),
    admin.from('settings').select('leiding_ics_token').eq('id', 1).single(),
  ])

  if (authRes.error || !authRes.data.user) redirect('/portaal')

  const kampen = (kampenRes.data ?? []) as Kamp[]
  const echos = (echosRes.data ?? []) as Echo[]
  const calendarEvents = (calendarRes.data ?? []) as CalendarEvent[]
  const icsToken = (settingsRes.data?.leiding_ics_token ?? '') as string

  return (
    <>
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px 80px' }}>
        <LeidingPanel
          key={`${tak ?? 'groep'}-${tab ?? 'kalender'}`}
          initialKampen={kampen}
          initialEchos={echos}
          initialCalendar={calendarEvents}
          role={role}
          icsToken={icsToken}
          initialTak={tak}
          initialTab={tab}
        />
      </main>
    </>
  )
}
