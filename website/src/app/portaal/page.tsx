'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

type SubTab = 'login' | 'register'

export default function PortaalPage() {
  const router = useRouter()
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
    else { router.push('/portaal/dashboard'); router.refresh() }
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
      router.push('/portaal/dashboard'); router.refresh()
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
    else { router.push('/portaal/dashboard'); router.refresh() }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 15px', border: '2px solid #C2D9C9', borderRadius: 14,
    fontFamily: 'inherit', fontSize: '.97rem', outline: 'none', boxSizing: 'border-box',
    marginBottom: 0,
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6,
  }
  const btnPrimary: React.CSSProperties = {
    display: 'block', width: '100%', marginTop: 22, padding: 15, background: '#1A3D2A',
    color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: '1.02rem',
    fontWeight: 700, cursor: 'pointer', letterSpacing: '.02em',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EEF5F1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 20, fontFamily: 'var(--font-body, Outfit, sans-serif)' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Image src="/images/logo-finaal.png" alt="Kriko-M logo" width={52} height={52} style={{ objectFit: 'contain' }} />
        <div style={{ lineHeight: 1.1 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '.06em', textTransform: 'uppercase', color: '#1A3D2A' }}>Kriko-M</span>
          <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#6A8A75', textTransform: 'uppercase', letterSpacing: '.08em' }}>Scouts & Gidsen Sint-Niklaas</span>
        </div>
      </div>

      {info && (
        <div style={{ width: '100%', maxWidth: 520, padding: '12px 16px', borderRadius: 12, fontSize: '.88rem', fontWeight: 600, textAlign: 'center', background: 'hsla(145,33%,36%,.12)', border: '1.5px solid #3F7D5A', color: '#2C5A40' }}>
          {info}
        </div>
      )}

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 22, boxShadow: '0 16px 50px rgba(26,61,42,.13)', border: '1px solid #C2D9C9', overflow: 'hidden' }}>

        <div style={{ padding: '32px 40px 38px' }}>
          {/* Title */}
          <div style={{ fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontSize: '1.35rem', fontWeight: 900, color: '#1A3D2A', marginBottom: 6 }}>Inloggen — Ouderportaal</div>
          <div style={{ fontSize: '.88rem', color: '#6A8A75', marginBottom: 24, lineHeight: 1.55 }}>
            Log in op je ouderportaal of registreer een nieuw account.
          </div>

          {/* Sub-tabs: login / register */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #C2D9C9' }}>
            {(['login', 'register'] as SubTab[]).map(st => (
              <button key={st} onClick={() => { setSubTab(st); setError('') }}
                style={{
                  flex: 1, padding: '10px 0', background: 'none', border: 'none',
                  borderBottom: subTab === st ? '2px solid #1A3D2A' : '2px solid transparent',
                  fontFamily: 'inherit', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer',
                  color: subTab === st ? '#1A3D2A' : '#6A8A75', marginBottom: -1,
                }}>
                {st === 'login' ? '🔑 Inloggen' : '📝 Registreren'}
              </button>
            ))}
          </div>

          {error && <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: '.85rem', fontWeight: 600, textAlign: 'center', marginBottom: 18, background: 'hsla(349,51%,47%,.1)', border: '1.5px solid #B23A4D', color: '#B23A4D' }}>{error}</div>}

          {subTab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>E-mailadres</label>
                <input type="email" name="email" required placeholder="naam@voorbeeld.be" autoFocus style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Wachtwoord</label>
                <input type="password" name="password" required placeholder="••••••••" style={inputStyle} />
              </div>
              <button type="submit" disabled={status === 'loading'} style={btnPrimary}>
                {status === 'loading' ? 'Bezig…' : 'Inloggen →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Naam</label>
                <input type="text" name="naam" required placeholder="Voornaam Achternaam" autoFocus style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>E-mailadres</label>
                <input type="email" name="email" required placeholder="naam@voorbeeld.be" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Wachtwoord <span style={{ fontWeight: 400, color: '#6A8A75' }}>(min. 6 tekens)</span></label>
                <input type="password" name="password" required placeholder="••••••••" minLength={6} style={inputStyle} />
              </div>
              <button type="submit" disabled={status === 'loading'} style={btnPrimary}>
                {status === 'loading' ? 'Bezig…' : 'Account aanmaken →'}
              </button>
            </form>
          )}

          {/* Demo ouder */}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #C2D9C9' }}>
            <button onClick={() => demoLogin('ouder')} disabled={status === 'loading'}
              style={{ width: '100%', padding: '11px', background: 'none', border: '1.5px dashed #6A8A75', borderRadius: 12, fontFamily: 'inherit', fontSize: '.88rem', fontWeight: 600, color: '#6A8A75', cursor: 'pointer' }}>
              Demo ouder-account gebruiken
            </button>
          </div>

        </div>
      </div>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '.88rem', fontWeight: 600, color: '#6A8A75', textDecoration: 'none' }}>
        ← Terug naar de website
      </Link>
    </div>
  )
}
