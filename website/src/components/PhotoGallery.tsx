'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useEditMode } from './editing/EditContext'
import EditGalleryModal from './editing/EditGalleryModal'
import EditableImage from './editing/EditableImage'
import { useScrollLock } from '@/lib/useScrollLock'

export default function PhotoGallery({ photos: initialPhotos }: { photos: string[] }) {
  const { isEditMode, getContent, setDraftContent } = useEditMode()
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useScrollLock(lightbox !== null || isEditModalOpen)

  // Get dynamic photos from site_content if available
  const galleryJson = getContent?.('verhuur.gallery.photos', 'content', '')
  const dynamicPhotos = useMemo(() => {
    if (galleryJson) {
      try {
        const parsed = JSON.parse(galleryJson)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[]
      } catch {}
    }
    return initialPhotos
  }, [galleryJson, initialPhotos])

  const [activePhotos, setActivePhotos] = useState<string[]>(dynamicPhotos)

  useEffect(() => {
    setActivePhotos(dynamicPhotos)
  }, [dynamicPhotos])

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setLightbox(curr => (curr !== null ? (curr - 1 + activePhotos.length) % activePhotos.length : null))
  }, [activePhotos.length])

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setLightbox(curr => (curr !== null ? (curr + 1) % activePhotos.length : null))
  }, [activePhotos.length])

  const handleClose = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setLightbox(null)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (lightbox === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setLightbox(curr => (curr !== null ? (curr - 1 + activePhotos.length) % activePhotos.length : null))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setLightbox(curr => (curr !== null ? (curr + 1) % activePhotos.length : null))
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setLightbox(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activePhotos.length, lightbox])

  // Touch swipe support for mobile
  const minSwipeDistance = 40

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) {
      handleNext()
    } else if (distance < -minSwipeDistance) {
      handlePrev()
    }
  }

  function handleGallerySaved(updated: string[]) {
    setActivePhotos(updated)
    setDraftContent?.('verhuur.gallery.photos', {
      page: 'verhuur',
      section: 'gallery',
      content: JSON.stringify(updated),
    })
  }

  return (
    <>
      {/* Edit Mode Management Toolbar */}
      {isEditMode && (
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <button
            onClick={() => setIsEditModalOpen(true)}
            type="button"
            style={{
              backgroundColor: '#162544',
              color: '#ffffff',
              border: '1.5px solid #243B6B',
              borderRadius: 20,
              padding: '9px 18px',
              fontSize: '0.86rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(22, 37, 68, 0.25)',
              fontFamily: 'var(--font-heading, Nunito, sans-serif)',
            }}
          >
            <i className="fa-solid fa-images" style={{ color: '#E2C58D' }}></i>
            Foto&#39;s Beheren ({activePhotos.length}) — Uploaden &amp; Verwijderen
          </button>
          <span style={{ fontSize: '0.82rem', color: '#64748B', fontStyle: 'italic' }}>
            💡 Klik op de knop om foto&#39;s te verwijderen, volgorde aan te passen of extra foto&#39;s toe te voegen.
          </span>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="verhuur-gallery">
        {activePhotos.map((src, i) => {
          const blockKey = `verhuur.gallery.photo_${i + 1}`

          if (isEditMode) {
            return (
              <div
                key={src + i}
                className="verhuur-photo"
                style={{ position: 'relative', width: '100%', minHeight: 180, borderRadius: 8, overflow: 'hidden' }}
              >
                <EditableImage
                  blockKey={blockKey}
                  page="verhuur"
                  section="gallery"
                  defaultSrc={src}
                  alt={`Lokaal Scouts Kriko-M — foto ${i + 1}`}
                  fill
                  uploadType="verhuur"
                  imageStyle={{ objectFit: 'cover' }}
                />
              </div>
            )
          }

          return (
            <button
              key={src + i}
              type="button"
              className="verhuur-photo"
              aria-label={`Foto ${i + 1} vergroten in lightbox`}
              onClick={() => setLightbox(i)}
              style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, position: 'relative', width: '100%' }}
            >
              <Image
                src={src}
                alt={`Lokaal Scouts Kriko-M — foto ${i + 1}`}
                fill
                sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            </button>
          )
        })}
      </div>

      {/* Lightbox Modal */}
      {lightbox !== null && (
        <div
          className="lightbox-overlay active"
          onClick={handleClose}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Foto galerij lightbox"
        >
          {/* Close button */}
          <button
            type="button"
            className="lightbox-close"
            onClick={handleClose}
            aria-label="Sluiten (Escape)"
            title="Sluiten (Esc)"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>

          {/* Previous image button */}
          <button
            type="button"
            className="lightbox-arrow prev"
            onClick={handlePrev}
            aria-label="Vorige foto (Pijl links)"
            title="Vorige foto (Pijltje links)"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>

          {/* Current photo */}
          <div
            className="lightbox-img-wrapper"
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhotos[lightbox]}
              alt={`Lokaal Scouts Kriko-M — foto ${lightbox + 1}`}
              className="lightbox-img"
            />
          </div>

          {/* Next image button */}
          <button
            type="button"
            className="lightbox-arrow next"
            onClick={handleNext}
            aria-label="Volgende foto (Pijl rechts)"
            title="Volgende foto (Pijltje rechts)"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>

          {/* Counter */}
          <span className="lightbox-counter">
            {lightbox + 1} / {activePhotos.length}
          </span>
        </div>
      )}

      {/* Edit Gallery Modal */}
      {isEditModalOpen && (
        <EditGalleryModal
          initialPhotos={activePhotos}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={handleGallerySaved}
        />
      )}
    </>
  )
}
