'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings } from '@/lib/types'

interface Props {
  initialSettings: Settings
}

export default function WebsiteBeheerClient({ initialSettings }: Props) {
  const [saving, setSaving] = useState(false)
  const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // System settings (Bank, Lidgeld, Alert Banner)
  const [alertActive, setAlertActive] = useState<boolean>(initialSettings.alert_active ?? false)
  const [alertMessage, setAlertMessage] = useState<string>(initialSettings.alert_message || '')
  
  const [bankIban, setBankIban] = useState<string>(initialSettings.bank_iban || '')
  const [bankBic, setBankBic] = useState<string>(initialSettings.bank_bic || '')
  const [bankHolder, setBankHolder] = useState<string>(initialSettings.bank_holder || '')
  const [scoutsYear, setScoutsYear] = useState<string>(initialSettings.scouts_year || '2026-2027')
  const [regFeeFirst, setRegFeeFirst] = useState<number>(initialSettings.reg_fee_first || 50.0)
  const [regFeeExtra, setRegFeeExtra] = useState<number>(initialSettings.reg_fee_extra || 45.0)

  function showNotification(type: 'success' | 'error', text: string) {
    setFlashMessage({ type, text })
    setTimeout(() => setFlashMessage(null), 4000)
  }

  async function handleSaveSystemSettings() {
    setSaving(true)
    try {
      const payload = {
        alert_active: alertActive,
        alert_message: alertMessage,
        bank_iban: bankIban,
        bank_bic: bankBic,
        bank_holder: bankHolder,
        scouts_year: scoutsYear,
        reg_fee_first: regFeeFirst,
        reg_fee_extra: regFeeExtra,
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

      showNotification('success', 'Systeeminstellingen succesvol opgeslagen!')
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Fout bij opslaan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '36px 20px', fontFamily: 'var(--font-body, Outfit, sans-serif)' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/portaal/home" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          &larr; Terug naar portaal
        </Link>
        <h1 style={{ margin: '8px 0 4px', color: '#1A3D2A', fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
          🌐 Website Beheer
        </h1>
        <p style={{ margin: 0, color: '#6A8A75', fontSize: '1rem' }}>
          Beheer alle inhoud, teksten en foto&apos;s rechtstreeks live op de website.
        </p>
      </div>

      {/* Notification Toast */}
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

      {/* Main Live Edit Action Card */}
      <div style={{
        backgroundColor: '#1A3D2A',
        borderRadius: 20,
        padding: '36px 32px',
        color: '#fff',
        marginBottom: 36,
        boxShadow: '0 8px 24px rgba(26, 61, 42, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 16,
      }}>
        <div style={{ fontSize: '2.8rem' }}>✨</div>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>
          Live Website Bewerken
        </h2>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '1rem', maxWidth: 560, lineHeight: 1.6 }}>
          Surfe rechtstreeks op de website als groepsleider. Bij hover over titels, alinea&apos;s, tradities, leidingploegen en foto&apos;s verschijnt een potloodje ✏️ waarmee je de inhoud direct live aanpast.
        </p>
        <Link
          href="/?edit=true"
          style={{
            marginTop: 8,
            padding: '14px 32px',
            backgroundColor: '#C9963A',
            color: '#1A3D2A',
            borderRadius: 14,
            fontWeight: 900,
            fontSize: '1.05rem',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(201, 150, 58, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            transition: 'transform 0.15s ease',
          }}
        >
          ✏️ Start Live Website Bewerken
        </Link>
      </div>

      {/* System Settings Section (Alert Banner, Bank & Lidgeld) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, alignItems: 'start' }}>
        
        {/* Alert Banner Setting */}
        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #C2D9C9', padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 4px', color: '#1A3D2A', fontSize: '1.15rem', fontWeight: 900 }}>
            📢 Meldingsbalk (Alert Banner)
          </h3>
          <p style={{ margin: '0 0 16px', color: '#6A8A75', fontSize: '0.84rem' }}>
            Toon of verberg een opvallende melding bovenaan elke pagina.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: 12, backgroundColor: '#F9FBF9', borderRadius: 10, border: '1px solid #E8F0EB' }}>
            <input
              type="checkbox"
              id="alert_active"
              checked={alertActive}
              onChange={e => setAlertActive(e.target.checked)}
              style={{ width: 20, height: 20, accentColor: '#1A3D2A', cursor: 'pointer' }}
            />
            <label htmlFor="alert_active" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1A3D2A', cursor: 'pointer' }}>
              {alertActive ? '✅ Meldingsbalk Actief' : '❌ Meldingsbalk Inactief'}
            </label>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
              Bericht
            </label>
            <textarea
              value={alertMessage}
              onChange={e => setAlertMessage(e.target.value)}
              rows={2}
              placeholder="bv. De inschrijvingen voor het nieuwe werkjaar zijn geopend!"
              style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Bank & Lidgeld Settings */}
        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #C2D9C9', padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 4px', color: '#1A3D2A', fontSize: '1.15rem', fontWeight: 900 }}>
            💳 Bank &amp; Lidgelden
          </h3>
          <p style={{ margin: '0 0 16px', color: '#6A8A75', fontSize: '0.84rem' }}>
            Bankgegevens voor webshop bestellingen en inschrijfbedragen.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 2 }}>
                  IBAN
                </label>
                <input
                  type="text"
                  value={bankIban}
                  onChange={e => setBankIban(e.target.value)}
                  placeholder="BE76 1234 5678 9012"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #C2D9C9', borderRadius: 8, fontSize: '0.86rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 2 }}>
                  BIC
                </label>
                <input
                  type="text"
                  value={bankBic}
                  onChange={e => setBankBic(e.target.value)}
                  placeholder="KREDBEBB"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #C2D9C9', borderRadius: 8, fontSize: '0.86rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 2 }}>
                  Rekeninghouder
                </label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={e => setBankHolder(e.target.value)}
                  placeholder="Scouts Kriko-M"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #C2D9C9', borderRadius: 8, fontSize: '0.86rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 2 }}>
                  Scoutsjaar
                </label>
                <input
                  type="text"
                  value={scoutsYear}
                  onChange={e => setScoutsYear(e.target.value)}
                  placeholder="2026-2027"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #C2D9C9', borderRadius: 8, fontSize: '0.86rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 2 }}>
                  Lidgeld 1e kind (€)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={regFeeFirst}
                  onChange={e => setRegFeeFirst(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #C2D9C9', borderRadius: 8, fontSize: '0.86rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 2 }}>
                  Extra kind (€)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={regFeeExtra}
                  onChange={e => setRegFeeExtra(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #C2D9C9', borderRadius: 8, fontSize: '0.86rem' }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Save Button for System Settings */}
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <button
          onClick={handleSaveSystemSettings}
          disabled={saving}
          type="button"
          style={{
            padding: '12px 24px',
            backgroundColor: '#1A3D2A',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: saving ? 'wait' : 'pointer',
            boxShadow: '0 4px 12px rgba(26, 61, 42, 0.2)',
          }}
        >
          {saving ? 'Opslaan...' : '💾 Systeeminstellingen Opslaan'}
        </button>
      </div>

    </div>
  )
}
