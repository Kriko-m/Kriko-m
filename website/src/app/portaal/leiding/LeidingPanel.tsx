'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Kamp, Echo, KampBestand, CalendarEvent, TodoItem } from '@/lib/types'
import { CopyLinkButton, RsvpPanel } from '../_components/CampRsvpPanel'
import LeidingCalendar from '../_components/LeidingCalendar'
import { mergeCampsIntoCalendar } from '@/lib/calendar'

const TAKKEN = ['groep', 'kapoenen', 'welpen', 'jonggivers', 'givers']
const TAK_NAMEN: Record<string, string> = {
  groep: 'Groep (Algemeen)',
  kapoenen: 'Kapoenen (6-8j)',
  welpen: 'Welpen (8-11j)',
  jonggivers: 'Jonggivers (11-14j)',
  givers: 'Givers (14-17j)',
}
const TAK_KLEUREN: Record<string, string> = {
  groep: '#1A3D2A', kapoenen: '#F4C842', welpen: '#5D9E6C', jonggivers: '#E07B1A', givers: '#1A3FB5', alle: '#1A3D2A',
}
const MAANDEN = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

const MONTH_OPTIONS = [
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maart' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Augustus' },
]

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
  initialTodos: TodoItem[]
  role: string
  icsToken: string
  initialTak?: string
  initialTab?: string
  initialMonth?: number
  portalBackgrounds?: Record<string, { style: string; custom_url?: string }>
}

