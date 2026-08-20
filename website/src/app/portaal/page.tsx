'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function PortaalPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#EEF5F1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-finaal.png" alt="Kriko-M laden…" style={{ width: 80, height: 80, objectFit: 'contain' }} />
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1A3D2A', fontFamily: 'var(--font-outfit), sans-serif' }}>Laden...</div>
      </div>
    }>
      <PortaalContent />
    </Suspense>
  )
}

function PortaalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedRole, setSelectedRole] = useState<'leiding' | 'groepsleiding' | 'webshop'>('leiding')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setError('⚠️ Geen toegang: Je account heeft onvoldoende rechten om die pagina te bekijken. Log in met het juiste account.')
    }
  }, [searchParams])

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!password) {
      setError('Vul een wachtwoord in.')
      return
    }

    setStatus('loading')
    setError('')

    const emailsToTry = selectedRole === 'leiding' 
      ? ['leiding@kriko-m.be', 'demo-leiding@kriko-m.be'] 
      : selectedRole === 'groepsleiding'
      ? ['groepsleiding@kriko-m.be', 'demo-groepsleiding@kriko-m.be']
      : ['webshop@kriko-m.be', 'demo-webshop@kriko-m.be']

    try {
      // Ensure accounts exist in Supabase Auth
      await fetch('/api/auth/ensure-accounts', { method: 'POST' })

      let loginSuccess = false
      let lastError = ''

      for (const email of emailsToTry) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (!authError) {
          loginSuccess = true
          break
        } else {
          lastError = authError.message
        }
      }

      if (!loginSuccess) {
        setError(lastError || 'Ongeldig wachtwoord voor gekozen rol.')
        setStatus('idle')
      } else {
        const defaultTarget = selectedRole === 'webshop' ? '/portaal/webshop/bestellingen' : '/portaal/home'
        const target = searchParams.get('redirect') || defaultTarget
        router.push(target)
        router.refresh()
      }
    } catch {
      setError('Er is een fout opgetreden bij het inloggen.')
      setStatus('idle')
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundImage: 'url(/images/leiding_25-26.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 24, fontFamily: 'var(--font-body, Outfit, sans-serif)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(26,61,42,0.75) 0%, rgba(37,82,57,0.85) 100%)', backdropFilter: 'blur(3px)' }} />

      {/* Logo */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
        <Image src="/images/logo-finaal.png" alt="Kriko-M logo" width={68} height={68} style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }} />
        <div style={{ lineHeight: 1.2 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900, fontSize: '2rem', letterSpacing: '.06em', textTransform: 'uppercase', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>Kriko-M</span>
          <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(217,207,179,0.25)', border: '1px solid rgba(217,207,179,0.4)', backdropFilter: 'blur(4px)', padding: '3px 12px', borderRadius: 20, color: '#EDE8D0', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ⚜️ LEIDINGSPORTAAL
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, background: '#fff', borderRadius: 20, boxShadow: '0 24px 60px rgba(0,0,0,0.35)', overflow: 'hidden', borderTop: '5px solid #650B19' }}>
        <div style={{ padding: '36px 36px 38px' }}>
          <div style={{ fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontSize: '1.4rem', fontWeight: 900, color: '#1A3D2A', marginBottom: 22, textAlign: 'center' }}>Inloggen op het Portaal</div>

          {error && <div style={{ padding: '12px 14px', borderRadius: 12, fontSize: '.88rem', fontWeight: 600, textAlign: 'center', marginBottom: 20, background: 'rgba(178,58,77,0.08)', border: '1.5px solid #B23A4D', color: '#B23A4D' }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 8 }}>
                Selecteer Account
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'leiding' | 'groepsleiding' | 'webshop')}
                className="portaal-select"
              >
                <option value="leiding">Leiding</option>
                <option value="groepsleiding">Groepsleiding</option>
                <option value="webshop">Webshop &amp; uniformen</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 8 }}>
                Wachtwoord
              </label>
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="portaal-input"
                autoFocus
              />
            </div>

            <button type="submit" disabled={status === 'loading'} className="portaal-btn-primary" style={{ width: '100%', padding: '14px', marginTop: 8, fontSize: '0.95rem' }}>
              {status === 'loading' ? 'Inloggen…' : `Inloggen als ${selectedRole === 'leiding' ? 'Leiding' : selectedRole === 'groepsleiding' ? 'Groepsleiding' : 'Webshop & uniformen'} →`}
            </button>
          </form>
        </div>
      </div>

      <Link href="/" style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', background: 'rgba(0,0,0,0.25)', padding: '8px 16px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
        ← Terug naar de publieke website
      </Link>
    </div>
  )
}
