export default function PortaalLoading() {
  return (
    <div
      className="portaal-loading-overlay"
      style={{
        position: 'fixed',
        top: 76,
        left: 0,
        right: 0,
        bottom: 0,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        background: 'rgba(240, 236, 228, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-finaal.png" alt="" aria-hidden="true" style={{ width: 64, height: 64, objectFit: 'contain', animation: 'portaal-pulse 1.5s infinite ease-in-out' }} />
        <div style={{ width: 120, height: 4, background: 'rgba(194,217,201,0.8)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', height: '100%', width: '50%', background: '#1A3D2A', borderRadius: 2, animation: 'portaal-loading-bar 1.2s infinite ease-in-out' }} />
        </div>
      </div>
      <style>{`
        @keyframes portaal-pulse { 0%,100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.08); opacity: 1; } }
        @keyframes portaal-loading-bar { 0% { left: -50%; } 100% { left: 100%; } }
        @media (max-width: 900px) {
          .portaal-loading-overlay { top: 60px !important; }
        }
      `}</style>
    </div>
  )
}

