'use client'
import { useState } from 'react'
import { Kamp, Echo, KampBestand, CalendarEvent } from '@/lib/types'

const TAKKEN = ['groep', 'kapoenen', 'welpen', 'jonggivers', 'givers']
const TAK_NAMEN: Record<string, string> = {
  groep: 'Groep (Algemeen)',
  kapoenen: 'Kapoenen (6-8j)',
  welpen: 'Welpen (8-11j)',
  jonggivers: 'Jonggivers (11-14j)',
  givers: 'Givers (14-17j)',
}
const TAK_KLEUREN: Record<string, string> = {
  groep: '#1A3D2A', kapoenen: '#F4C842', welpen: '#5D9E6C', jonggivers: '#4A7BBF', givers: '#C9963A', alle: '#1A3D2A',
}
const MAANDEN = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

const PAKLIJST_TEMPLATES: Record<string, string> = {
  kapoenen: `Slapen: Slaapzak, Laken, Matrashoes, Pyjama, Knuffel (onmisbaar!)
Kleding: Speelkleren (vuil worden mag), Dikke trui, Regenjas, Ondergoed, Kousen, Stevige stapschoenen, Reserve schoenen
Toilet: Handdoek, Washandje, Tandenborstel, Tandpasta, Zeep, Kam/Borstel
Diversen: Drinkbus (vooraf gevuld), Kleine rugzak (voor dagtocht), Groepsdas`,
  welpen: `Slapen: Slaapzak, Luchtbed of veldbed, Pyjama, Knuffel
Kleding: Scoutshemd & das, T-shirts (voldoende), Korte & lange broeken, Warme truien, Regenjas, Ondergoed, Kousen, Stevige wandelschoenen, Speelschoenen
Toilet: Handdoeken, Washandjes, Tandenborstel, Tandpasta, Biologisch afbreekbare zeep & shampoo
Diversen: Drinkbus, Zaklamp, Kleine rugzak, Gamelle (eetgerei in stoffen zak)`,
  jonggivers: `Slapen: Slaapzak (warm), Matje of luchtbed, Pyjama
Kleding: Scoutshemd & das, T-shirts, Korte & lange broeken, Warme trui, Regenjas & regenbroek, Ondergoed, Kousen (voldoende), Stevige wandelschoenen (ingelopen)
Toilet: Handdoek, Tandenborstel, Tandpasta, Biologisch afbreekbare zeep
Diversen: Drinkbus (min. 1L), Zaklamp/Hoofdlamp, Kleine rugzak (20-30L), Gamelle (eetgerei in stoffen zak), Zakmes`,
  givers: `Slapen: Slaapzak (warm), Matje of luchtbed, Pyjama
Kleding: Scoutshemd & das, T-shirts, Korte & lange broeken, Warme trui, Regenjas & regenbroek, Ondergoed, Kousen (voldoende), Stevige wandelschoenen (ingelopen)
Toilet: Handdoek, Tandenborstel, Tandpasta, Biologisch afbreekbare zeep
Diversen: Drinkbus (min. 1L), Zaklamp/Hoofdlamp, Kleine rugzak (20-30L), Gamelle (eetgerei in stoffen zak), Zakmes`,
  groep: `Slapen: Slaapzak, Luchtbed, Pyjama
Kleding: Scoutshemd & das, T-shirts, Broek, Regenjas, Warme trui, Sokken, Ondergoed, Wandelschoenen
Toilet: Handdoek, Washandje, Tandenborstel, Tandpasta, Zeep
Diversen: Drinkbus, Zaklamp, Bord/Beker/Bestek`
}

function parsePackingList(text: string): { categorie: string; items: string[] }[] {
  if (!text) return []
  return text.split('\n')
    .map(line => {
      const parts = line.split(':')
      if (parts.length < 2) return null
      const category = parts[0].trim()
      const items = parts[1].split(',').map(i => i.trim()).filter(Boolean)
      if (!category || items.length === 0) return null
      return { categorie: category, items }
    })
    .filter(Boolean) as { categorie: string; items: string[] }[]
}

function formatPackingList(list: { categorie: string; items: string[] }[]): string {
  if (!Array.isArray(list)) return ''
  return list.map(item => `${item.categorie}: ${item.items.join(', ')}`).join('\n')
}

interface LeidingPanelProps {
  initialKampen: Kamp[]
  initialEchos: Echo[]
  initialCalendar: CalendarEvent[]
  role: string
}

