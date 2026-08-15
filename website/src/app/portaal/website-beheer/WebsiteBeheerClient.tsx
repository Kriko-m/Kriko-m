'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TAKKEN, TAK_NAMEN, TAK_KLEUREN } from '@/lib/constants'
import { Settings, Leader } from '@/lib/types'

interface Props {
  initialSettings: Settings
}

type TabType = 'takken' | 'home' | 'bank'

export default function WebsiteBeheerClient({ initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('takken')
  const [selectedTak, setSelectedTak] = useState<string>(TAKKEN[0])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form states
  const [homeLeidingFoto, setHomeLeidingFoto] = useState<string>(initialSettings.home_leiding_foto || '/images/leiding_25-26.jpg')
  const [alertActive, setAlertActive] = useState<boolean>(initialSettings.alert_active ?? false)
  const [alertMessage, setAlertMessage] = useState<string>(initialSettings.alert_message || '')
  
  const [bankIban, setBankIban] = useState<string>(initialSettings.bank_iban || '')
  const [bankBic, setBankBic] = useState<string>(initialSettings.bank_bic || '')
  const [bankHolder, setBankHolder] = useState<string>(initialSettings.bank_holder || '')
  const [scoutsYear, setScoutsYear] = useState<string>(initialSettings.scouts_year || '2026-2027')
  const [regFeeFirst, setRegFeeFirst] = useState<number>(initialSettings.reg_fee_first || 50.0)
  const [regFeeExtra, setRegFeeExtra] = useState<number>(initialSettings.reg_fee_extra || 45.0)

  // Takken state
  const [takkenData, setTakkenData] = useState<Record<string, {
    email: string
    whatsapp_url: string
    photo: string
    leaders: Leader[]
  }>>(() => {
    const init: Record<string, { email: string; whatsapp_url: string; photo: string; leaders: Leader[] }> = {}
    for (const tak of TAKKEN) {
      const c = initialSettings.takken?.[tak] || {}
      init[tak] = {
        email: c.email || '',
        whatsapp_url: c.whatsapp_url || '',
        photo: c.photo || `/images/leiding_${tak}.jpg`,
        leaders: Array.isArray(c.leaders) && c.leaders.length > 0
          ? c.leaders.map(l => ({ name: l.name || '', totem: l.totem || '', role: l.role || 'Leid(st)er', phone: l.phone || '' }))
          : []
      }
    }
    return init
  })

  const currentTakData = takkenData[selectedTak] || { email: '', whatsapp_url: '', photo: `/images/leiding_${selectedTak}.jpg`, leaders: [] }

  function showNotification(type: 'success' | 'error', text: string) {
    setFlashMessage({ type, text })
    setTimeout(() => setFlashMessage(null), 4000)
  }

  // --- Tak handlers ---
  function updateTakField(field: 'email' | 'whatsapp_url' | 'photo', value: string) {
    setTakkenData(prev => ({
      ...prev,
      [selectedTak]: { ...prev[selectedTak], [field]: value }
    }))
  }

  function updateLeader(index: number, field: keyof Leader, value: string) {
    setTakkenData(prev => {
      const updatedLeaders = [...prev[selectedTak].leaders]
      updatedLeaders[index] = { ...updatedLeaders[index], [field]: value }
      return {
        ...prev,
        [selectedTak]: { ...prev[selectedTak], leaders: updatedLeaders }
      }
    })
  }

  function addLeader() {
    setTakkenData(prev => ({
      ...prev,
      [selectedTak]: {
        ...prev[selectedTak],
        leaders: [...prev[selectedTak].leaders, { name: '', totem: '', role: 'Leid(st)er', phone: '' }]
      }
    }))
  }

  function removeLeader(index: number) {
    setTakkenData(prev => ({
      ...prev,
      [selectedTak]: {
        ...prev[selectedTak],
        leaders: prev[selectedTak].leaders.filter((_, i) => i !== index)
      }
    }))
  }

  function moveLeader(index: number, direction: 'up' | 'down') {
    setTakkenData(prev => {
      const leaders = [...prev[selectedTak].leaders]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= leaders.length) return prev
      const temp = leaders[index]
      leaders[index] = leaders[targetIndex]
      leaders[targetIndex] = temp
      return {
        ...prev,
        [selectedTak]: { ...prev[selectedTak], leaders }
      }
    })
  }

  // --- Upload handlers ---
  async function handleFileUpload(file: File, type: 'tak-leiding-foto' | 'home-leiding-foto') {
    setUploading(type)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload mislukt')
      }

      const data = await res.json()
      if (type === 'tak-leiding-foto') {
        updateTakField('photo', data.url)
        showNotification('success', `Foto voor ${TAK_NAMEN[selectedTak]} succesvol geüpload!`)
      } else {
        setHomeLeidingFoto(data.url)
        showNotification('success', 'Startpagina groepsfoto succesvol geüpload!')
      }
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Upload mislukt')
    } finally {
      setUploading(null)
    }
  }

  // --- Save Handler ---
  async function handleSaveAll() {
    setSaving(true)
    try {
      const payload = {
        home_leiding_foto: homeLeidingFoto,
        alert_active: alertActive,
        alert_message: alertMessage,
        bank_iban: bankIban,
        bank_bic: bankBic,
        bank_holder: bankHolder,
        scouts_year: scoutsYear,
        reg_fee_first: regFeeFirst,
        reg_fee_extra: regFeeExtra,
        takken: takkenData,
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

      showNotification('success', 'Alle wijzigingen succesvol opgeslagen op de website!')
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Fout bij opslaan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 20px', fontFamily: 'var(--font-body, Outfit, sans-serif)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/portaal/home" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              &larr; Terug naar portaal
            </Link>
          </div>
          <h1 style={{ margin: '6px 0 0', color: '#1A3D2A', fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.02em' }}>
            🌐 Website Beheer
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6A8A75', fontSize: '0.95rem' }}>
            Beheer leiding, takfoto&apos;s, de startpaginafoto, meldingsbalk en bankgegevens van Scouts Kriko-M.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          type="button"
          style={{
            padding: '12px 28px',
            backgroundColor: '#1A3D2A',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: saving ? 'wait' : 'pointer',
            boxShadow: '0 4px 14px rgba(26, 61, 42, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            transition: 'transform 0.15s ease, background-color 0.15s ease',
          }}
        >
          {saving ? 'Opslaan...' : '💾 Alles Opslaan'}
        </button>
      </div>

      {/* Notification toast */}
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

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid #E8F0EB', marginBottom: 28 }}>
        <button
          onClick={() => setActiveTab('takken')}
          type="button"
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'takken' ? '3px solid #1A3D2A' : '3px solid transparent',
            color: activeTab === 'takken' ? '#1A3D2A' : '#6A8A75',
            fontWeight: activeTab === 'takken' ? 900 : 700,
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: -2,
          }}
        >
          ⚜️ Takken &amp; Leiding
        </button>
        <button
          onClick={() => setActiveTab('home')}
          type="button"
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'home' ? '3px solid #1A3D2A' : '3px solid transparent',
            color: activeTab === 'home' ? '#1A3D2A' : '#6A8A75',
            fontWeight: activeTab === 'home' ? 900 : 700,
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: -2,
          }}
        >
          🏠 Startpagina &amp; Banner
        </button>
        <button
          onClick={() => setActiveTab('bank')}
          type="button"
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'bank' ? '3px solid #1A3D2A' : '3px solid transparent',
            color: activeTab === 'bank' ? '#1A3D2A' : '#6A8A75',
            fontWeight: activeTab === 'bank' ? 900 : 700,
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: -2,
          }}
        >
          💳 Bank &amp; Lidgeld
        </button>
      </div>

      {/* TAB 1: TAKKEN & LEIDING */}
      {activeTab === 'takken' && (
        <div>
          {/* Tak Sub-selector */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {TAKKEN.map(tak => (
              <button
                key={tak}
                onClick={() => setSelectedTak(tak)}
                type="button"
                style={{
                  padding: '10px 20px',
                  borderRadius: 24,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  border: selectedTak === tak ? `2.5px solid ${TAK_KLEUREN[tak]}` : '1.5px solid #C2D9C9',
                  backgroundColor: selectedTak === tak ? '#EEF5F1' : '#fff',
                  color: '#1A3D2A',
                  boxShadow: selectedTak === tak ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {TAK_NAMEN[tak]}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
            
            {/* Kolom 1: Tak Leidingsfoto & Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Tak Leidingsfoto Card */}
              <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #C2D9C9', padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 4px', color: '#1A3D2A', fontSize: '1.15rem', fontWeight: 900 }}>
                  📷 Leidingsfoto ({TAK_NAMEN[selectedTak]})
                </h3>
                <p style={{ margin: '0 0 16px', color: '#6A8A75', fontSize: '0.84rem' }}>
                  Deze schuine foto staat op de publieke takpagina van de {TAK_NAMEN[selectedTak]}.
                </p>

                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', backgroundColor: '#F0ECE4', border: '1px solid #E2C58D', marginBottom: 16 }}>
                  {currentTakData.photo ? (
                    <Image
                      src={currentTakData.photo}
                      alt={`Leidingsfoto ${TAK_NAMEN[selectedTak]}`}
                      fill
                      unoptimized
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6A8A75', fontSize: '0.9rem' }}>
                      Geen foto ingesteld
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <label
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px 14px',
                      backgroundColor: '#EEF5F1',
                      border: '1.5px dashed #1A3D2A',
                      borderRadius: 10,
                      color: '#1A3D2A',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: uploading ? 'wait' : 'pointer',
                    }}
                  >
                    {uploading === 'tak-leiding-foto' ? 'Uploaden...' : '📷 Nieuwe foto uploaden'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      disabled={uploading === 'tak-leiding-foto'}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'tak-leiding-foto')
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Tak Contact & WhatsApp */}
              <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #C2D9C9', padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 16px', color: '#1A3D2A', fontSize: '1.15rem', fontWeight: 900 }}>
                  ✉️ Contact &amp; WhatsApp
                </h3>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                    E-mailadres takleiding
                  </label>
                  <input
                    type="email"
                    value={currentTakData.email}
                    onChange={e => updateTakField('email', e.target.value)}
                    placeholder={`${selectedTak}leiding@kriko-m.be`}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                    WhatsApp Ouders-groep Link
                  </label>
                  <input
                    type="url"
                    value={currentTakData.whatsapp_url}
                    onChange={e => updateTakField('whatsapp_url', e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

            </div>

            {/* Kolom 2: Leidingsploeg Beheer */}
            <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #C2D9C9', padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1A3D2A', fontSize: '1.15rem', fontWeight: 900 }}>
                    👥 Leidingsploeg {TAK_NAMEN[selectedTak]}
                  </h3>
                  <p style={{ margin: '2px 0 0', color: '#6A8A75', fontSize: '0.82rem' }}>
                    Beheer de namen, totems, rollen en telefoonnummers.
                  </p>
                </div>
                <button
                  onClick={addLeader}
                  type="button"
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#EEF5F1',
                    border: '1.5px solid #1A3D2A',
                    borderRadius: 8,
                    color: '#1A3D2A',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  + Leid(st)er Toevoegen
                </button>
              </div>

              {currentTakData.leaders.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#6A8A75', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Nog geen leiding voor {TAK_NAMEN[selectedTak]} toegevoegd.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {currentTakData.leaders.map((leader, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: '#F9FBF9',
                        border: '1px solid #E8F0EB',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1A3D2A', backgroundColor: '#EEF5F1', padding: '2px 8px', borderRadius: 6 }}>
                          Leider #{i + 1}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => moveLeader(i, 'up')}
                            disabled={i === 0}
                            type="button"
                            title="Omhoog bewegen"
                            style={{ border: 'none', background: 'none', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.3 : 0.8, fontSize: '0.9rem' }}
                          >
                            ⬆️
                          </button>
                          <button
                            onClick={() => moveLeader(i, 'down')}
                            disabled={i === currentTakData.leaders.length - 1}
                            type="button"
                            title="Omlaag bewegen"
                            style={{ border: 'none', background: 'none', cursor: i === currentTakData.leaders.length - 1 ? 'default' : 'pointer', opacity: i === currentTakData.leaders.length - 1 ? 0.3 : 0.8, fontSize: '0.9rem' }}
                          >
                            ⬇️
                          </button>
                          <button
                            onClick={() => removeLeader(i)}
                            type="button"
                            title="Verwijder"
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#B23A4D', fontSize: '1rem', marginLeft: 6 }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#6A8A75', textTransform: 'uppercase', marginBottom: 2 }}>
                            Naam *
                          </label>
                          <input
                            type="text"
                            value={leader.name}
                            onChange={e => updateLeader(i, 'name', e.target.value)}
                            placeholder="Voornaam Achternaam"
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #C2D9C9', borderRadius: 8, fontSize: '0.88rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#6A8A75', textTransform: 'uppercase', marginBottom: 2 }}>
                            Rol
                          </label>
                          <input
                            type="text"
                            value={leader.role || ''}
                            onChange={e => updateLeader(i, 'role', e.target.value)}
                            placeholder="Takleiding / Leider / Leidster"
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #C2D9C9', borderRadius: 8, fontSize: '0.88rem' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#6A8A75', textTransform: 'uppercase', marginBottom: 2 }}>
                            Totem
                          </label>
                          <input
                            type="text"
                            value={leader.totem || ''}
                            onChange={e => updateLeader(i, 'totem', e.target.value)}
                            placeholder="e.g. Blijmoedige Beo"
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #C2D9C9', borderRadius: 8, fontSize: '0.88rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#6A8A75', textTransform: 'uppercase', marginBottom: 2 }}>
                            Telefoonnummer
                          </label>
                          <input
                            type="tel"
                            value={leader.phone || ''}
                            onChange={e => updateLeader(i, 'phone', e.target.value)}
                            placeholder="+32 470 00 00 00"
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #C2D9C9', borderRadius: 8, fontSize: '0.88rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: STARTPAGINA & BANNER */}
      {activeTab === 'home' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>
          
          {/* Startpagina Leidingsfoto */}
          <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #C2D9C9', padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#1A3D2A', fontSize: '1.15rem', fontWeight: 900 }}>
              📸 Startpagina Groepsfoto
            </h3>
            <p style={{ margin: '0 0 16px', color: '#6A8A75', fontSize: '0.84rem' }}>
              Deze groepsfoto staat prominent op de homepage van de website naast het welkomstbericht.
            </p>

            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', borderRadius: 12, overflow: 'hidden', backgroundColor: '#F0ECE4', border: '1px solid #E2C58D', marginBottom: 16 }}>
              {homeLeidingFoto ? (
                <Image
                  src={homeLeidingFoto}
                  alt="Startpagina groepsfoto"
                  fill
                  unoptimized
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6A8A75', fontSize: '0.9rem' }}>
                  Geen foto ingesteld
                </div>
              )}
            </div>

            <label
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '12px 14px',
                backgroundColor: '#EEF5F1',
                border: '1.5px dashed #1A3D2A',
                borderRadius: 10,
                color: '#1A3D2A',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: uploading ? 'wait' : 'pointer',
              }}
            >
              {uploading === 'home-leiding-foto' ? 'Uploaden...' : '📷 Nieuwe startpaginafoto uploaden'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                disabled={uploading === 'home-leiding-foto'}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'home-leiding-foto')
                }}
              />
            </label>
          </div>

          {/* Meldingsbalk / Alert Banner */}
          <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #C2D9C9', padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#1A3D2A', fontSize: '1.15rem', fontWeight: 900 }}>
              📢 Meldingsbalk (Alert Banner)
            </h3>
            <p style={{ margin: '0 0 16px', color: '#6A8A75', fontSize: '0.84rem' }}>
              Schakel een opvallende meldingsbalk in of uit bovenaan elke pagina van de website.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: 14, backgroundColor: '#F9FBF9', borderRadius: 12, border: '1px solid #E8F0EB' }}>
              <input
                type="checkbox"
                id="alert_active"
                checked={alertActive}
                onChange={e => setAlertActive(e.target.checked)}
                style={{ width: 22, height: 22, accentColor: '#1A3D2A', cursor: 'pointer' }}
              />
              <label htmlFor="alert_active" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1A3D2A', cursor: 'pointer' }}>
                {alertActive ? '✅ Meldingsbalk is ACTIEF (Zichtbaar op site)' : '❌ Meldingsbalk is INACTIEF (Verborgen)'}
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 6 }}>
                Bericht in de meldingsbalk
              </label>
              <textarea
                value={alertMessage}
                onChange={e => setAlertMessage(e.target.value)}
                rows={3}
                placeholder="bv. Welkom op de nieuwe website van Scouts Kriko-M! De inschrijvingen zijn geopend."
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: BANK & LIDGELD */}
      {activeTab === 'bank' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>
          
          {/* Bankgegevens */}
          <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #C2D9C9', padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#1A3D2A', fontSize: '1.15rem', fontWeight: 900 }}>
              🏦 Bankrekening Gegevens
            </h3>
            <p style={{ margin: '0 0 16px', color: '#6A8A75', fontSize: '0.84rem' }}>
              Deze gegevens worden getoond op bestelbevestigingen van de webshop.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                  IBAN Rekeningnummer
                </label>
                <input
                  type="text"
                  value={bankIban}
                  onChange={e => setBankIban(e.target.value)}
                  placeholder="BE76 1234 5678 9012"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                  BIC Code
                </label>
                <input
                  type="text"
                  value={bankBic}
                  onChange={e => setBankBic(e.target.value)}
                  placeholder="KRIKOBE2B"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                  Naam Rekeninghouder
                </label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={e => setBankHolder(e.target.value)}
                  placeholder="Scouts Kriko-M vzw"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>

          {/* Lidgelden & Werkjaar */}
          <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #C2D9C9', padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#1A3D2A', fontSize: '1.15rem', fontWeight: 900 }}>
              💶 Lidgeld &amp; Werkjaar
            </h3>
            <p style={{ margin: '0 0 16px', color: '#6A8A75', fontSize: '0.84rem' }}>
              Pas de inschrijvingsbedragen en het actieve werkjaar aan.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                  Actief Scoutsjaar
                </label>
                <input
                  type="text"
                  value={scoutsYear}
                  onChange={e => setScoutsYear(e.target.value)}
                  placeholder="2026-2027"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                  Lidgeld 1e kind (€)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={regFeeFirst}
                  onChange={e => setRegFeeFirst(parseFloat(e.target.value) || 0)}
                  placeholder="50.00"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                  Lidgeld extra kind (€)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={regFeeExtra}
                  onChange={e => setRegFeeExtra(parseFloat(e.target.value) || 0)}
                  placeholder="45.00"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Floating Save Footer */}
      <div style={{ marginTop: 36, padding: '16px 24px', backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #C2D9C9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <span style={{ fontSize: '0.88rem', color: '#6A8A75' }}>
          Vergeet niet om je wijzigingen op te slaan!
        </span>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          type="button"
          style={{
            padding: '12px 28px',
            backgroundColor: '#1A3D2A',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: saving ? 'wait' : 'pointer',
          }}
        >
          {saving ? 'Opslaan...' : '💾 Alles Opslaan'}
        </button>
      </div>

    </div>
  )
}
