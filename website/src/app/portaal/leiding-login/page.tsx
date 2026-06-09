'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

const DEMO_KNOPPEN = [
  { rol: 'leiding',       label: 'Demo Leiding',        kleur: '#1A3D2A', omschrijving: 'Tak-leiding' },
  { rol: 'groepsleiding', label: 'Demo Groepsleiding',  kleur: '#2A5C3F', omschrijving: 'Volledig beheer' },
]

export default function LeidingLoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    document.body.style.paddingTop = '0'
    return () => {
      document.body.style.paddingTop = ''
    }
  }, [])

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

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 22, boxShadow: '0 16px 50px rgba(26,61,42,.13)', border: '1px solid #C2D9C9', overflow: 'hidden' }}>

        <div style={{ padding: '32px 40px 38px' }}>
          <div style={{ fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontSize: '1.25rem', fontWeight: 900, color: '#1A3D2A', marginBottom: 6 }}>Inloggen — Leiding</div>
          <div style={{ fontSize: '.88rem', color: '#6A8A75', marginBottom: 24, lineHeight: 1.55 }}>
            Log in met je persoonlijk <strong>Scouts & Gidsen Vlaanderen</strong>-account. Je rol en takken worden automatisch herkend.
          </div>

          {error && <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: '.85rem', fontWeight: 600, textAlign: 'center', marginBottom: 18, background: 'hsla(349,51%,47%,.1)', border: '1.5px solid #B23A4D', color: '#B23A4D' }}>{error}</div>}

          {/* S&G OAuth knop (placeholder) */}
          <button disabled style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '14px', background: '#E8EEF0', border: '1.5px solid #C2D9C9', borderRadius: 14, fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700, color: '#6A8A75', cursor: 'not-allowed', marginBottom: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
            Inloggen via Scouts & Gidsen
          </button>
          <p style={{ fontSize: '.75rem', color: '#6A8A75', textAlign: 'center', marginBottom: 24 }}>
            S&G OAuth wordt actief zodra de API-key geconfigureerd is.
          </p>

          {/* Scheidingslijn */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#C2D9C9' }} />
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#6A8A75', textTransform: 'uppercase', letterSpacing: '.08em' }}>Demo-accounts</span>
            <div style={{ flex: 1, height: 1, background: '#C2D9C9' }} />
          </div>

          {/* Demo knoppen leiding */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEMO_KNOPPEN.map(d => (
              <button key={d.rol} onClick={() => demoLogin(d.rol)} disabled={status === 'loading'}
                style={{ padding: '13px 16px', background: d.kleur, color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontSize: '.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: status === 'loading' ? .7 : 1 }}>
                <span>{d.label}</span>
                <span style={{ fontSize: '.75rem', fontWeight: 400, opacity: .8 }}>{d.omschrijving}</span>
              </button>
            ))}
          </div>

        </div>
      </div>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '.88rem', fontWeight: 600, color: '#6A8A75', textDecoration: 'none' }}>
        ← Terug naar de website
      </Link>
    </div>
  )
}
