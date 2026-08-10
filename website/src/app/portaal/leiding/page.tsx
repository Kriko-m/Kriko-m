import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import LeidingPanel from './LeidingPanel'
import { Kamp, Echo, CalendarEvent, TodoItem } from '@/lib/types'
import { getActiveWerkjaar } from '@/lib/db'
import { PORTAAL_TAKKEN, GROEPSLEIDING_ONLY_TAKKEN } from '@/lib/constants'

export default async function LeidingPortaalPage({
  searchParams,
}: {
  searchParams: Promise<{ tak?: string; tab?: string; month?: string; kamp?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal')
  const isGroepsleiding = role === 'admin' || role === 'groepsleiding'

  const { tak, tab, month, kamp } = await searchParams

  // De generieke /portaal/leiding bestaat niet meer: er moet altijd een geldige
  // tak zijn. Onbekende of afgeschermde takken sturen we terug naar de home.
  if (!tak || !(PORTAAL_TAKKEN as readonly string[]).includes(tak)) redirect('/portaal/home')
  if ((GROEPSLEIDING_ONLY_TAKKEN as readonly string[]).includes(tak) && !isGroepsleiding) {
    redirect('/portaal/home')
  }

  const werkjaar = await getActiveWerkjaar()

  const admin = createAdminClient()
  const [authRes, echosRes, calendarRes, settingsRes, todosRes] = await Promise.all([
    supabase.auth.getUser(),
    admin.from('echos').select('*').order('year', { ascending: false }).order('month', { ascending: false }),
    admin.from('calendar').select('*').order('date', { ascending: true }),
    admin.from('settings').select('leiding_ics_token, portal_backgrounds, takken').eq('id', 1).single(),
    admin.from('todos').select('*').eq('tak', tak).eq('werkjaar', werkjaar).order('created_at', { ascending: true }),
  ])

  if (authRes.error || !authRes.data.user) redirect('/portaal')

  const echos = (echosRes.data ?? []) as Echo[]
  const calendarEvents = (calendarRes.data ?? []) as CalendarEvent[]
  const icsToken = (settingsRes.data?.leiding_ics_token ?? '') as string
  const portalBackgrounds = (settingsRes.data?.portal_backgrounds ?? {}) as Record<string, { style: string; custom_url?: string }>
  const takSettings = (settingsRes.data?.takken ?? {}) as Record<string, { email?: string }>
  const takConfigs = (settingsRes.data?.takken ?? {}) as Record<string, Record<string, unknown>>
  const takEmails: Record<string, string> = Object.fromEntries(
    Object.entries(takSettings).map(([k, v]) => [k, v?.email ?? ''])
  )
  const todos = (todosRes.data ?? []) as TodoItem[]

  return (
    <LeidingPanel
      key={`${tak}-${tab ?? 'kalender'}-${month ?? ''}`}
      initialEchos={echos}
      initialCalendar={calendarEvents}
      initialTodos={todos}
      role={role}
      icsToken={icsToken}
      initialTak={tak}
      initialTab={tab}
      initialMonth={month ? Number(month) : undefined}
      portalBackgrounds={portalBackgrounds}
      takEmails={takEmails}
      takConfigs={takConfigs}
    />
  )
}
