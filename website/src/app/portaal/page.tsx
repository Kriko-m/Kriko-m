'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

type Tab = 'login' | 'register'

export default function PortaalPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    const fd = new FormData(e.currentTarget)
    const { error } = await supabase.auth.signInWithPassword({
      email: fd.get('email') as string,
      password: fd.get('password') as string,
    })
    if (error) {
      setError('Ongeldig e-mailadres of wachtwoord.')
      setStatus('idle')
    } else {
      router.push('/portaal/dashboard')
      router.refresh()
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string
    const naam = fd.get('naam') as string

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { naam } },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Dit e-mailadres is al geregistreerd. Probeer in te loggen.'
        : error.message)
      setStatus('idle')
      return
    }

    if (data.session) {
      // Auto-confirm → direct ingelogd
      router.push('/portaal/dashboard')
      router.refresh()
    } else {
      // Bevestigingse-mail vereist
      setInfo('Controleer je inbox en bevestig je e-mailadres om door te gaan.')
      setStatus('idle')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EEF5F1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 20, fontFamily: 'var(--font-body, Outfit, sans-serif)' }}>

      {/* Logo + naam */}
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

        {/* Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #C2D9C9' }}>
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setInfo('') }}
              style={{
                padding: '18px 16px', background: 'none', border: 'none',
                fontFamily: 'inherit', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                color: tab === t ? '#1A3D2A' : '#6A8A75',
                background: tab === t ? 'color-mix(in srgb, #1A3D2A 6%, transparent)' : 'none',
                borderBottom: tab === t ? '2px solid #1A3D2A' : 'none',
                marginBottom: tab === t ? -2 : 0,
              }}
            >
              {t === 'login' ? '🔑 Inloggen' : '📝 Account aanmaken'}
            </button>
          ))}
        </div>

        <div style={{ padding: '36px 40px 40px' }}>
          {tab === 'login' ? (
            <>
              <div style={{ fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontSize: '1.35rem', fontWeight: 900, color: '#1A3D2A', marginBottom: 6 }}>Inloggen</div>
              <div style={{ fontSize: '.88rem', color: '#6A8A75', marginBottom: 24, lineHeight: 1.55 }}>
                Voor ouders en leiding van Scouts Kriko-M.
              </div>
              {error && <div style={{ padding: '11px 14px', borderRadius: 10, fontSize: '.85rem', fontWeight: 600, textAlign: 'center', marginBottom: 18, background: 'hsla(349,51%,47%,.1)', border: '1.5px solid #B23A4D', color: '#B23A4D' }}>{error}</div>}
              <form onSubmit={handleLogin}>
                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>E-mailadres</label>
                <input type="email" name="email" required placeholder="naam@voorbeeld.be" autoFocus
                  style={{ width: '100%', padding: '13px 15px', border: '2px solid #C2D9C9', borderRadius: 14, fontFamily: 'inherit', fontSize: '.97rem', marginBottom: 16, outline: 'none', boxSizing: 'border-box' }} />
                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>Wachtwoord</label>
                <input type="password" name="password" required placeholder="••••••••"
                  style={{ width: '100%', padding: '13px 15px', border: '2px solid #C2D9C9', borderRadius: 14, fontFamily: 'inherit', fontSize: '.97rem', marginBottom: 0, outline: 'none', boxSizing: 'border-box' }} />
                <button type="submit" disabled={status === 'loading'}
                  style={{ display: 'block', width: '100%', marginTop: 22, padding: 15, background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: '1.02rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '.02em' }}>
                  {status === 'loading' ? 'Bezig…' : 'Inloggen →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontSize: '1.35rem', fontWeight: 900, color: '#1A3D2A', marginBottom: 6 }}>Account aanmaken</div>
              <div style={{ fontSize: '.88rem', color: '#6A8A75', marginBottom: 24, lineHeight: 1.55 }}>
                Registreer je als ouder om bestellingen op te volgen en kampen te beheren.
              </div>
              {error && <div style={{ padding: '11px 14px', borderRadius: 10, fontSize: '.85rem', fontWeight: 600, textAlign: 'center', marginBottom: 18, background: 'hsla(349,51%,47%,.1)', border: '1.5px solid #B23A4D', color: '#B23A4D' }}>{error}</div>}
              <form onSubmit={handleRegister}>
                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>Naam</label>
                <input type="text" name="naam" required placeholder="Voornaam Achternaam"
                  style={{ width: '100%', padding: '13px 15px', border: '2px solid #C2D9C9', borderRadius: 14, fontFamily: 'inherit', fontSize: '.97rem', marginBottom: 16, outline: 'none', boxSizing: 'border-box' }} />
                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>E-mailadres</label>
                <input type="email" name="email" required placeholder="naam@voorbeeld.be"
                  style={{ width: '100%', padding: '13px 15px', border: '2px solid #C2D9C9', borderRadius: 14, fontFamily: 'inherit', fontSize: '.97rem', marginBottom: 16, outline: 'none', boxSizing: 'border-box' }} />
                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>Wachtwoord</label>
                <input type="password" name="password" required placeholder="Minimaal 6 tekens" minLength={6}
                  style={{ width: '100%', padding: '13px 15px', border: '2px solid #C2D9C9', borderRadius: 14, fontFamily: 'inherit', fontSize: '.97rem', outline: 'none', boxSizing: 'border-box' }} />
                <button type="submit" disabled={status === 'loading'}
                  style={{ display: 'block', width: '100%', marginTop: 22, padding: 15, background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: '1.02rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '.02em' }}>
                  {status === 'loading' ? 'Bezig…' : 'Account aanmaken →'}
                </button>
              </form>
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
