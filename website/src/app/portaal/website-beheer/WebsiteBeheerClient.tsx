'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings } from '@/lib/types'

interface Props {
  initialSettings: Settings
}

type PageKey = 'home' | 'echos' | 'docs' | 'agenda' | 'beheer'

const PAGE_NAMES: Record<PageKey, { label: string; icon: string }> = {
  home: { label: 'Startpagina', icon: '🏠' },
  echos: { label: 'Kriko Echo', icon: '📰' },
  docs: { label: 'Documenten & Links', icon: '📁' },
  agenda: { label: 'Kalender', icon: '📅' },
  beheer: { label: 'Website Beheer', icon: '⚙️' },
}

export default function WebsiteBeheerClient({ initialSettings }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [modalFlash, setModalFlash] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPortalModal, setShowPortalModal] = useState(false)

  // Titels & Subtitels per rol op de startpagina — direct vooringevuld met actuele waarden
  const [homeTitleLeiding, setHomeTitleLeiding] = useState<string>(
    initialSettings?.home_title_leiding || (initialSettings?.home_title && initialSettings.home_title !== 'Leidingportaal' ? initialSettings.home_title : 'Welkom leiding')
  )
  const [homeSubtitleLeiding, setHomeSubtitleLeiding] = useState<string>(
    initialSettings?.home_subtitle_leiding || initialSettings?.home_subtitle || ''
  )
  const [homeTitleGroepsleiding, setHomeTitleGroepsleiding] = useState<string>(
    initialSettings?.home_title_groepsleiding || (initialSettings?.home_title && initialSettings.home_title !== 'Leidingportaal' ? initialSettings.home_title : 'Welkom groepsleiding')
  )
  const [homeSubtitleGroepsleiding, setHomeSubtitleGroepsleiding] = useState<string>(
    initialSettings?.home_subtitle_groepsleiding || initialSettings?.home_subtitle || ''
  )

  // Achtergronden per pagina
  const [pageBgs, setPageBgs] = useState<Record<PageKey, { type: 'photo' | 'color'; value: string }>>({
    home: { type: initialSettings?.home_bg_type || 'photo', value: initialSettings?.home_bg_value || '/images/hero-nieuw.webp' },
    echos: { type: initialSettings?.echos_bg_type || 'color', value: initialSettings?.echos_bg_value || '#2A5A40' },
    docs: { type: initialSettings?.docs_bg_type || 'color', value: initialSettings?.docs_bg_value || '#2A5A40' },
    agenda: { type: initialSettings?.agenda_bg_type || 'color', value: initialSettings?.agenda_bg_value || '#2A5A40' },
    beheer: { type: initialSettings?.beheer_bg_type || 'color', value: initialSettings?.beheer_bg_value || '#2A5A40' },
  })

  const [activeBgTab, setActiveBgTab] = useState<PageKey>('home')
  const [activeTitleRoleTab, setActiveTitleRoleTab] = useState<'leiding' | 'groepsleiding'>('leiding')
  const [uploadingBg, setUploadingBg] = useState(false)

  function showNotification(type: 'success' | 'error', text: string) {
    setFlashMessage({ type, text })
    setTimeout(() => setFlashMessage(null), 4000)
  }

  function showModalNotification(type: 'success' | 'error', text: string) {
    setModalFlash({ type, text })
    setTimeout(() => setModalFlash(null), 4000)
  }

  async function handleUploadBackgroundPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBg(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'portal-background')
      formData.append('tak', activeBgTab)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Uploaden mislukt')
      }

      const data = await res.json()
      if (data.url) {
        updateActivePageBg('value', data.url)
        showModalNotification('success', `Nieuwe foto geüpload voor ${PAGE_NAMES[activeBgTab].label}! Klik op 'Wijzigingen Opslaan' om te bevestigen.`)
      }
    } catch (err: unknown) {
      showModalNotification('error', err instanceof Error ? err.message : 'Fout bij uploaden foto')
    } finally {
      setUploadingBg(false)
      e.target.value = ''
    }
  }

  function updateActivePageBg(field: 'type' | 'value', val: string) {
    setPageBgs(prev => ({
      ...prev,
      [activeBgTab]: {
        ...prev[activeBgTab],
        [field]: val,
      },
    }))
  }

  async function handleSavePortalSettings() {
    setSaving(true)
    setModalFlash(null)
    try {
      const payload = {
        home_title_leiding: homeTitleLeiding,
        home_subtitle_leiding: homeSubtitleLeiding,
        home_title_groepsleiding: homeTitleGroepsleiding,
        home_subtitle_groepsleiding: homeSubtitleGroepsleiding,
        home_bg_type: pageBgs.home.type,
        home_bg_value: pageBgs.home.value,
        echos_bg_type: pageBgs.echos.type,
        echos_bg_value: pageBgs.echos.value,
        docs_bg_type: pageBgs.docs.type,
        docs_bg_value: pageBgs.docs.value,
        agenda_bg_type: pageBgs.agenda.type,
        agenda_bg_value: pageBgs.agenda.value,
        beheer_bg_type: pageBgs.beheer.type,
        beheer_bg_value: pageBgs.beheer.value,
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Opslaan mislukt')
      }

      const successText = 'Titels en achtergronden voor het Leidingsportaal succesvol opgeslagen!'
      showNotification('success', successText)
      setShowPortalModal(false)
      router.refresh()
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Fout bij opslaan'
      showModalNotification('error', errorText)
      showNotification('error', errorText)
    } finally {
      setSaving(false)
    }
  }

  const currentBg = pageBgs[activeBgTab]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', minHeight: 'calc(100vh - 76px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box', fontFamily: 'var(--font-body, Outfit, sans-serif)' }} className="portaal-page-container">

      {/* Notification Toast Outside Modal */}
      {flashMessage && (
        <div style={{
          padding: '14px 20px',
          borderRadius: 12,
          marginBottom: 24,
          fontSize: '0.92rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: flashMessage.type === 'success' ? '#EEF5F1' : '#FDF0F2',
          color: flashMessage.type === 'success' ? '#1A3D2A' : '#B23A4D',
          border: `1.5px solid ${flashMessage.type === 'success' ? '#C2D9C9' : '#E0C0C4'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <span>{flashMessage.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{flashMessage.text}</span>
        </div>
      )}

      {/* TWO TOP ACTION CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        
        {/* Card 1: Publieke Website Bewerken */}
        <div style={{
          backgroundColor: '#1A3D2A',
          borderRadius: 22,
          padding: '36px 30px',
          color: '#fff',
          boxShadow: '0 12px 32px rgba(26, 61, 42, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}>
          <div>
            <div style={{ fontSize: '2.6rem', marginBottom: 10 }}>🌐</div>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#fff' }}>
              Publieke Website Bewerken
            </h2>
            <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem', lineHeight: 1.55 }}>
              Pas live teksten, takinfo, tradities, leidingploegen en foto&apos;s aan op de openbare website.
            </p>
          </div>
          <Link
            href="/?edit=true"
            style={{
              padding: '13px 26px',
              backgroundColor: '#C9963A',
              color: '#1A3D2A',
              borderRadius: 12,
              fontWeight: 900,
              fontSize: '0.96rem',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(201, 150, 58, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
            className="action-card-hover"
          >
            ✏️ Live Website Bewerken
          </Link>
        </div>

        {/* Card 2: Leidingsportaal Aanpassen */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: 22,
          border: '1.5px solid #C2D9C9',
          padding: '36px 30px',
          color: '#1A3D2A',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}>
          <div>
            <div style={{ fontSize: '2.6rem', marginBottom: 10 }}>🏕️</div>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#1A3D2A' }}>
              Leidingsportaal Aanpassen
            </h2>
            <p style={{ margin: '10px 0 0', color: '#6A8A75', fontSize: '0.92rem', lineHeight: 1.55 }}>
              Pas per pagina de achtergrondfoto of kleur aan, en stel de welkomsttitels per rol in.
            </p>
          </div>
          <button
            onClick={() => { setModalFlash(null); setShowPortalModal(true) }}
            type="button"
            style={{
              padding: '13px 26px',
              backgroundColor: '#1A3D2A',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 900,
              fontSize: '0.96rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(26, 61, 42, 0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
            className="action-card-hover"
          >
            ⚙️ Achtergronden &amp; Titels
          </button>
        </div>

      </div>

      {/* MODAL FOR LEIDINGPORTAAL INSTELLINGEN */}
      {showPortalModal && (
        <div className="portaal-modal-overlay">
          <div className="portaal-modal-card" style={{ width: '94%', maxWidth: 940, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div className="portaal-modal-header" style={{ padding: '20px 28px' }}>
              <h3 className="portaal-modal-title" style={{ fontSize: '1.25rem' }}>🎨 Achtergronden &amp; Titels Leidingsportaal</h3>
              <button className="portaal-modal-close" onClick={() => setShowPortalModal(false)}>&times;</button>
            </div>
            
            <div className="portaal-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
              
              {/* Notification Toast Inside Modal */}
              {modalFlash && (
                <div style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: modalFlash.type === 'success' ? '#EEF5F1' : '#FDF0F2',
                  color: modalFlash.type === 'success' ? '#1A3D2A' : '#B23A4D',
                  border: `1.5px solid ${modalFlash.type === 'success' ? '#C2D9C9' : '#E0C0C4'}`,
                }}>
                  <span>{modalFlash.type === 'success' ? '✅' : '⚠️'}</span>
                  <span>{modalFlash.text}</span>
                </div>
              )}

              {/* SECTIE 1: STARTPAGINA TITELS PER ROL */}
              <div style={{ backgroundColor: '#F8FAF8', padding: 20, borderRadius: 16, border: '1.5px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 900, color: '#1A3D2A' }}>
                  🏷️ Startpagina Welkomsttitel &amp; Subtitel (Per Rol)
                </h4>
                <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: '#6A8A75' }}>
                  Pas de actuele titel en optionele subtitel aan voor als een gewone Leiding of een Groepsleiding inlogt.
                </p>

                {/* Role Switcher Pills */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTitleRoleTab('leiding')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: activeTitleRoleTab === 'leiding' ? '2px solid #1A3D2A' : '1.5px solid #CBD5E1',
                      background: activeTitleRoleTab === 'leiding' ? '#EEF5F1' : '#fff',
                      color: '#1A3D2A',
                      fontWeight: activeTitleRoleTab === 'leiding' ? 800 : 600,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                    }}
                  >
                    👤 Rol: Leiding
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTitleRoleTab('groepsleiding')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: activeTitleRoleTab === 'groepsleiding' ? '2px solid #1A3D2A' : '1.5px solid #CBD5E1',
                      background: activeTitleRoleTab === 'groepsleiding' ? '#EEF5F1' : '#fff',
                      color: '#1A3D2A',
                      fontWeight: activeTitleRoleTab === 'groepsleiding' ? 800 : 600,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                    }}
                  >
                    ⭐ Rol: Groepsleiding
                  </button>
                </div>

                {activeTitleRoleTab === 'leiding' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                        Hoofdtitel voor Leiding
                      </label>
                      <input
                        type="text"
                        value={homeTitleLeiding}
                        onChange={e => setHomeTitleLeiding(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', background: '#fff', fontWeight: 700, color: '#1A3D2A' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                        Subtitel voor Leiding (Optioneel)
                      </label>
                      <textarea
                        value={homeSubtitleLeiding}
                        onChange={e => setHomeSubtitleLeiding(e.target.value)}
                        rows={2}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', background: '#fff', color: '#1A3D2A' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                        Hoofdtitel voor Groepsleiding
                      </label>
                      <input
                        type="text"
                        value={homeTitleGroepsleiding}
                        onChange={e => setHomeTitleGroepsleiding(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', background: '#fff', fontWeight: 700, color: '#1A3D2A' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                        Subtitel voor Groepsleiding (Optioneel)
                      </label>
                      <textarea
                        value={homeSubtitleGroepsleiding}
                        onChange={e => setHomeSubtitleGroepsleiding(e.target.value)}
                        rows={2}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', background: '#fff', color: '#1A3D2A' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTIE 2: ACHTERGROND PER PAGINA */}
              <div style={{ backgroundColor: '#FAFCFA', padding: 20, borderRadius: 16, border: '1.5px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 900, color: '#1A3D2A' }}>
                  🖼️ Achtergrond Per Pagina
                </h4>
                <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: '#6A8A75' }}>
                  Kies een foto of een effen kleur als achtergrond voor elke specifieke pagina in het portaal.
                </p>

                {/* Page Selector Tabs */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
                  {(Object.keys(PAGE_NAMES) as PageKey[]).map((pageKey) => {
                    const active = activeBgTab === pageKey
                    const info = PAGE_NAMES[pageKey]
                    return (
                      <button
                        key={pageKey}
                        type="button"
                        onClick={() => setActiveBgTab(pageKey)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 10,
                          border: active ? '2px solid #1A3D2A' : '1.5px solid #CBD5E1',
                          background: active ? '#EEF5F1' : '#fff',
                          color: '#1A3D2A',
                          fontWeight: active ? 800 : 600,
                          cursor: 'pointer',
                          fontSize: '0.84rem',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Background Type Toggle */}
                <div className="beheer-toggle-grid" style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => updateActivePageBg('type', 'photo')}
                    style={{
                      padding: '10px',
                      borderRadius: 10,
                      border: currentBg.type === 'photo' ? '2px solid #1A3D2A' : '1.5px solid #CBD5E1',
                      background: currentBg.type === 'photo' ? '#EEF5F1' : '#fff',
                      color: '#1A3D2A',
                      fontWeight: currentBg.type === 'photo' ? 800 : 600,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                    }}
                  >
                    🖼️ Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActivePageBg('type', 'color')}
                    style={{
                      padding: '10px',
                      borderRadius: 10,
                      border: currentBg.type === 'color' ? '2px solid #1A3D2A' : '1.5px solid #CBD5E1',
                      background: currentBg.type === 'color' ? '#EEF5F1' : '#fff',
                      color: '#1A3D2A',
                      fontWeight: currentBg.type === 'color' ? 800 : 600,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                    }}
                  >
                    🎨 Effen Kleur
                  </button>
                </div>

                {currentBg.type === 'photo' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 8 }}>
                      Foto voor {PAGE_NAMES[activeBgTab].label}
                    </label>

                    {/* Pre-filled / Uploaded photo preview */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: 12,
                      borderRadius: 14,
                      border: '1.5px solid #C2D9C9',
                      backgroundColor: '#fff',
                      marginBottom: 12,
                    }}>
                      <div style={{
                        width: 90,
                        height: 60,
                        borderRadius: 10,
                        backgroundImage: `url(${currentBg.value})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid #CBD5E1',
                        flexShrink: 0,
                        backgroundColor: '#E2E8F0',
                      }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1A3D2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {currentBg.value}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#6A8A75', marginTop: 2 }}>
                          Huidige actieve foto
                        </div>
                      </div>
                    </div>

                    {/* Single Upload Button */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{
                        padding: '10px 18px',
                        borderRadius: 10,
                        backgroundColor: '#1A3D2A',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        cursor: uploadingBg ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 2px 8px rgba(26,61,42,0.15)',
                      }}>
                        <span>📁 {uploadingBg ? 'Foto verwerken…' : 'Nieuwe foto uploaden'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingBg}
                          onChange={handleUploadBackgroundPhoto}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {uploadingBg && (
                        <span style={{ fontSize: '0.84rem', color: '#6A8A75', fontWeight: 700 }}>
                          ⏳ Afbeelding uploaden &amp; optimaliseren…
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 6 }}>
                      Achtergrondkleur voor {PAGE_NAMES[activeBgTab].label}
                    </label>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                      {['#EEF5F1', '#1A3D2A', '#0F2419', '#2A5A40', '#650B19', '#2E5A88', '#FAF6EE'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateActivePageBg('value', c)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: c,
                            border: currentBg.value === c ? '3px solid #E2B755' : '1px solid #CBD5E1',
                            cursor: 'pointer',
                          }}
                          title={c}
                        />
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="color"
                        value={currentBg.value.startsWith('#') ? currentBg.value : '#EEF5F1'}
                        onChange={e => updateActivePageBg('value', e.target.value)}
                        style={{ width: 40, height: 38, border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={currentBg.value}
                        onChange={e => updateActivePageBg('value', e.target.value)}
                        style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.86rem', background: '#fff', fontWeight: 700, color: '#1A3D2A' }}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="portaal-modal-footer" style={{ padding: '16px 28px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowPortalModal(false)}
                disabled={saving}
                style={{ padding: '9px 18px', fontSize: '0.9rem' }}
              >
                Sluiten
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSavePortalSettings}
                disabled={saving}
                style={{ padding: '9px 22px', fontSize: '0.9rem', fontWeight: 800 }}
              >
                {saving ? 'Opslaan…' : '💾 Wijzigingen Opslaan'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
