import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { CalendarEvent, Kamp } from '@/lib/types'
import { AUDIENCE_NAMEN, AUDIENCE_KLEUREN } from '@/lib/constants'

const QUICK_LINKS = [
  { icon: 'fa-brands fa-google-drive', label: 'Google Drive', href: 'https://drive.google.com' },
  { icon: 'fa-solid fa-link', label: 'Belangrijke links', href: '#' },
  { icon: 'fa-brands fa-facebook', label: 'Facebook', href: 'https://www.facebook.com/ScoutsKrikoM' },
  { icon: 'fa-solid fa-users-gear', label: 'Groepsadmin', href: 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/' },
]

const TAK_KLEUREN: Record<string, string> = {
  groep: '#1A3D2A', kapoenen: '#F4C842', welpen: '#5D9E6C', jonggivers: '#4A7BBF', givers: '#C9963A',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    day: d.toLocaleDateString('nl-BE', { day: '2-digit' }),
    month: d.toLocaleDateString('nl-BE', { month: 'short' }),
  }
}

function formatDateRange(van: string, tot: string) {
  const from = new Date(van).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
  const to = new Date(tot).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
  return `${from} – ${to}`
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const { data: { user: verified }, error } = await supabase.auth.getUser()
  if (error || !verified) redirect('/portaal')

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal')

  const today = new Date().toISOString().split('T')[0]
  const admin = createAdminClient()
  const [calendarRes, kampenRes] = await Promise.all([
    admin.from('calendar').select('*').gte('date', today).order('date', { ascending: true }).limit(6),
    admin.from('kampen').select('id, naam, datum_van, datum_tot, tak, locatie').gte('datum_van', today).order('datum_van', { ascending: true }).limit(4),
  ])

  const calendarEvents = (calendarRes.data ?? []) as CalendarEvent[]
  const kampen = (kampenRes.data ?? []) as Kamp[]

  return (
    <div className="portaal-dashboard-bg-wrapper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/leiding_25-26.jpg" className="portaal-dashboard-bg-img" alt="" aria-hidden="true" />

      <div className="portaal-dashboard-card">

        {/* Quick links */}
        <div className="portaal-quicklinks">
          {QUICK_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              target={link.href !== '#' ? '_blank' : undefined}
              rel="noreferrer"
              className="portaal-quicklink-card"
            >
              <i className={link.icon}></i>
              <span>{link.label}</span>
            </a>
          ))}
        </div>

        {/* Body grid: calendar left, events + message right */}
        <div className="portaal-dash-body-grid">

          {/* Calendar */}
          <div className="portaal-cal-widget">
            <h3>Kalender</h3>
            {calendarEvents.length === 0 ? (
              <p style={{ color: '#6A8A75', fontSize: '.85rem', margin: 0 }}>Geen activiteiten gepland.</p>
            ) : (
              calendarEvents.map(ev => {
                const { day, month } = formatDate(ev.date)
                return (
                  <div key={ev.id} className="portaal-cal-event-row">
                    <div className="portaal-cal-date">
                      <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1 }}>{day}</div>
                      <div style={{ fontSize: '.65rem', opacity: .85 }}>{month}</div>
                    </div>
                    <div className="portaal-cal-event-info">
                      <div className="portaal-cal-event-title">{ev.is_evenement ? '⭐ ' : ''}{ev.title}</div>
                      {ev.location && <div className="portaal-cal-event-sub"><i className="fa-solid fa-location-dot" style={{ marginRight: 4 }}></i>{ev.location}</div>}
                      {ev.audience && ev.audience.length > 0 && (
                        <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                          {ev.audience.map(a => (
                            <span key={a} style={{ padding: '1px 7px', borderRadius: 20, fontSize: '.68rem', fontWeight: 700, background: AUDIENCE_KLEUREN[a] || '#1A3D2A', color: a === 'kapoenen' ? '#3a2a00' : '#fff' }}>
                              {AUDIENCE_NAMEN[a]}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right column */}
          <div className="portaal-dash-right-col">

            {/* Upcoming camps */}
            <div className="portaal-events-widget">
              <h3>Kampen &amp; Weekenden</h3>
              {kampen.length === 0 ? (
                <p style={{ color: '#6A8A75', fontSize: '.85rem', margin: 0 }}>Geen aankomende kampen.</p>
              ) : (
                kampen.map(k => (
                  <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #ece9e3', fontSize: '.86rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: TAK_KLEUREN[k.tak] || '#1A3D2A', flexShrink: 0 }}></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#1A3D2A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.naam}</div>
                      <div style={{ fontSize: '.76rem', color: '#6A8A75' }}>{formatDateRange(k.datum_van, k.datum_tot)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Groepsleiding message */}
            <div className="portaal-msg-widget">
              <h3>Berichtje van de groepsleiding</h3>
              <p>Geen bericht momenteel.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
