export default function PortaalLoading() {
  return (
    <div
      className="portaal-loading-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 260,
        right: 0,
        bottom: 0,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        background: 'rgba(22, 37, 68, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-finaal.png" alt="" aria-hidden="true" style={{ width: 64, height: 64, objectFit: 'contain', animation: 'portaal-pulse 1.5s infinite ease-in-out' }} />
        <div style={{ width: 120, height: 4, background: 'rgba(255, 255, 255, 0.25)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', height: '100%', width: '50%', background: '#FFFFFF', borderRadius: 2, animation: 'portaal-loading-bar 1.2s infinite ease-in-out' }} />
        </div>
      </div>
      <style>{`
        @keyframes portaal-pulse { 0%,100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.08); opacity: 1; } }
        @keyframes portaal-loading-bar { 0% { left: -50%; } 100% { left: 100%; } }
        @media (max-width: 900px) {
          .portaal-loading-overlay { top: 0 !important; left: 0 !important; }
        }
      `}</style>
    </div>
  )
}

