import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import LeidingCalendar from '../../_components/LeidingCalendar'
import { CalendarEvent } from '@/lib/types'

export default async function FullAgendaPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal')

  const admin = createAdminClient()
  const [authRes, calendarRes, settingsRes] = await Promise.all([
    supabase.auth.getUser(),
    admin.from('calendar').select('*').order('date', { ascending: true }),
    admin.from('settings').select('leiding_ics_token').eq('id', 1).single(),
  ])

  if (authRes.error || !authRes.data.user) redirect('/portaal')

  const calendarEvents = (calendarRes.data ?? []) as CalendarEvent[]
  const icsToken = (settingsRes.data?.leiding_ics_token ?? '') as string
  const canPublish = role === 'admin' || role === 'groepsleiding'

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', width: '100%' }} className="portaal-page-container">
        <LeidingCalendar
          initialCalendar={calendarEvents}
          canPublish={canPublish}
          icsToken={icsToken}
          twoColumn={true}
        />
    </div>
  )
}
