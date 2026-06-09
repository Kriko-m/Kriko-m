import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import OuderKalenderView from './OuderKalenderView'
import { getCalendarEvents, getKampen } from '@/lib/db'
import { CalendarEvent, Kamp } from '@/lib/types'

export default async function OuderKalenderPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (isLeiding) redirect('/portaal/dashboard')

  const naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker'
  const isAdmin = role === 'admin' || role === 'groepsleiding'

  const admin = createAdminClient()
  
  // Fetch calendar events, camps, and parent's linked children
  const [events, camps, kinderenRes] = await Promise.all([
    getCalendarEvents(),
    getKampen(),
    admin.from('parent_children').select('*').eq('parent_id', user.id),
  ])

  const kinderen = kinderenRes.data ?? []

  return (
    <>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <a href="/portaal/dashboard" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>← Dashboard</a>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>📅 Mijn Kalender</h1>
        </div>
        
        <OuderKalenderView
          initialEvents={events as CalendarEvent[]}
          initialCamps={camps as Kamp[]}
          kinderen={kinderen}
        />
      </main>
    </>
  )
}
