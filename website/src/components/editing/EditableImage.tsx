'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { useEditMode } from './EditContext'

interface EditableImageProps {
  blockKey: string
  page: string
  section?: string
  defaultSrc: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  unoptimized?: boolean
  className?: string
  style?: React.CSSProperties
  imageStyle?: React.CSSProperties
  uploadType?: string
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  children?: React.ReactNode
}

export default function EditableImage({
  blockKey,
  page,
  section = 'general',
  defaultSrc,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  unoptimized = false,
  className = '',
  style = {},
  imageStyle = {},
  uploadType = 'site-content',
  badgePosition = 'top-right',
}: EditableImageProps) {
  const { isEditMode, getContent, setDraftContent } = useEditMode()
  const currentSrc = getContent(blockKey, 'image_url', defaultSrc)

  const [isHovered, setIsHovered] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Normal visitor mode
  if (!isEditMode) {
    if (fill) {
      return (
        <Image
          src={currentSrc}
          alt={alt}
          fill
          priority={priority}
          unoptimized={unoptimized}
          className={className}
          style={{ objectFit: 'cover', ...imageStyle }}
        />
      )
    }
    return (
      <Image
        src={currentSrc}
        alt={alt}
        width={width || 800}
        height={height || 533}
        priority={priority}
        unoptimized={unoptimized}
        className={className}
        style={imageStyle}
      />
    )
  }

  // Live Edit Mode (Groepsleiding)
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', uploadType)
      if (currentSrc && currentSrc.startsWith('http')) {
        formData.append('oldUrl', currentSrc)
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Uploaden van foto mislukt.')
      }

      const data = await res.json()
      if (data.url) {
        setDraftContent(blockKey, {
          page,
          section,
          image_url: data.url,
        })
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Fout bij uploaden foto')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`editable-image-container ${className}`}
      style={{
        position: fill ? 'absolute' : 'relative',
        inset: fill ? 0 : undefined,
        width: fill ? '100%' : undefined,
        height: fill ? '100%' : undefined,
        display: fill ? 'block' : 'inline-block',
        ...style,
      }}
    >
      {fill ? (
        <Image
          src={currentSrc}
          alt={alt}
          fill
          priority={priority}
          unoptimized={unoptimized}
          style={{ objectFit: 'cover', ...imageStyle }}
        />
      ) : (
        <Image
          src={currentSrc}
          alt={alt}
          width={width || 800}
          height={height || 533}
          priority={priority}
          unoptimized={unoptimized}
          style={imageStyle}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Sleek single-color camera upload badge on hover */}
      <button
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          fileInputRef.current?.click()
        }}
        onMouseDown={e => e.stopPropagation()}
        disabled={isUploading}
        type="button"
        title="Klik om een nieuwe foto te uploaden"
        style={{
          position: 'absolute',
          ...(badgePosition === 'top-left'
            ? { top: 12, left: 12 }
            : badgePosition === 'bottom-left'
            ? { bottom: 12, left: 12 }
            : badgePosition === 'bottom-right'
            ? { bottom: 12, right: 12 }
            : { top: 12, right: 12 }),
          zIndex: 99,
          backgroundColor: '#162544',
          color: '#FFFFFF',
          border: '1.5px solid #243B6B',
          borderRadius: 24,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.82rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading, Nunito, sans-serif)',
          cursor: isUploading ? 'wait' : 'pointer',
          boxShadow: '0 4px 14px rgba(22, 37, 68, 0.45)',
          opacity: isHovered || isUploading ? 1 : 0.85,
          transition: 'all 0.15s ease',
        }}
      >
        {isUploading ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" style={{ color: '#E2C58D' }}></i>
            <span>Uploaden…</span>
          </>
        ) : (
          <>
            <i className="fa-solid fa-camera" style={{ color: '#FFFFFF', fontSize: '0.92rem' }}></i>
            <span>Foto wijzigen</span>
          </>
        )}
      </button>
    </div>
  )
}
