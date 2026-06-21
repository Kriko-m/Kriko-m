'use client'
import { useState } from 'react'

const MONTHS = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']

interface Event { id: string; date: string; title: string; time?: string; evenement?: boolean }

export default function CalendarGrid({ events }: { events: Event[] }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const todayKey = today.toISOString().slice(0,10)

  const byDate: Record<string, Event[]> = {}
  events.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e) })

  const futureKeys = Object.keys(byDate).filter(k => k >= todayKey).sort()
  const initMonth = futureKeys.length
    ? new Date(+futureKeys[0].slice(0,4), +futureKeys[0].slice(5,7)-1, 1)
    : new Date(today.getFullYear(), today.getMonth(), 1)

  const [view, setView] = useState(initMonth)
  const [selected, setSelected] = useState<string|null>(null)

  const year = view.getFullYear(), month = view.getMonth()
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month+1, 0).getDate()

  const toKey = (y:number,m:number,d:number) =>
    `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  function scrollToEvent(id: string) {
    const el = document.getElementById(`event-${id}`)
    if (!el) return
    document.querySelectorAll('.cal-event.highlight').forEach(e => e.classList.remove('highlight'))
    el.classList.add('highlight')
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => el.classList.remove('highlight'), 1600)
  }

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(<span key={`e${i}`} className="cal-day empty" />)
  for (let d = 1; d <= daysInMonth; d++) {
    const key = toKey(year, month, d)
    const dayEvents = byDate[key]
    const hasEvenement = dayEvents?.some(e => e.evenement)
    cells.push(
      dayEvents ? (
        <button
          key={key} type="button"
          className={`cal-day has-event${hasEvenement?' has-evenement':''}${key===todayKey?' today':''}${key===selected?' selected':''}`}
          title={dayEvents.map(e=>e.title).join(', ')}
          onClick={() => {
            setSelected(key)
            scrollToEvent(dayEvents[0].id)
          }}
        >
          {d}<span className="cal-day-dot"/>
        </button>
      ) : (
        <span key={key} className={`cal-day${key===todayKey?' today':''}${key===selected?' selected':''}`}>{d}</span>
      )
    )
  }

  return (
    <div className="cal-calendar" id="cal-calendar">
      <div className="cal-cal-header">
        <span className="cal-cal-title">{MONTHS[month]} {year}</span>
        <div className="cal-cal-nav">
          <button type="button" className="cal-today-btn"
            disabled={year===today.getFullYear()&&month===today.getMonth()}
            onClick={() => { setView(new Date(today.getFullYear(),today.getMonth(),1)); setSelected(null) }}>
            Vandaag
          </button>
          <button type="button" className="cal-nav-btn" aria-label="Vorige maand"
            onClick={() => setView(new Date(year,month-1,1))}>
            <i className="fa-solid fa-chevron-left"/>
          </button>
          <button type="button" className="cal-nav-btn" aria-label="Volgende maand"
            onClick={() => setView(new Date(year,month+1,1))}>
            <i className="fa-solid fa-chevron-right"/>
          </button>
        </div>
      </div>
      <div className="cal-weekdays">
        <span>Ma</span><span>Di</span><span>Wo</span><span>Do</span><span>Vr</span><span>Za</span><span>Zo</span>
      </div>
      <div className="cal-days">{cells}</div>
      <div className="cal-legend">
        <span className="cal-legend-item"><span className="cal-legend-dot cal-legend-today"/> Vandaag</span>
        <span className="cal-legend-item"><span className="cal-legend-dot cal-legend-event"/> Activiteit</span>
      </div>
    </div>
  )
}
