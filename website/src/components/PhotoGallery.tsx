'use client'
import { useState } from 'react'

export default function PhotoGallery({ photos }: { photos: string[] }) {
  const [lightbox, setLightbox] = useState<number|null>(null)

  return (
    <>
      <div className="verhuur-gallery">
        {photos.map((src, i) => (
          <button
            key={src} type="button"
            className="verhuur-photo"
            aria-label={`Foto ${i+1} vergroten`}
            onClick={() => setLightbox(i)}
            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          >
            <img src={src} alt={`Lokaal Scouts Kriko-M — foto ${i+1}`} loading="lazy" />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={() => setLightbox(null)}
        >
          <button type="button" onClick={() => setLightbox(null)}
            style={{ position:'absolute', top:20, right:24, background:'none', border:'none', color:'#fff', fontSize:'2rem', cursor:'pointer', lineHeight:1 }}>
            &times;
          </button>
          <button type="button"
            style={{ position:'absolute', left:20, background:'none', border:'none', color:'#fff', fontSize:'2rem', cursor:'pointer' }}
            onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length) }}>
            <i className="fa-solid fa-chevron-left"/>
          </button>
          <img
            src={photos[lightbox]}
            alt={`Foto ${lightbox+1}`}
            style={{ maxHeight:'90vh', maxWidth:'90vw', borderRadius:12, boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          />
          <button type="button"
            style={{ position:'absolute', right:20, background:'none', border:'none', color:'#fff', fontSize:'2rem', cursor:'pointer' }}
            onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length) }}>
            <i className="fa-solid fa-chevron-right"/>
          </button>
          <span style={{ position:'absolute', bottom:20, color:'rgba(255,255,255,0.6)', fontSize:'0.9rem' }}>
            {lightbox+1} / {photos.length}
          </span>
        </div>
      )}
    </>
  )
}