export default function LeidingPanel({
  initialKampen,
  initialEchos,
  initialCalendar,
  initialTodos,
  role,
  icsToken,
  initialTak,
  initialMonth,
  portalBackgrounds = {},
}: LeidingPanelProps) {
  const [activeTak] = useState(TAKKEN.includes(initialTak ?? '') ? (initialTak as string) : 'groep')
  const [inlineView, setInlineView] = useState<null | 'kampen' | 'echos'>(null)
  
  const [kampen, setKampen] = useState<Kamp[]>(initialKampen)
  const [echos, setEchos] = useState<Echo[]>(initialEchos)
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos)

  const [selectedMonth, setSelectedMonth] = useState(initialMonth ?? (new Date().getMonth() + 1))
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [showAddTodoPopover, setShowAddTodoPopover] = useState(false)

  const canPublish = role === 'admin' || role === 'groepsleiding'

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const takBgConfig = portalBackgrounds[activeTak] || {}
  const [customBg, setCustomBg] = useState<string | null>(takBgConfig.custom_url || null)
  const [bgStyle, setBgStyle] = useState<'white' | 'regular' | 'reversed' | 'custom'>((takBgConfig.style as any) || 'reversed')

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'portal-background')
    fd.append('tak', activeTak)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      })

      if (res.ok) {
        const { url } = await res.json()
        
        // Save this to settings database
        const saveRes = await fetch('/api/admin/portal-backgrounds', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tak: activeTak,
            style: 'custom',
            customUrl: url,
          }),
        })

        if (saveRes.ok) {
          setCustomBg(url)
          setBgStyle('custom')
          showFlash("Achtergrond succesvol ingesteld!")
        } else {
          showFlash("Fout bij opslaan achtergrond instelling.")
        }
      } else {
        showFlash("Fout bij uploaden achtergrond.")
      }
    } catch (err) {
      showFlash("Netwerkfout bij uploaden.")
    }
    setLoading(false)
  }

  const selectBgStyle = async (style: 'white' | 'regular' | 'reversed' | 'custom') => {
    if (style === 'custom' && !customBg) {
      fileInputRef.current?.click()
    } else {
      try {
        const saveRes = await fetch('/api/admin/portal-backgrounds', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tak: activeTak,
            style,
            customUrl: customBg,
          }),
        })

        if (saveRes.ok) {
          setBgStyle(style)
          showFlash("Stijl succesvol bijgewerkt!")
        } else {
          showFlash("Fout bij opslaan achtergrondstijl.")
        }
      } catch (err) {
        showFlash("Netwerkfout bij bijwerken stijl.")
      }
    }
  }

  const handleResetBg = async () => {
    try {
      const saveRes = await fetch('/api/admin/portal-backgrounds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tak: activeTak,
          style: 'reversed',
          customUrl: null,
        }),
      })

      if (saveRes.ok) {
        setCustomBg(null)
        setBgStyle('reversed')
        showFlash("Achtergrond gereset naar standaard.")
      } else {
        showFlash("Fout bij herstellen achtergrond.")
      }
    } catch (err) {
      showFlash("Netwerkfout bij herstellen achtergrond.")
    }
  }

  useEffect(() => {
    if (initialMonth === undefined) {
      setSelectedMonth(new Date().getMonth() + 1)
    } else {
      setSelectedMonth(initialMonth)
    }
  }, [initialMonth])

  const activeMonthRef = (node: HTMLButtonElement | null) => {
    if (node) {
      const container = node.parentElement as HTMLDivElement | null
      if (container) {
        container.style.position = 'relative'
        const containerHeight = container.clientHeight || 180
        const itemHeight = node.offsetHeight || 36
        const itemTop = node.offsetTop
        
        container.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2)
      }
    }
  }

  // Camp Form States
  const [showNewCampForm, setShowNewCampForm] = useState(false)
  const [newCamp, setNewCamp] = useState({ naam: '', datum_van: '', datum_tot: '', locatie: '', beschrijving: '', prijs: '', briefadres: '', contact_info: '', paklijstText: '' })
  const [editCampId, setEditCampId] = useState<string | null>(null)
  const [editCampData, setEditCampData] = useState({ naam: '', datum_van: '', datum_tot: '', locatie: '', beschrijving: '', prijs: '', briefadres: '', contact_info: '', paklijstText: '' })

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
  const filteredTodos = todos.filter(t => t.month === selectedMonth)

  // Load packing list template
  function applyCampTemplate(isEdit: boolean) {
    const template = PAKLIJST_TEMPLATES[activeTak] || ''
    if (isEdit) {
      setEditCampData(p => ({ ...p, paklijstText: template }))
    } else {
      setNewCamp(p => ({ ...p, paklijstText: template }))
    }
  }

  // Todo Mutators
  async function handleToggleTodo(id: string, currentCompleted: boolean) {
    const res = await fetch(`/api/admin/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentCompleted }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTodos(prev => prev.map(t => t.id === id ? updated : t))
    } else {
      showFlash('Fout bij bijwerken taak.')
    }
  }

  async function handleCreateTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!newTodoTitle.trim()) return
    const res = await fetch('/api/admin/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTodoTitle.trim(),
        month: selectedMonth,
        tak: activeTak,
      }),
    })
    if (res.ok) {
      const created = await res.json()
      setTodos(prev => [...prev, created])
      setNewTodoTitle('')
      setShowAddTodoPopover(false)
    } else {
      showFlash('Fout bij toevoegen taak.')
    }
  }

  async function handleDeleteTodo(id: string) {
    const res = await fetch(`/api/admin/todos/${id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setTodos(prev => prev.filter(t => t.id !== id))
    } else {
      showFlash('Fout bij verwijderen taak.')
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
  const bannerImg = bgStyle === 'custom' ? customBg :
                    bgStyle === 'regular' ? (activeTak === 'groep' ? '/images/leiding_25-26.jpg' : `/images/banner_${activeTak}.webp`) :
                    bgStyle === 'reversed' ? (activeTak === 'groep' ? '/images/leiding_25-26.jpg' : `/images/banner_${activeTak}_reversed.webp`) :
                    null

  // Filter calendar events for upcoming widget
  const mergedEntries = mergeCampsIntoCalendar(initialCalendar, kampen)
  const todayStr = new Date().toISOString().split('T')[0]
  const taggedEvents = mergedEntries
    .filter(ev => {
      if (ev.date < todayStr) return false
      return ev.audience.includes('leiding') || 
             ev.audience.includes('ouders') || 
             ev.audience.includes(activeTak as any)
    })
    .slice(0, 5)

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 5 }

  return (
    <div
      className={`portaal-dashboard-bg-wrapper${bgStyle === 'white' ? ' portal-bg-white' : ''}`}
      style={bannerImg ? { '--portal-bg': `url('${bannerImg}')` } as React.CSSProperties : undefined}
    >
      <style>{`
        .action-card-hover {
          transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
        }
        .action-card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          border-color: #1A3D2A !important;
        }
        .settings-cog-hover {
          transition: transform 0.3s ease, background-color 0.15s;
        }
        .settings-cog-hover:hover {
          transform: rotate(45deg);
          background-color: #fff !important;
        }
      `}</style>

      {/* Main card */}
      <div className="portaal-dashboard-card">
        {/* Flash message */}
        {flash && (
          <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '12px 18px', borderRadius: 10, marginBottom: 24, fontWeight: 600 }}>
            {flash}
          </div>
        )}

        {/* Main Layout */}
        <div>
            {/* Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.85fr', gap: 24 }} className="portal-grid-layout">
              
              {/* Left Column: Action Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  {/* Action 1: Kamp / Weekend aanmaken */}
                  <div
                    onClick={() => setInlineView(inlineView === 'kampen' ? null : 'kampen')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      padding: '32px 20px',
                      border: `2px solid ${inlineView === 'kampen' ? '#1A3D2A' : '#C2D9C9'}`,
                      borderRadius: 16,
                      background: inlineView === 'kampen' ? '#EEF5F1' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                    className="action-card-hover"
                  >
                    <i className="fa-solid fa-tent" style={{ fontSize: '2.2rem', color: '#1A3D2A' }}></i>
                    <strong style={{ fontSize: '.92rem', color: '#1A3D2A' }}>kamp/weekend aanmaken</strong>
                  </div>

                  {/* Action 2: Kriko Echo uploaden */}
                  {activeTak !== 'groep' && (
                    <div
                      onClick={() => setInlineView(inlineView === 'echos' ? null : 'echos')}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        padding: '32px 20px',
                        border: `2px solid ${inlineView === 'echos' ? '#1A3D2A' : '#C2D9C9'}`,
                        borderRadius: 16,
                        background: inlineView === 'echos' ? '#EEF5F1' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                      className="action-card-hover"
                    >
                      <i className="fa-solid fa-newspaper" style={{ fontSize: '2.2rem', color: '#1A3D2A' }}></i>
                      <strong style={{ fontSize: '.92rem', color: '#1A3D2A' }}>kriko-echo uploaden</strong>
                    </div>
                  )}

                  {/* Action 3: Tak activiteit toevoegen */}
                  <Link
                    href={`/portaal/leiding/agenda?filter=${activeTak === 'groep' ? 'leiding' : activeTak}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      padding: '32px 20px',
                      border: '2px solid #C2D9C9',
                      borderRadius: 16,
                      background: '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                    className="action-card-hover"
                  >
                    <i className="fa-solid fa-calendar-plus" style={{ fontSize: '2.2rem', color: '#1A3D2A' }}></i>
                    <strong style={{ fontSize: '.92rem', color: '#1A3D2A' }}>tak activiteit toevoegen aan kalender</strong>
                  </Link>
                </div>

                {/* Inline Kamp Panel */}
                {inlineView === 'kampen' && (
                  <div style={{ background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 16, padding: 20 }}>
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
                                  <CopyLinkButton slug={kamp.slug} />
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

                              <details style={{ marginTop: 6, borderTop: '1px solid #EEF5F1', paddingTop: 8 }}>
                                <summary style={{ cursor: 'pointer', fontSize: '.82rem', color: '#1A3D2A', fontWeight: 700 }}>🖼️ Omslagfoto wijzigen</summary>
                                <div style={{ marginTop: 10 }}>
                                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleUploadPhoto(e, kamp.id)} style={{ fontSize: '.8rem' }} />
                                </div>
                              </details>

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
                                    <input type="file" name="bestand" accept="application/pdf,image/jpeg,image/png,image/webp" required style={{ fontSize: '.8rem', margin: '4px 0' }} />
                                    <button type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '6px 14px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '.8rem' }}>Uploaden</button>
                                  </form>
                                </div>
                              </details>

                              <details style={{ marginTop: 6, borderTop: '1px solid #EEF5F1', paddingTop: 8 }}>
                                <summary style={{ cursor: 'pointer', fontSize: '.82rem', color: '#1A3D2A', fontWeight: 700 }}>📋 Antwoorden (wie komt mee?)</summary>
                                <div style={{ marginTop: 10 }}>
                                  <RsvpPanel kampId={kamp.id} />
                                </div>
                              </details>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Inline Echo Panel */}
                {inlineView === 'echos' && activeTak !== 'groep' && (
                  <div style={{ background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 16, padding: 20 }}>
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
                                <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/echos/${echo.file_name}`} target="_blank" rel="noopener font-semibold" style={{ fontSize: '.78rem', color: '#C9963A', textDecoration: 'none', fontWeight: 600 }}>Downloaden ↗</a>
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

              {/* Right Column: Widgets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Calendar Summary Widget */}
                <div style={{ background: '#fff', border: '1px solid #C2D9C9', borderRadius: 18, padding: 20, boxShadow: 'var(--shadow-sm)', borderTop: `4px solid ${kleur}` }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A3D2A', margin: '0 0 14px' }}>Aankomende Kalender</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {taggedEvents.length === 0 ? (
                      <p style={{ color: '#6A8A75', fontSize: '.82rem', margin: 0 }}>Geen activiteiten gepland.</p>
                    ) : (
                      taggedEvents.map(ev => {
                        const d = new Date(ev.date)
                        const day = d.toLocaleDateString('nl-BE', { day: '2-digit' })
                        const month = d.toLocaleDateString('nl-BE', { month: 'short' })
                        return (
                          <div key={ev.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '.82rem' }}>
                            <div style={{ background: '#EEF5F1', borderRadius: 8, padding: '4px 8px', textAlign: 'center', minWidth: 40, flexShrink: 0 }}>
                              <div style={{ fontWeight: 800, color: '#1A3D2A', lineHeight: 1 }}>{day}</div>
                              <div style={{ fontSize: '.62rem', opacity: 0.8, color: '#1A3D2A' }}>{month}</div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: '#1A3D2A', wordBreak: 'break-word', whiteSpace: 'normal' }}>{ev.is_evenement ? '⭐ ' : ''}{ev.title}</div>
                              <div style={{ fontSize: '.72rem', color: '#6A8A75', wordBreak: 'break-word', whiteSpace: 'normal' }}>{ev.time || 'Hele dag'}{ev.location ? ` · 📍 ${ev.location}` : ''}</div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, paddingTop: 10, borderTop: '1px solid #F0ECE4' }}>
                    <Link
                      href="/portaal/leiding/agenda"
                      style={{ fontSize: '.82rem', fontWeight: 700, color: '#C9963A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      Volledige agenda <i className="fa-solid fa-arrow-right-long" style={{ fontSize: '.75rem' }}></i>
                    </Link>
                  </div>
                </div>

                {/* TODO Checklist Widget */}
                <div style={{ background: '#fff', border: '1px solid #C2D9C9', borderRadius: 18, padding: 20, boxShadow: 'var(--shadow-sm)', borderTop: `4px solid ${kleur}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A3D2A', marginRight: 4 }}>To do:</span>
                      
                      {/* Custom Month Dropdown Selector */}
                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                          style={{
                            padding: '2px 12px',
                            borderRadius: 8,
                            border: '1.5px solid #C2D9C9',
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: '#1A3D2A',
                            background: '#fff',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            outline: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          {MAANDEN[selectedMonth] ? MAANDEN[selectedMonth].charAt(0).toUpperCase() + MAANDEN[selectedMonth].slice(1) : ''}
                          <i className={`fa-solid fa-chevron-${showMonthDropdown ? 'up' : 'down'}`} style={{ fontSize: '.7rem', opacity: 0.7 }}></i>
                        </button>

                        {showMonthDropdown && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '32px',
                              left: 0,
                              zIndex: 10,
                              background: '#fff',
                              border: '1.5px solid #C2D9C9',
                              borderRadius: 12,
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                              width: 140,
                            }}
                          >
                            <div
                              style={{
                                height: '180px',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                paddingTop: '72px',
                                paddingBottom: '72px',
                                position: 'relative',
                                boxSizing: 'border-box',
                              }}
                            >
                              {MONTH_OPTIONS.map(m => {
                                const isSelected = m.value === selectedMonth
                                return (
                                  <button
                                    key={m.value}
                                    ref={isSelected ? activeMonthRef : undefined}
                                    type="button"
                                    onClick={() => {
                                      setSelectedMonth(m.value)
                                      setShowMonthDropdown(false)
                                    }}
                                    style={{
                                      height: '36px',
                                      flexShrink: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      padding: '0 16px',
                                      background: isSelected ? 'rgba(26, 61, 42, 0.08)' : 'none',
                                      color: isSelected ? '#1A3D2A' : '#4A5D4E',
                                      border: 'none',
                                      fontSize: '.9rem',
                                      fontWeight: isSelected ? 700 : 500,
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      width: '100%',
                                      fontFamily: 'inherit',
                                      transition: 'background 0.1s',
                                      boxSizing: 'border-box',
                                    }}
                                  >
                                    {m.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Popout Plus Button */}
                    <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => setShowAddTodoPopover(!showAddTodoPopover)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            border: '1.5px solid #1A3D2A',
                            background: showAddTodoPopover ? '#1A3D2A' : 'none',
                            color: showAddTodoPopover ? '#fff' : '#1A3D2A',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'background 0.15s, color 0.15s'
                          }}
                        >
                          {showAddTodoPopover ? '✕' : '+'}
                        </button>

                        {showAddTodoPopover && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '32px',
                              right: 0,
                              zIndex: 10,
                              background: '#fff',
                              border: '1.5px solid #C2D9C9',
                              borderRadius: 12,
                              padding: 12,
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                              width: 220,
                            }}
                          >
                            <form onSubmit={handleCreateTodo} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <input
                                type="text"
                                placeholder="Nieuwe taak..."
                                value={newTodoTitle}
                                onChange={(e) => setNewTodoTitle(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '6px 10px',
                                  fontSize: '.82rem',
                                  border: '1.5px solid #C2D9C9',
                                  borderRadius: 8,
                                  boxSizing: 'border-box' as const,
                                }}
                                autoFocus
                                required
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                <button
                                  type="button"
                                  onClick={() => setShowAddTodoPopover(false)}
                                  style={{
                                    padding: '4px 10px',
                                    background: 'none',
                                    border: '1px solid #C2D9C9',
                                    borderRadius: 6,
                                    fontSize: '.75rem',
                                    fontWeight: 600,
                                    color: '#6A8A75',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Annuleer
                                </button>
                                <button
                                  type="submit"
                                  style={{
                                    padding: '4px 10px',
                                    background: '#1A3D2A',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: '.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Toevoegen
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>

                  {/* Todo List Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '200px', overflowY: 'auto', paddingRight: 4 }}>
                    {filteredTodos.length === 0 ? (
                      <p style={{ color: '#6A8A75', fontSize: '.82rem', margin: '4px 0 8px' }}>Geen openstaande taken voor deze maand.</p>
                    ) : (
                      filteredTodos.map(todo => (
                        <div key={todo.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: '1px solid #F0ECE4' }}>
                          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: '.85rem', flex: 1, minWidth: 0 }}>
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={() => handleToggleTodo(todo.id, todo.completed)}
                              style={{ width: 15, height: 15, cursor: 'pointer', marginTop: 2, flexShrink: 0 }}
                            />
                            <span style={{ 
                              textDecoration: todo.completed ? 'line-through' : 'none', 
                              color: todo.completed ? '#8A9A8A' : '#1A3D2A', 
                              fontWeight: todo.completed ? 500 : 600,
                              wordBreak: 'break-word',
                              whiteSpace: 'normal',
                            }}>
                              {todo.title}
                            </span>
                          </label>
                          <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            style={{ background: 'none', border: 'none', color: '#B23A4D', fontSize: '.8rem', cursor: 'pointer', padding: 2, marginTop: 1, flexShrink: 0 }}
                            title="Verwijder taak"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>

      </div>

      {/* Settings Button */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10 }}>
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1.5px solid #C2D9C9',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1A3D2A',
            outline: 'none',
          }}
          className="settings-cog-hover"
          title="Instellingen"
        >
          <i className="fa-solid fa-gear" style={{ fontSize: '1.1rem' }}></i>
        </button>

        {showSettings && (
          <div
            style={{
              position: 'absolute',
              bottom: '44px',
              left: 0,
              zIndex: 20,
              background: '#fff',
              border: '1.5px solid #C2D9C9',
              borderRadius: 14,
              padding: 16,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
              width: 240,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <h4 style={{ margin: '0 0 2px', fontSize: '.9rem', fontWeight: 800, color: '#1A3D2A' }}>Achtergrond Stijl</h4>
            <p style={{ margin: 0, fontSize: '.7rem', color: '#6A8A75' }}>Kies de achtergrondstijl voor deze portaalpagina:</p>
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              {/* Option 1: White */}
              <button
                type="button"
                onClick={() => selectBgStyle('white')}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#fff',
                  border: bgStyle === 'white' ? '2px solid #1A3D2A' : '1px solid #C2D9C9',
                  boxShadow: bgStyle === 'white' ? '0 0 0 2px rgba(26,61,42,0.15)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '.72rem',
                  fontWeight: 700,
                  color: '#4A5D4E',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxSizing: 'border-box',
                }}
                title="Wit (Geen patroon)"
              >
                Wit
              </button>

              {/* Option 2: Regular banner */}
              <button
                type="button"
                onClick={() => selectBgStyle('regular')}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: kleur,
                  border: bgStyle === 'regular' ? '2px solid #1A3D2A' : '1px solid #C2D9C9',
                  boxShadow: bgStyle === 'regular' ? '0 0 0 2px rgba(26,61,42,0.15)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '.72rem',
                  fontWeight: 700,
                  color: '#fff',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxSizing: 'border-box',
                }}
                title="Standaard banner"
              >
                Orig.
              </button>

              {/* Option 3: Reversed banner */}
              <button
                type="button"
                onClick={() => selectBgStyle('reversed')}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#fff',
                  border: bgStyle === 'reversed' ? '2px solid #1A3D2A' : '1px solid #C2D9C9',
                  boxShadow: bgStyle === 'reversed' ? '0 0 0 2px rgba(26,61,42,0.15)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '.72rem',
                  fontWeight: 700,
                  color: kleur,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxSizing: 'border-box',
                }}
                title="Reversed banner"
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: kleur, marginBottom: 2 }}></div>
                Rev.
              </button>

              {/* Option 4: Custom / Upload (+ placeholder) */}
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleBgUpload}
                  style={{ display: 'none' }}
                />
                
                {customBg ? (
                  <button
                    type="button"
                    onClick={() => selectBgStyle('custom')}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundImage: `url(${customBg})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: bgStyle === 'custom' ? '2px solid #1A3D2A' : '1px solid #C2D9C9',
                      boxShadow: bgStyle === 'custom' ? '0 0 0 2px rgba(26,61,42,0.15)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                    }}
                    title="Eigen afbeelding selecteren"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: '#fff',
                      border: '1.5px dashed #C2D9C9',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 500,
                      color: '#6A8A75',
                      boxSizing: 'border-box',
                    }}
                    title="Upload afbeelding (+)"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {customBg && (
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    background: '#EEF5F1',
                    border: '1px solid #C2D9C9',
                    borderRadius: 6,
                    fontSize: '.68rem',
                    fontWeight: 700,
                    color: '#1A3D2A',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Wijzig foto
                </button>
                <button
                  type="button"
                  onClick={handleResetBg}
                  style={{
                    padding: '4px 8px',
                    background: '#B23A4D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: '.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
