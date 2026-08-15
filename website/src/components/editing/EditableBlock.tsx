'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import EditBlockModal from './EditBlockModal'

interface Props {
  blockKey: string
  page: string
  section: string
  initialTitle?: string
  initialContent?: string
  initialImageUrl?: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function EditableBlock({
  blockKey,
  page,
  section,
  initialTitle = '',
  initialContent = '',
  initialImageUrl = '',
  children,
  className = '',
  style = {},
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLeiding, setIsLeiding] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const editQuery = searchParams.get('edit') === 'true'
    const storedEdit = localStorage.getItem('kriko_edit_mode') === 'true'
    setIsEditMode(editQuery || storedEdit)

    fetch('/api/admin/portal-resources')
      .then(res => {
        if (res.ok) setIsLeiding(true)
      })
      .catch(() => setIsLeiding(false))
  }, [searchParams])

  const canEdit = isLeiding && isEditMode

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{
        position: 'relative',
        outline: canEdit && isHovered ? '2px dashed #C9963A' : 'none',
        outlineOffset: 4,
        borderRadius: 8,
        transition: 'outline 0.15s ease',
        ...style,
      }}
    >
      {canEdit && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsModalOpen(true)
          }}
          type="button"
          title={`Bewerken: ${blockKey}`}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 999,
            backgroundColor: '#1A3D2A',
            color: '#C9963A',
            border: '1.5px solid #C9963A',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            opacity: isHovered ? 1 : 0.7,
            transition: 'all 0.15s ease',
          }}
        >
          ✏️
        </button>
      )}

      {children}

      {isModalOpen && (
        <EditBlockModal
          blockKey={blockKey}
          page={page}
          section={section}
          initialTitle={initialTitle}
          initialContent={initialContent}
          initialImageUrl={initialImageUrl}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
