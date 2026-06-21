'use client'

import { usePathname } from 'next/navigation'

export default function PortaalLoading() {
  const pathname = usePathname()
  const hasNav = pathname !== '/portaal' && pathname !== '/portaal/'

  if (hasNav) {
    return (
      <div className="portaal-dashboard-bg-wrapper" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/leiding_25-26.jpg" className="portaal-dashboard-bg-img" alt="" aria-hidden="true" />
        
        <div className="portaal-dashboard-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
          <img src="/images/logo-finaal.png" alt="Kriko-M laden…" style={{ width: 80, height: 80, objectFit: 'contain', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1A3D2A', letterSpacing: '0.5px', fontFamily: 'var(--font-outfit), sans-serif' }}>
            Laden...
          </div>
          <div style={{ width: 120, height: 4, background: '#C2D9C9', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              position: 'absolute', height: '100%', width: '50%', background: '#1A3D2A', borderRadius: 2,
              animation: 'loading-bar 1.2s infinite ease-in-out'
            }} />
          </div>
        </div>
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }
          @keyframes loading-bar {
            0% { left: -50%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundImage: 'url(/images/leiding_25-26.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 20, fontFamily: 'var(--font-body, Outfit, sans-serif)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,61,42,0.55)', backdropFilter: 'blur(2px)' }} />

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, background: '#fff', borderRadius: 22, boxShadow: '0 24px 60px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
        <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <img src="/images/logo-finaal.png" alt="Kriko-M laden…" style={{ width: 80, height: 80, objectFit: 'contain', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1A3D2A', letterSpacing: '0.5px', fontFamily: 'var(--font-outfit), sans-serif' }}>
            Laden...
          </div>
          <div style={{ width: 120, height: 4, background: '#C2D9C9', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              position: 'absolute', height: '100%', width: '50%', background: '#1A3D2A', borderRadius: 2,
              animation: 'loading-bar 1.2s infinite ease-in-out'
            }} />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes loading-bar {
          0% { left: -50%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}
