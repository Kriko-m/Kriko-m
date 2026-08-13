'use client'

import { useState } from 'react'
import { CalendarEvent } from '@/lib/types'
import UpcomingEvent, { EventDetailDialog } from './EventDetailModal'
import { getEventIcon } from '@/lib/calendar'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
]

const WEEKDAY_NAMES = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

interface CalendarMonthGridProps {
  events: CalendarEvent[]
  todayMs: number
}

export default function CalendarMonthGrid({ events, todayMs }: CalendarMonthGridProps) {
  const today = new Date(todayMs)
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDay = today.getDate()

  const [currentYear, setCurrentYear] = useState(todayYear)
  const [currentMonth, setCurrentMonth] = useState(todayMonth)
  const [activeModalEvent, setActiveModalEvent] = useState<CalendarEvent | null>(null)

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleToday = () => {
    setCurrentYear(todayYear)
    setCurrentMonth(todayMonth)
  }

  // Calculate calendar grid cells
  // First day of month (0 = Monday, 6 = Sunday)
  const firstDayObj = new Date(currentYear, currentMonth, 1)
  const startingDayOfWeek = (firstDayObj.getDay() + 6) % 7

  // Total days in current month
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Total days in previous month
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  // Build grid days array
  const gridCells = []

  // 1. Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i
    const prevM = currentMonth === 0 ? 11 : currentMonth - 1
    const prevY = currentMonth === 0 ? currentYear - 1 : currentYear
    gridCells.push({
      dateStr: formatDateStr(prevY, prevM, dayNum),
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  // 2. Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const isToday =
      currentYear === todayYear && currentMonth === todayMonth && d === todayDay
    gridCells.push({
      dateStr: formatDateStr(currentYear, currentMonth, d),
      dayNumber: d,
      isCurrentMonth: true,
      isToday,
    })
  }

  // 3. Next month leading days (fill up to complete weeks: 35 or 42 cells)
  const totalCellsNeeded = gridCells.length > 35 ? 42 : 35
  const remainingCells = totalCellsNeeded - gridCells.length
  const nextM = currentMonth === 11 ? 0 : currentMonth + 1
  const nextY = currentMonth === 11 ? currentYear + 1 : currentYear

  for (let d = 1; d <= remainingCells; d++) {
    gridCells.push({
      dateStr: formatDateStr(nextY, nextM, d),
      dayNumber: d,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  // Helper: check if event lands on or covers a date
  const getEventsForDate = (dateStr: string) => {
    return events.filter((e) => {
      const startDate = e.date
      const endDate = e.datum_tot || e.date
      return dateStr >= startDate && dateStr <= endDate
    })
  }

  return (
    <div className="cal-grid-wrapper">
      <div className="cal-grid-header">
        <div className="cal-grid-title-group">
          <h2 className="cal-grid-month-title">
            <i className="fa-regular fa-calendar-days"></i> {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="cal-grid-nav">
          <button
            type="button"
            className="cal-grid-nav-btn"
            onClick={handlePrevMonth}
            aria-label="Vorige maand"
            title="Vorige maand"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            type="button"
            className="cal-grid-today-btn"
            onClick={handleToday}
          >
            Vandaag
          </button>
          <button
            type="button"
            className="cal-grid-nav-btn"
            onClick={handleNextMonth}
            aria-label="Volgende maand"
            title="Volgende maand"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="cal-grid-weekdays">
        {WEEKDAY_NAMES.map((name) => (
          <div key={name} className="cal-grid-weekday">
            {name}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="cal-grid-days">
        {gridCells.map((cell, idx) => {
          const dayEvents = getEventsForDate(cell.dateStr)
          const hasEvents = dayEvents.length > 0

          return (
            <div
              key={`${cell.dateStr}-${idx}`}
              className={`cal-grid-cell ${
                !cell.isCurrentMonth ? 'cal-grid-cell--out' : ''
              } ${cell.isToday ? 'cal-grid-cell--today' : ''} ${
                hasEvents ? 'cal-grid-cell--has-events' : ''
              }`}
            >
              <div className="cal-grid-cell-top">
                <span className="cal-grid-day-number">{cell.dayNumber}</span>
                {cell.isToday && <span className="cal-grid-today-tag">Vandaag</span>}
              </div>

              <div className="cal-grid-cell-events">
                {dayEvents.map((ev) => {
                  const isNoMeeting = ev.title.toLowerCase().includes('geen vergadering')
                  let pillClass = 'pill-primary'
                  if (ev.is_evenement) pillClass = 'pill-featured'
                  else if (isNoMeeting) pillClass = 'pill-nomeeting'
                  const iconClass = getEventIcon(ev)

                  return (
                    <button
                      key={ev.id}
                      type="button"
                      className={`cal-event-pill ${pillClass}`}
                      onClick={() => setActiveModalEvent(ev)}
                      title={`${ev.title} (${ev.time || 'Hele dag'})`}
                    >
                      <i className={`fa-solid ${iconClass} pill-icon`}></i>
                      <span className="cal-event-pill-title">{ev.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal for clicked grid events */}
      {activeModalEvent && (
        <EventDetailDialog
          event={activeModalEvent}
          todayMs={todayMs}
          onClose={() => setActiveModalEvent(null)}
        />
      )}
    </div>
  )
}

function formatDateStr(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}
