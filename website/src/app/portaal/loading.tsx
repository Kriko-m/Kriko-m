'use client'

import { usePathname } from 'next/navigation'

export default function PortaalLoading() {
  const pathname = usePathname()
  const hasNav = pathname !== '/portaal' && pathname !== '/portaal/'

  return (
    <div style={{
      minHeight: hasNav ? 'calc(100vh - 64px)' : '100vh',
      background: '#EEF5F1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      paddingBottom: 80
    }}>
      <img src="/images/logo-finaal.png" alt="Kriko-M laden…" style={{ width: 80, height: 80, objectFit: 'contain', animation: 'pulse 1.5s infinite ease-in-out' }} />
      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1A3D2A', letterSpacing: '0.5px', fontFamily: 'Outfit, sans-serif' }}>
        Laden...
      </div>
      <div style={{ width: 120, height: 4, background: '#C2D9C9', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', height: '100%', width: '50%', background: '#1A3D2A', borderRadius: 2,
          animation: 'loading-bar 1.2s infinite ease-in-out'
        }} />
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
