'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

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

  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState('')

  const supabase = createClient()

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

  return (
    <div style={{ minHeight: '100vh', background: '#EEF5F1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 20, fontFamily: 'var(--font-body, Outfit, sans-serif)' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Image src="/images/logo-finaal.png" alt="Kriko-M logo" width={52} height={52} style={{ objectFit: 'contain' }} />
        <div style={{ lineHeight: 1.1 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '.06em', textTransform: 'uppercase', color: '#1A3D2A' }}>Kriko-M</span>
          <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#6A8A75', textTransform: 'uppercase', letterSpacing: '.08em' }}>Scouts &amp; Gidsen Sint-Niklaas</span>
          <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#BE8A2E', background: '#FEF3C7', padding: '2px 8px', borderRadius: 20, marginTop: 4, display: 'inline-block', border: '1px solid #F5D0A9' }}>
            Leidingsportaal
          </span>
        </div>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: 22, boxShadow: '0 16px 50px rgba(26,61,42,.13)', border: '1px solid #C2D9C9', overflow: 'hidden' }}>
        <div style={{ padding: '36px 40px 38px' }}>
          <div style={{ fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontSize: '1.25rem', fontWeight: 900, color: '#1A3D2A', marginBottom: 6 }}>Inloggen — Leiding</div>
          <div style={{ fontSize: '.88rem', color: '#6A8A75', marginBottom: 24, lineHeight: 1.55 }}>
            Dit portaal is enkel voor leiding. Ouders hoeven niet in te loggen: kampinschrijvingen verlopen via de privélink in de e-mail, en de webshop werkt zonder account.
          </div>

          {error && <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: '.85rem', fontWeight: 600, textAlign: 'center', marginBottom: 18, background: 'hsla(349,51%,47%,.1)', border: '1.5px solid #B23A4D', color: '#B23A4D' }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>E-mailadres</label>
              <input type="email" name="email" required placeholder="naam@kriko-m.be" autoFocus className="form-control" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>Wachtwoord</label>
              <input type="password" name="password" required placeholder="••••••••" className="form-control" />
            </div>
            <button type="submit" disabled={status === 'loading'} className="btn btn-secondary" style={{ width: '100%', padding: '14px', marginTop: 8 }}>
              {status === 'loading' ? 'Bezig…' : 'Inloggen →'}
            </button>
          </form>
        </div>
      </div>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '.88rem', fontWeight: 600, color: '#6A8A75', textDecoration: 'none' }}>
        ← Terug naar de website
      </Link>
    </div>
  )
}
