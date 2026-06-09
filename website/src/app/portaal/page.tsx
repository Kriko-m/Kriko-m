'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

type Tab = 'ouder' | 'leiding'
type SubTab = 'login' | 'register'

const DEMO_KNOPPEN = [
  { rol: 'ouder',         label: 'Demo Ouder',         kleur: '#2A5C3F', omschrijving: 'Ouder met kinderen' },
  { rol: 'leiding',       label: 'Demo Leiding',        kleur: '#1A3D2A', omschrijving: 'Tak-leiding' },
  { rol: 'groepsleiding', label: 'Demo Groepsleiding',  kleur: '#1A3D2A', omschrijving: 'Volledig beheer' },
]

export default function PortaalPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#EEF5F1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <img src="/images/logo-finaal.png" alt="Kriko-M laden…" style={{ width: 80, height: 80, objectFit: 'contain' }} />
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1A3D2A', fontFamily: 'Outfit, sans-serif' }}>Laden...</div>
      </div>
    }>
      <PortaalContent />
    </Suspense>
  )
}

function PortaalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/portaal/dashboard'
  
  const [tab, setTab] = useState<Tab>('ouder')
  const [subTab, setSubTab] = useState<SubTab>('login')
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const supabase = createClient()

  useEffect(() => {
    document.body.style.paddingTop = '0'
    return () => {
      document.body.style.paddingTop = ''
    }
  }, [])

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading'); setError('')
    const fd = new FormData(e.currentTarget)
    const { error } = await supabase.auth.signInWithPassword({
      email: fd.get('email') as string,
      password: fd.get('password') as string,
    })
    if (error) { setError('Ongeldig e-mailadres of wachtwoord.'); setStatus('idle') }
    else { router.push(redirectTo); router.refresh() }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading'); setError('')
    const fd = new FormData(e.currentTarget)
    const { data, error } = await supabase.auth.signUp({
      email: fd.get('email') as string,
      password: fd.get('password') as string,
      options: { data: { naam: fd.get('naam') } },
    })
    if (error) {
      setError(error.message.includes('already') ? 'Dit e-mailadres is al geregistreerd.' : error.message)
      setStatus('idle')
    } else if (data.session) {
      router.push(redirectTo); router.refresh()
    } else {
      setInfo('Controleer je inbox en bevestig je e-mailadres.')
      setStatus('idle')
    }
  }

  async function demoLogin(rol: string) {
    setStatus('loading'); setError('')
    const res = await fetch('/api/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol }),
    })
    if (!res.ok) { setError('Demo-login mislukt.'); setStatus('idle'); return }
    const { email, password } = await res.json()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Demo-login mislukt: ' + error.message); setStatus('idle') }
    else { router.push(redirectTo); router.refresh() }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EEF5F1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 20, fontFamily: 'var(--font-body, Outfit, sans-serif)' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Image src="/images/logo-finaal.png" alt="Kriko-M logo" width={52} height={52} style={{ objectFit: 'contain' }} />
        <div style={{ lineHeight: 1.1 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '.06em', textTransform: 'uppercase', color: '#1A3D2A' }}>Kriko-M</span>
          <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#6A8A75', textTransform: 'uppercase', letterSpacing: '.08em' }}>Scouts & Gidsen Sint-Niklaas</span>
          <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#BE8A2E', background: '#FEF3C7', padding: '2px 8px', borderRadius: 20, marginTop: 4, display: 'inline-block', border: '1px solid #F5D0A9' }}>
            Beveiligd Leden- &amp; Ouderportaal
          </span>
        </div>
      </div>

      {info && (
        <div style={{ width: '100%', maxWidth: 520, padding: '12px 16px', borderRadius: 12, fontSize: '.88rem', fontWeight: 600, textAlign: 'center', background: 'hsla(145,33%,36%,.12)', border: '1.5px solid #3F7D5A', color: '#2C5A40' }}>
          {info}
        </div>
      )}

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 22, boxShadow: '0 16px 50px rgba(26,61,42,.13)', border: '1px solid #C2D9C9', overflow: 'hidden' }}>

        {/* Hoofd-tabs: Ouder / Leiding (Capsule style) */}
        <div style={{ padding: '24px 30px 0' }}>
          <div className="portal-tabs-wrapper">
            {(['ouder', 'leiding'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setInfo(''); setSubTab('login') }}
                className={`portal-tab-btn ${tab === t ? 'active' : ''}`}
              >
                {t === 'ouder' ? '👨‍👩‍👧 Ouder / Lid' : '🛡️ Leiding'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 40px 38px' }}>

          {/* ── OUDER TAB ── */}
          {tab === 'ouder' && (
            <>
              {/* Sub-tabs: login / register */}
              <div className="portal-subtabs-wrapper">
                {(['login', 'register'] as SubTab[]).map(st => (
                  <button
                    key={st}
                    onClick={() => { setSubTab(st); setError('') }}
                    className={`portal-subtab-btn ${subTab === st ? 'active' : ''}`}
                  >
                    {st === 'login' ? '🔑 Inloggen' : '📝 Registreren'}
                  </button>
                ))}
              </div>

              {error && <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: '.85rem', fontWeight: 600, textAlign: 'center', marginBottom: 18, background: 'hsla(349,51%,47%,.1)', border: '1.5px solid #B23A4D', color: '#B23A4D' }}>{error}</div>}

              {subTab === 'login' ? (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>E-mailadres</label>
                    <input type="email" name="email" required placeholder="naam@voorbeeld.be" autoFocus className="form-control" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>Wachtwoord</label>
                    <input type="password" name="password" required placeholder="••••••••" className="form-control" />
                  </div>
                  <button type="submit" disabled={status === 'loading'} className="btn btn-secondary" style={{ width: '100%', padding: '14px', marginTop: 8 }}>
                    {status === 'loading' ? 'Bezig…' : 'Inloggen →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>Naam</label>
                    <input type="text" name="naam" required placeholder="Voornaam Achternaam" autoFocus className="form-control" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>E-mailadres</label>
                    <input type="email" name="email" required placeholder="naam@voorbeeld.be" className="form-control" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>Wachtwoord <span style={{ fontWeight: 400, color: '#6A8A75' }}>(min. 6 tekens)</span></label>
                    <input type="password" name="password" required placeholder="••••••••" minLength={6} className="form-control" />
                  </div>
                  <button type="submit" disabled={status === 'loading'} className="btn btn-secondary" style={{ width: '100%', padding: '14px', marginTop: 8 }}>
                    {status === 'loading' ? 'Bezig…' : 'Account aanmaken →'}
                  </button>
                </form>
              )}

              {/* Demo ouder */}
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #C2D9C9' }}>
                <button onClick={() => demoLogin('ouder')} disabled={status === 'loading'} className="btn btn-outline"
                  style={{ width: '100%', padding: '11px', borderStyle: 'dashed', background: 'transparent' }}>
                  Demo ouder-account gebruiken
                </button>
              </div>
            </>
          )}

          {/* ── LEIDING TAB ── */}
          {tab === 'leiding' && (
            <>
              <div style={{ fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontSize: '1.25rem', fontWeight: 900, color: '#1A3D2A', marginBottom: 6, marginTop: 12 }}>Inloggen — Leiding</div>
              <div style={{ fontSize: '.88rem', color: '#6A8A75', marginBottom: 24, lineHeight: 1.55 }}>
                Log in met je <strong>Scouts &amp; Gidsen Vlaanderen</strong>-account. Je rol en takken worden automatisch herkend.
              </div>

              {error && <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: '.85rem', fontWeight: 600, textAlign: 'center', marginBottom: 18, background: 'hsla(349,51%,47%,.1)', border: '1.5px solid #B23A4D', color: '#B23A4D' }}>{error}</div>}

              {/* S&G OAuth knop (placeholder) */}
              <button disabled className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '14px', background: '#E8EEF0', border: '1.5px solid #C2D9C9', color: '#6A8A75', cursor: 'not-allowed', marginBottom: 8, boxShadow: 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
                Inloggen via Scouts &amp; Gidsen
              </button>
              <p style={{ fontSize: '.75rem', color: '#6A8A75', textAlign: 'center', marginBottom: 24 }}>
                S&amp;G OAuth wordt actief zodra de API-key geconfigureerd is.
              </p>

              {/* Scheidingslijn */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: '#C2D9C9' }} />
                <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#6A8A75', textTransform: 'uppercase', letterSpacing: '.08em' }}>Demo-accounts</span>
                <div style={{ flex: 1, height: 1, background: '#C2D9C9' }} />
              </div>

              {/* Demo knoppen leiding */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DEMO_KNOPPEN.filter(d => d.rol !== 'ouder').map(d => (
                  <button key={d.rol} onClick={() => demoLogin(d.rol)} disabled={status === 'loading'} className="btn"
                    style={{ padding: '13px 16px', background: d.kleur, color: '#fff', border: 'none', fontSize: '.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: status === 'loading' ? .7 : 1 }}>
                    <span>{d.label}</span>
                    <span style={{ fontSize: '.75rem', fontWeight: 400, opacity: .8 }}>{d.omschrijving}</span>
                  </button>
                ))}
              </div>
            </>
          )}

        </div>
      </div>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '.88rem', fontWeight: 600, color: '#6A8A75', textDecoration: 'none' }}>
        ← Terug naar de website
      </Link>
    </div>
  )
}