export default function LeidingPanel({ initialKampen, initialEchos, initialCalendar, role }: LeidingPanelProps) {
  const [activeTak, setActiveTak] = useState('groep')
  const [subTab, setSubTab] = useState<'kampen' | 'echos' | 'kalender'>('kalender')
  const [kampen, setKampen] = useState<Kamp[]>(initialKampen)
  const [echos, setEchos] = useState<Echo[]>(initialEchos)
  const [calendar, setCalendar] = useState<CalendarEvent[]>(initialCalendar)

  // Camp Form States
  const [showNewCampForm, setShowNewCampForm] = useState(false)
  const [newCamp, setNewCamp] = useState({ naam: '', datum_van: '', datum_tot: '', locatie: '', beschrijving: '', prijs: '', briefadres: '', contact_info: '', paklijstText: '' })
  const [editCampId, setEditCampId] = useState<string | null>(null)
  const [editCampData, setEditCampData] = useState({ naam: '', datum_van: '', datum_tot: '', locatie: '', beschrijving: '', prijs: '', briefadres: '', contact_info: '', paklijstText: '' })

  // Calendar Event Form States
  const [showNewEventForm, setShowNewEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', description: '' })
  const [editEventId, setEditEventId] = useState<string | null>(null)
  const [editEventData, setEditEventData] = useState({ title: '', date: '', time: '', location: '', description: '' })

  // Upload status states
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState('')

  function showFlash(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(''), 3000)
  }

  // Filter lists
  const takKampen = kampen.filter(k => k.tak === activeTak || (activeTak === 'groep' && k.tak === 'alle'))
  const takEchos = echos.filter(e => e.tak === activeTak)
  const takEvents = calendar.filter(e => e.tak === activeTak)

  // Load packing list template
  function applyCampTemplate(isEdit: boolean) {
    const template = PAKLIJST_TEMPLATES[activeTak] || ''
    if (isEdit) {
      setEditCampData(p => ({ ...p, paklijstText: template }))
    } else {
      setNewCamp(p => ({ ...p, paklijstText: template }))
    }
  }

  // Camp API Handlers
  async function handleCreateCamp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const parsedPaklijst = parsePackingList(newCamp.paklijstText)

    const res = await fetch('/api/admin/kampen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        naam: newCamp.naam,
        datum_van: newCamp.datum_van,
        datum_tot: newCamp.datum_tot,
        locatie: newCamp.locatie,
        beschrijving: newCamp.beschrijving,
        briefadres: newCamp.briefadres,
        contact_info: newCamp.contact_info,
        paklijst: parsedPaklijst,
        tak: activeTak === 'groep' ? 'alle' : activeTak,
        prijs: newCamp.prijs ? Number(newCamp.prijs) : 0,
        open_voor_inschrijving: false,
      }),
    })
    if (res.ok) {
      const created = await res.json()
      setKampen(prev => [...prev, created])
      setShowNewCampForm(false)
      setNewCamp({ naam: '', datum_van: '', datum_tot: '', locatie: '', beschrijving: '', prijs: '', briefadres: '', contact_info: '', paklijstText: '' })
      showFlash('Kamp/Weekend succesvol aangemaakt!')
    } else {
      showFlash('Fout bij het aanmaken van kamp.')
    }
    setLoading(false)
  }

  async function handleUpdateCamp(e: React.FormEvent, kampId: string, originalCamp: Kamp) {
    e.preventDefault()
    setLoading(true)

    const parsedPaklijst = editCampData.paklijstText !== undefined 
      ? parsePackingList(editCampData.paklijstText) 
      : originalCamp.paklijst

    const updatePayload = {
      naam: editCampData.naam || originalCamp.naam,
      datum_van: editCampData.datum_van || originalCamp.datum_van,
      datum_tot: editCampData.datum_tot || originalCamp.datum_tot,
      locatie: editCampData.locatie || originalCamp.locatie,
      beschrijving: editCampData.beschrijving || originalCamp.beschrijving,
      briefadres: editCampData.briefadres !== undefined ? editCampData.briefadres : originalCamp.briefadres,
      contact_info: editCampData.contact_info !== undefined ? editCampData.contact_info : originalCamp.contact_info,
      prijs: editCampData.prijs !== undefined ? Number(editCampData.prijs) : originalCamp.prijs,
      paklijst: parsedPaklijst
    }

    const res = await fetch(`/api/admin/kampen/${kampId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    })
    if (res.ok) {
      const updated = await res.json()
      setKampen(prev => prev.map(k => k.id === kampId ? updated : k))
      setEditCampId(null)
      showFlash('Kamp succesvol bijgewerkt!')
    } else {
      showFlash('Fout bij het opslaan van wijzigingen.')
    }
    setLoading(false)
  }

  async function handleTogglePubliek(id: string, current: boolean) {
    const res = await fetch(`/api/admin/kampen/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ open_voor_inschrijving: !current }),
    })
    if (res.ok) {
      setKampen(prev => prev.map(k => k.id === id ? { ...k, open_voor_inschrijving: !current } : k))
      showFlash(!current ? 'Kamp gepubliceerd!' : 'Kamp op privé gezet.')
    }
  }

  async function handleDeleteCamp(id: string, naam: string) {
    if (!confirm(`Weet je zeker dat je "${naam}" en alle inschrijvingen wilt verwijderen?`)) return
    const res = await fetch(`/api/admin/kampen/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setKampen(prev => prev.filter(k => k.id !== id))
      showFlash('Kamp succesvol verwijderd.')
    }
  }

  // Calendar API Handlers
  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/admin/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newEvent,
        tak: activeTak
      }),
    })
    if (res.ok) {
      const created = await res.json()
      setCalendar(prev => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)))
      setShowNewEventForm(false)
      setNewEvent({ title: '', date: '', time: '', location: '', description: '' })
      showFlash('Activiteit succesvol toegevoegd aan de kalender!')
    } else {
      showFlash('Fout bij het toevoegen van activiteit.')
    }
    setLoading(true)
    // Dynamic revalidation tag might take a sec
    setTimeout(async () => {
      const reFetch = await fetch('/api/kalender/ics').then(r => r.ok) // Ping to trigger build
      setLoading(false)
    }, 500)
  }

  async function handleUpdateEvent(e: React.FormEvent, eventId: string, originalEvent: CalendarEvent) {
    e.preventDefault()
    setLoading(true)

    const updatePayload = {
      title: editEventData.title || originalEvent.title,
      date: editEventData.date || originalEvent.date,
      time: editEventData.time !== undefined ? editEventData.time : originalEvent.time,
      location: editEventData.location !== undefined ? editEventData.location : originalEvent.location,
      description: editEventData.description !== undefined ? editEventData.description : originalEvent.description,
    }

    const res = await fetch(`/api/admin/calendar/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    })
    if (res.ok) {
      const updated = await res.json()
      setCalendar(prev => prev.map(ev => ev.id === eventId ? updated : ev).sort((a, b) => a.date.localeCompare(b.date)))
      setEditEventId(null)
      showFlash('Activiteit succesvol bijgewerkt!')
    } else {
      showFlash('Fout bij het opslaan van wijzigingen.')
    }
    setLoading(false)
  }

  async function handleDeleteEvent(id: string, title: string) {
    if (!confirm(`Weet je zeker dat je "${title}" wilt verwijderen uit de kalender?`)) return
    const res = await fetch(`/api/admin/calendar/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCalendar(prev => prev.filter(ev => ev.id !== id))
      showFlash('Activiteit verwijderd.')
    }
  }

  // Upload handlers
  async function handleUploadPhoto(e: React.ChangeEvent<HTMLInputElement>, kampId: string) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'kamp-foto')
    fd.append('kampId', kampId)

    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const updatedCamp = await res.json()
      setKampen(prev => prev.map(k => k.id === kampId ? updatedCamp : k))
      showFlash('Coverfoto geüpload!')
    } else {
      showFlash('Fout bij het uploaden van foto.')
    }
    setLoading(false)
  }

  async function handleUploadBestand(e: React.FormEvent<HTMLFormElement>, kampId: string) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const file = fd.get('bestand') as File
    const bType = fd.get('bestandType') as string
    const bNaam = fd.get('bestandNaam') as string

    if (!file || !file.size) {
      showFlash('Selecteer eerst een bestand.')
      setLoading(false)
      return
    }

    const uploadFd = new FormData()
    uploadFd.append('file', file)
    uploadFd.append('type', 'kamp-bestand')
    uploadFd.append('kampId', kampId)
    uploadFd.append('bestandType', bType)
    uploadFd.append('bestandNaam', bNaam)

    const res = await fetch('/api/admin/upload', { method: 'POST', body: uploadFd })
    if (res.ok) {
      const newBestand = await res.json()
      setKampen(prev => prev.map(k => {
        if (k.id !== kampId) return k
        return {
          ...k,
          kamp_bestanden: [...(k.kamp_bestanden || []), newBestand]
        }
      }))
      e.currentTarget.reset()
      showFlash('Bestand geüpload!')
    } else {
      showFlash('Fout bij het uploaden van bestand.')
    }
    setLoading(false)
  }

  async function handleDeleteBestand(kampId: string, bestandId: string) {
    if (!confirm('Dit bestand verwijderen?')) return
    const res = await fetch(`/api/admin/kampen/${kampId}/bestanden/${bestandId}`, { method: 'DELETE' })
    if (res.ok) {
      setKampen(prev => prev.map(k => {
        if (k.id !== kampId) return k
        return {
          ...k,
          kamp_bestanden: (k.kamp_bestanden || []).filter(b => b.id !== bestandId)
        }
      }))
      showFlash('Bestand verwijderd.')
    }
  }

  // Echo Handlers
  async function handleUploadEcho(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const file = fd.get('echoFile') as File
    const month = fd.get('echoMonth') as string
    const year = fd.get('echoYear') as string

    if (!file || !file.size) {
      showFlash('Selecteer een PDF bestand.')
      setLoading(false)
      return
    }

    const uploadFd = new FormData()
    uploadFd.append('file', file)
    uploadFd.append('type', 'echo')
    uploadFd.append('echoTak', activeTak)
    uploadFd.append('echoMonth', month)
    uploadFd.append('echoYear', year)

    const res = await fetch('/api/admin/upload', { method: 'POST', body: uploadFd })
    if (res.ok) {
      const newEcho = await res.json()
      setEchos(prev => [newEcho, ...prev])
      e.currentTarget.reset()
      showFlash('Kriko Echo geüpload!')
    } else {
      showFlash('Fout bij het uploaden van Echo.')
    }
    setLoading(false)
  }

  async function handleDeleteEcho(id: string) {
    if (!confirm('Wil je deze Kriko Echo definitief verwijderen?')) return
    const res = await fetch(`/api/admin/echos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEchos(prev => prev.filter(e => e.id !== id))
      showFlash('Echo verwijderd.')
    }
  }

  const kleur = TAK_KLEUREN[activeTak] ?? '#888'

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 5 }

  return (
    <div>
      {flash && (
        <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '12px 18px', borderRadius: 10, marginBottom: 24, fontWeight: 600 }}>
          {flash}
        </div>
      )}

      <div className="portal-grid-layout">
        {/* Sidebar: Tak selection */}
        <aside style={{ background: '#fff', border: '1px solid #C2D9C9', borderRadius: 18, padding: 18, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6A8A75', marginBottom: 12 }}>Tak selecteren</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TAKKEN.map(t => (
              <button
                key={t}
                onClick={() => { setActiveTak(t); setEditCampId(null); setShowNewCampForm(false); setEditEventId(null); setShowNewEventForm(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '2px solid transparent',
                  borderColor: activeTak === t ? TAK_KLEUREN[t] : 'transparent',
                  background: activeTak === t ? `${TAK_KLEUREN[t]}11` : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: activeTak === t ? 700 : 600,
                  color: activeTak === t ? '#1A3D2A' : '#6A8A75',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: TAK_KLEUREN[t], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 'bold' }}>
                  {t.charAt(0).toUpperCase()}
                </span>
                <span>{TAK_NAMEN[t]}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #C2D9C9', borderRadius: 18, padding: 28, boxShadow: 'var(--shadow-sm)', borderTop: `6px solid ${kleur}` }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1A3D2A', fontFamily: 'var(--font-heading, Nunito, sans-serif)', textTransform: 'capitalize', marginBottom: 20 }}>
              {TAK_NAMEN[activeTak]} beheer
            </h2>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1.5px solid #EEF5F1', paddingBottom: 14 }}>
              <button
                onClick={() => setSubTab('kalender')}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer',
                  background: subTab === 'kalender' ? '#1A3D2A' : '#EEF5F1', color: subTab === 'kalender' ? '#fff' : '#3A5A42',
                }}
              >
                📅 Tak-Kalender
              </button>
              <button
                onClick={() => setSubTab('kampen')}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer',
                  background: subTab === 'kampen' ? '#1A3D2A' : '#EEF5F1', color: subTab === 'kampen' ? '#fff' : '#3A5A42',
                }}
              >
                🏕️ Kampen &amp; Weekenden
              </button>
              {activeTak !== 'groep' && (
                <button
                  onClick={() => setSubTab('echos')}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer',
                    background: subTab === 'echos' ? '#1A3D2A' : '#EEF5F1', color: subTab === 'echos' ? '#fff' : '#3A5A42',
                  }}
                >
                  📰 Kriko Echo&apos;s
                </button>
              )}
            </div>

            {/* ─── KALENDER TAB ─── */}
            {subTab === 'kalender' && (
              <div>
                {!showNewEventForm && (
                  <button onClick={() => setShowNewEventForm(true)} style={{ marginBottom: 20, padding: '9px 18px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>
                    + Kalender activiteit toevoegen
                  </button>
                )}

                {showNewEventForm && (
                  <form onSubmit={handleCreateEvent} style={{ background: '#EEF5F133', border: '1.5px dashed #2A5C3F', borderRadius: 14, padding: 20, marginBottom: 24 }}>
                    <h4 style={{ margin: '0 0 16px', color: '#1A3D2A', fontWeight: 800 }}>Nieuwe Activiteit</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div><label style={labelStyle}>Titel</label><input style={inputStyle} value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} required placeholder="bijv. Groeps-BBQ of Filmavond" /></div>
                      <div><label style={labelStyle}>Datum</label><input type="date" style={inputStyle} value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} required /></div>
                      <div><label style={labelStyle}>Tijdstip</label><input style={inputStyle} value={newEvent.time} onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))} placeholder="bijv. 14:00 - 17:00" /></div>
                      <div><label style={labelStyle}>Locatie</label><input style={inputStyle} value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} placeholder="bijv. Scoutslokalen" /></div>
                    </div>
                    <div style={{ marginBottom: 14 }}><label style={labelStyle}>Omschrijving</label><textarea style={inputStyle} rows={3} value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} placeholder="Korte uitleg over de activiteit..." /></div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
                        {loading ? 'Bezig…' : 'Toevoegen'}
                      </button>
                      <button type="button" onClick={() => setShowNewEventForm(false)} style={{ padding: '8px 16px', background: 'none', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, color: '#6A8A75', cursor: 'pointer' }}>
                        Annuleren
                      </button>
                    </div>
                  </form>
                )}

                {/* List calendar events */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {takEvents.length === 0 && <p style={{ color: '#6A8A75', fontSize: '.88rem' }}>Er zijn geen geplande activiteiten voor deze tak in de kalender.</p>}
                  {takEvents.map(ev => {
                    const isEditing = editEventId === ev.id
                    const dateObj = new Date(ev.date)
                    const dateStr = `${dateObj.getDate()} ${MAANDEN[dateObj.getMonth() + 1]} ${dateObj.getFullYear()}`

                    return (
                      <div key={ev.id} style={{ background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 12, padding: 18 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                          <div>
                            <strong style={{ fontSize: '1.05rem', color: '#1A3D2A', display: 'block' }}>{ev.title}</strong>
                            <span style={{ fontSize: '.82rem', color: '#6A8A75', fontWeight: 600 }}>📅 {dateStr} {ev.time && `· 🕒 ${ev.time}`} {ev.location && `· 📍 ${ev.location}`}</span>
                            {ev.description && <p style={{ fontSize: '.88rem', color: '#3A5A42', margin: '8px 0 0', lineHeight: 1.4 }}>{ev.description}</p>}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setEditEventId(isEditing ? null : ev.id); setEditEventData({ title: ev.title, date: ev.date, time: ev.time, location: ev.location, description: ev.description }) }}
                              style={{ padding: '6px 12px', border: '1.5px solid #C9963A', borderRadius: 8, background: 'none', color: '#C9963A', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                              {isEditing ? 'Sluiten' : 'Bewerken'}
                            </button>
                            <button onClick={() => handleDeleteEvent(ev.id, ev.title)}
                              style={{ padding: '6px 12px', border: '1.5px solid #B23A4D', borderRadius: 8, background: 'none', color: '#B23A4D', fontSize: '.75rem', cursor: 'pointer' }}>
                              ✕
                            </button>
                          </div>
                        </div>

                        {isEditing && (
                          <form onSubmit={e => handleUpdateEvent(e, ev.id, ev)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14, borderTop: '1px solid #EEF5F1', paddingTop: 14 }}>
                            <div><label style={labelStyle}>Titel</label><input style={inputStyle} defaultValue={ev.title} onChange={e => setEditEventData(p => ({ ...p, title: e.target.value }))} required /></div>
                            <div><label style={labelStyle}>Datum</label><input type="date" style={inputStyle} defaultValue={ev.date} onChange={e => setEditEventData(p => ({ ...p, date: e.target.value }))} required /></div>
                            <div><label style={labelStyle}>Tijdstip</label><input style={inputStyle} defaultValue={ev.time} onChange={e => setEditEventData(p => ({ ...p, time: e.target.value }))} /></div>
                            <div><label style={labelStyle}>Locatie</label><input style={inputStyle} defaultValue={ev.location} onChange={e => setEditEventData(p => ({ ...p, location: e.target.value }))} /></div>
                            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Omschrijving</label><textarea style={inputStyle} rows={2} defaultValue={ev.description} onChange={e => setEditEventData(p => ({ ...p, description: e.target.value }))} /></div>
                            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Opslaan</button>
                          </form>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ─── KAMPEN TAB ─── */}
            {subTab === 'kampen' && (
              <div>
                {!showNewCampForm && (
                  <button onClick={() => setShowNewCampForm(true)} style={{ marginBottom: 20, padding: '9px 18px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>
                    + Weekend/Kamp toevoegen
                  </button>
                )}

                {showNewCampForm && (
                  <form onSubmit={handleCreateCamp} style={{ background: '#EEF5F133', border: '1.5px dashed #2A5C3F', borderRadius: 14, padding: 20, marginBottom: 24 }}>
                    <h4 style={{ margin: '0 0 16px', color: '#1A3D2A', fontWeight: 800 }}>Nieuw Weekend of Kamp</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div><label style={labelStyle}>Naam</label><input style={inputStyle} value={newCamp.naam} onChange={e => setNewCamp(p => ({ ...p, naam: e.target.value }))} required placeholder="bijv. Groepsweekend of Zomerkamp" /></div>
                      <div><label style={labelStyle}>Locatie</label><input style={inputStyle} value={newCamp.locatie} onChange={e => setNewCamp(p => ({ ...p, locatie: e.target.value }))} required placeholder="bijv. Zandhoven" /></div>
                      <div><label style={labelStyle}>Startdatum</label><input type="date" style={inputStyle} value={newCamp.datum_van} onChange={e => setNewCamp(p => ({ ...p, datum_van: e.target.value }))} required /></div>
                      <div><label style={labelStyle}>Einddatum</label><input type="date" style={inputStyle} value={newCamp.datum_tot} onChange={e => setNewCamp(p => ({ ...p, datum_tot: e.target.value }))} required /></div>
                      <div><label style={labelStyle}>Prijs (€)</label><input type="number" min="0" step="0.01" style={inputStyle} value={newCamp.prijs} onChange={e => setNewCamp(p => ({ ...p, prijs: e.target.value }))} placeholder="0" /></div>
                      <div><label style={labelStyle}>Contact info (Telefoon Leiding)</label><input style={inputStyle} value={newCamp.contact_info} onChange={e => setNewCamp(p => ({ ...p, contact_info: e.target.value }))} placeholder="bijv. Takleiding: +32 470 12 34 56" /></div>
                    </div>
                    <div style={{ marginBottom: 14 }}><label style={labelStyle}>Briefadres (voor post op kamp)</label><input style={inputStyle} value={newCamp.briefadres} onChange={e => setNewCamp(p => ({ ...p, briefadres: e.target.value }))} placeholder="bijv. t.a.v. [Naam Kind], Kampplaats De Kluis, Kluisweg 1, 3050 Oud-Heverlee" /></div>
                    <div style={{ marginBottom: 14 }}><label style={labelStyle}>Beschrijving</label><textarea style={inputStyle} rows={3} value={newCamp.beschrijving} onChange={e => setNewCamp(p => ({ ...p, beschrijving: e.target.value }))} placeholder="Korte toelichting over het kamp/weekend..." /></div>
                    
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Interactieve Inpaklijst</label>
                        <button type="button" onClick={() => applyCampTemplate(false)} style={{ border: '1px solid #C9963A', color: '#C9963A', background: 'none', borderRadius: 6, padding: '3px 8px', fontSize: '.75rem', cursor: 'pointer', fontWeight: 700 }}>
                          Standaard sjabloon laden
                        </button>
                      </div>
                      <textarea style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '.8rem' }} rows={5} value={newCamp.paklijstText} onChange={e => setNewCamp(p => ({ ...p, paklijstText: e.target.value }))} placeholder="Slapen: Slaapzak, Matje, Pyjama&#10;Kleding: Hemd, T-shirts, Sokken" />
                      <span style={{ fontSize: '.72rem', color: '#6A8A75' }}>Formaat: Categorie: Item1, Item2, Item3 (1 categorie per regel)</span>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
                        {loading ? 'Bezig…' : 'Aanmaken'}
                      </button>
                      <button type="button" onClick={() => setShowNewCampForm(false)} style={{ padding: '8px 16px', background: 'none', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, color: '#6A8A75', cursor: 'pointer' }}>
                        Annuleren
                      </button>
                    </div>
                  </form>
                )}

                {/* List Tak Camps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {takKampen.length === 0 && <p style={{ color: '#6A8A75', fontSize: '.88rem' }}>Er zijn nog geen kampen voor deze tak aangemaakt.</p>}
                  {takKampen.map(kamp => {
                    const isEditing = editCampId === kamp.id
                    const van = new Date(kamp.datum_van)
                    const tot = new Date(kamp.datum_tot)
                    const periode = `${van.getDate()}/${van.getMonth() + 1} – ${tot.getDate()}/${tot.getMonth() + 1}/${tot.getFullYear()}`
                    const bestanden = kamp.kamp_bestanden ?? []

                    return (
                      <div key={kamp.id} style={{ background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 14, overflow: 'hidden' }}>
                        {kamp.foto && (
                          <div style={{ width: '100%', height: 130 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kamp-fotos/${kamp.foto}`} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}

                        <div style={{ padding: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ padding: '2px 8px', background: `${kleur}22`, color: kleur, borderRadius: 20, fontSize: '.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{kamp.tak}</span>
                                {kamp.open_voor_inschrijving && <span style={{ padding: '2px 8px', background: 'hsla(145,33%,36%,.1)', color: '#3F7D5A', borderRadius: 20, fontSize: '.7rem', fontWeight: 700 }}>✓ Gepubliceerd</span>}
                              </div>
                              <strong style={{ fontSize: '1.1rem', color: '#1A3D2A', display: 'block' }}>{kamp.naam}</strong>
                              <span style={{ fontSize: '.82rem', color: '#6A8A75' }}>📅 {periode} · 📍 {kamp.locatie}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button onClick={() => handleTogglePubliek(kamp.id, kamp.open_voor_inschrijving)}
                                style={{ padding: '6px 12px', border: `1.5px solid ${kamp.open_voor_inschrijving ? '#B23A4D' : '#3F7D5A'}`, borderRadius: 8, background: 'none', color: kamp.open_voor_inschrijving ? '#B23A4D' : '#3F7D5A', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                {kamp.open_voor_inschrijving ? 'Verbergen' : 'Publiceren'}
                              </button>
                              <a href={`/api/admin/kampen/${kamp.id}/export`} download
                                style={{ padding: '6px 12px', border: '1.5px solid #C9963A', borderRadius: 8, background: '#C9963A', color: '#fff', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                                Exporteren (CSV)
                              </a>
                              <button onClick={() => handleDeleteCamp(kamp.id, kamp.naam)}
                                style={{ padding: '6px 12px', border: '1.5px solid #B23A4D', borderRadius: 8, background: 'none', color: '#B23A4D', fontSize: '.75rem', cursor: 'pointer' }}>
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* Expandable Editing */}
                          <details style={{ marginTop: 10, borderTop: '1px solid #EEF5F1', paddingTop: 8 }} open={isEditing}>
                            <summary onClick={(e) => { e.preventDefault(); setEditCampId(isEditing ? null : kamp.id); setEditCampData({ naam: kamp.naam, datum_van: kamp.datum_van, datum_tot: kamp.datum_tot, locatie: kamp.locatie, beschrijving: kamp.beschrijving, prijs: String(kamp.prijs), briefadres: kamp.briefadres, contact_info: kamp.contact_info, paklijstText: formatPackingList(kamp.paklijst) }) }} style={{ cursor: 'pointer', fontSize: '.82rem', color: '#1A3D2A', fontWeight: 700 }}>✏️ Gegevens bewerken</summary>
                            {isEditing && (
                              <form onSubmit={e => handleUpdateCamp(e, kamp.id, kamp)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                                <div><label style={labelStyle}>Naam</label><input style={inputStyle} value={editCampData.naam} onChange={e => setEditCampData(p => ({ ...p, naam: e.target.value }))} /></div>
                                <div><label style={labelStyle}>Locatie</label><input style={inputStyle} value={editCampData.locatie} onChange={e => setEditCampData(p => ({ ...p, locatie: e.target.value }))} /></div>
                                <div><label style={labelStyle}>Startdatum</label><input type="date" style={inputStyle} value={editCampData.datum_van} onChange={e => setEditCampData(p => ({ ...p, datum_van: e.target.value }))} /></div>
                                <div><label style={labelStyle}>Einddatum</label><input type="date" style={inputStyle} value={editCampData.datum_tot} onChange={e => setEditCampData(p => ({ ...p, datum_tot: e.target.value }))} /></div>
                                <div><label style={labelStyle}>Prijs (€)</label><input type="number" step="0.01" style={inputStyle} value={editCampData.prijs} onChange={e => setEditCampData(p => ({ ...p, prijs: e.target.value }))} /></div>
                                <div><label style={labelStyle}>Contact info (Telefoon Leiding)</label><input style={inputStyle} value={editCampData.contact_info} onChange={e => setEditCampData(p => ({ ...p, contact_info: e.target.value }))} /></div>
                                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Briefadres (voor post op kamp)</label><input style={inputStyle} value={editCampData.briefadres} onChange={e => setEditCampData(p => ({ ...p, briefadres: e.target.value }))} /></div>
                                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Beschrijving</label><textarea style={inputStyle} rows={2} value={editCampData.beschrijving} onChange={e => setEditCampData(p => ({ ...p, beschrijving: e.target.value }))} /></div>
                                
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                    <label style={{ ...labelStyle, marginBottom: 0 }}>Interactieve Inpaklijst</label>
                                    <button type="button" onClick={() => applyCampTemplate(true)} style={{ border: '1px solid #C9963A', color: '#C9963A', background: 'none', borderRadius: 6, padding: '3px 8px', fontSize: '.75rem', cursor: 'pointer', fontWeight: 700 }}>
                                      Standaard sjabloon laden
                                    </button>
                                  </div>
                                  <textarea style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '.8rem' }} rows={5} value={editCampData.paklijstText} onChange={e => setEditCampData(p => ({ ...p, paklijstText: e.target.value }))} />
                                </div>

                                <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Opslaan</button>
                              </form>
                            )}
                          </details>

                          {/* Expandable Coverphoto */}
                          <details style={{ marginTop: 6, borderTop: '1px solid #EEF5F1', paddingTop: 8 }}>
                            <summary style={{ cursor: 'pointer', fontSize: '.82rem', color: '#1A3D2A', fontWeight: 700 }}>🖼️ Omslagfoto wijzigen</summary>
                            <div style={{ marginTop: 10 }}>
                              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleUploadPhoto(e, kamp.id)} style={{ fontSize: '.8rem' }} />
                            </div>
                          </details>

                          {/* Expandable Attachments */}
                          <details style={{ marginTop: 6, borderTop: '1px solid #EEF5F1', paddingTop: 8 }}>
                            <summary style={{ cursor: 'pointer', fontSize: '.82rem', color: '#1A3D2A', fontWeight: 700 }}>📎 Bestanden beheren ({bestanden.length})</summary>
                            <div style={{ marginTop: 12 }}>
                              {bestanden.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                  {bestanden.map((b: KampBestand) => (
                                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAF9', padding: '8px 12px', borderRadius: 8, border: '1px solid #C2D9C9' }}>
                                      <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{b.naam} ({b.type})</span>
                                      <button onClick={() => handleDeleteBestand(kamp.id, b.id)} style={{ background: 'none', border: 'none', color: '#B23A4D', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <form onSubmit={e => handleUploadBestand(e, kamp.id)} style={{ display: 'flex', gap: 8, flexDirection: 'column', background: '#EEF5F122', padding: 12, borderRadius: 10, border: '1px dashed #C2D9C9' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                  <div>
                                    <label style={labelStyle}>Bestand label</label>
                                    <input name="bestandNaam" required placeholder="bijv. Medische Fiche" style={inputStyle} />
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Type</label>
                                    <select name="bestandType" required defaultValue="overige" style={inputStyle}>
                                      <option value="paklijst_pdf">🎒 Paklijst</option>
                                      <option value="uitnodiging">📬 Uitnodiging</option>
                                      <option value="infobrief">📋 Infobrief</option>
                                      <option value="overige">📎 Overige</option>
                                    </select>
                                  </div>
                                </div>
                                <input type="file" name="bestand" accept=".pdf,image/jpeg,image/png,.docx" required style={{ fontSize: '.8rem', margin: '4px 0' }} />
                                <button type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '6px 14px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '.8rem' }}>Uploaden</button>
                              </form>
                            </div>
                          </details>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ─── ECHO'S TAB ─── */}
            {subTab === 'echos' && activeTak !== 'groep' && (
              <div>
                {/* Upload Echo Form */}
                <form onSubmit={handleUploadEcho} style={{ background: '#EEF5F133', border: '1.5px dashed #2A5C3F', borderRadius: 14, padding: 20, marginBottom: 28 }}>
                  <h4 style={{ margin: '0 0 16px', color: '#1A3D2A', fontWeight: 800 }}>Nieuwe Kriko Echo uploaden</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Maand</label>
                      <select name="echoMonth" required defaultValue={String(new Date().getMonth() + 1)} style={inputStyle}>
                        {MAANDEN.map((m, i) => i > 0 && <option key={i} value={i}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Jaar</label>
                      <select name="echoYear" required defaultValue={String(new Date().getFullYear())} style={inputStyle}>
                        <option value={String(new Date().getFullYear() - 1)}>{new Date().getFullYear() - 1}</option>
                        <option value={String(new Date().getFullYear())}>{new Date().getFullYear()}</option>
                        <option value={String(new Date().getFullYear() + 1)}>{new Date().getFullYear() + 1}</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Selecteer PDF bestand</label>
                    <input type="file" name="echoFile" accept=".pdf" required style={{ fontSize: '.82rem' }} />
                  </div>
                  <button type="submit" disabled={loading} style={{ padding: '8px 18px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                    {loading ? 'Bezig…' : 'Kriko Echo Uploaden'}
                  </button>
                </form>

                {/* Echo list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {takEchos.length === 0 && <p style={{ color: '#6A8A75', fontSize: '.88rem' }}>Er zijn geen Echo&apos;s geüpload voor deze tak.</p>}
                  {takEchos.map(echo => {
                    const label = `${MAANDEN[echo.month]} ${echo.year}`
                    return (
                      <div key={echo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#fff', border: '1px solid #C2D9C9', borderRadius: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '1.3rem' }}>📄</span>
                          <div>
                            <strong style={{ display: 'block', fontSize: '.92rem' }}>Kriko Echo — {label}</strong>
                            <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/echos/${echo.file_name}`} target="_blank" rel="noopener" style={{ fontSize: '.78rem', color: '#C9963A', textDecoration: 'none', fontWeight: 600 }}>Downloaden ↗</a>
                          </div>
                        </span>
                        <button onClick={() => handleDeleteEcho(echo.id)} style={{ padding: '6px 12px', border: '1.5px solid #B23A4D', borderRadius: 8, background: 'none', color: '#B23A4D', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>
                          Verwijderen
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
