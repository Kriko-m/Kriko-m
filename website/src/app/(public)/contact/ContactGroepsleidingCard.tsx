'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Leader } from '@/lib/types'
import EditLeidingModal from '@/components/editing/EditLeidingModal'

interface Props {
  initialLeaders: Leader[]
  initialPhoto?: string | null
}

export default function ContactGroepsleidingCard({
  initialLeaders,
  initialPhoto = null,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [leaders, setLeaders] = useState<Leader[]>(initialLeaders)
  const [photo, setPhoto] = useState<string | null>(initialPhoto)
  const [isGroepsleiding, setIsGroepsleiding] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setLeaders(initialLeaders)
  }, [initialLeaders])

  useEffect(() => {
    setPhoto(initialPhoto)
  }, [initialPhoto])

  useEffect(() => {
    const editQuery = searchParams.get('edit') === 'true'
    const storedEdit = Boolean(
      typeof window !== 'undefined' &&
      (sessionStorage.getItem('kriko_edit_mode') === 'true' || localStorage.getItem('kriko_edit_mode') === 'true')
    )
    setIsEditMode(editQuery || storedEdit)

    fetch('/api/admin/check-groepsleiding')
      .then(res => res.json())
      .then(data => setIsGroepsleiding(Boolean(data.isGroepsleiding)))
      .catch(() => setIsGroepsleiding(false))
  }, [searchParams])

  const canEdit = isGroepsleiding && isEditMode

  return (
    <div className="side-card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.25rem' }}>
          Groepsleiding
        </h3>

        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            style={{
              backgroundColor: '#1A3D2A',
              color: '#C9963A',
              border: '1.5px solid #C9963A',
              borderRadius: 20,
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            ✏️ Bewerken
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {leaders.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0, fontSize: '0.9rem' }}>
            Er is momenteel geen groepsleiding ingesteld.
          </p>
        ) : (
          leaders.map((leader, i) => (
            <div
              key={leader.name + i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '12px 16px',
                backgroundColor: 'var(--color-bg-linen)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--color-primary-dark)' }}>
                    {leader.name}
                  </div>
                  {leader.totem && (
                    <div style={{ fontSize: '0.88rem', color: 'var(--color-text-dark)', fontStyle: 'italic', marginTop: 2 }}>
                      {leader.totem}
                    </div>
                  )}
                </div>

                {leader.phone ? (
                  <a
                    href={`tel:${leader.phone.replace(/\s+/g, '')}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      backgroundColor: '#fff',
                      padding: '6px 12px',
                      borderRadius: 'var(--border-radius-md)',
                      border: '1px solid var(--color-border)',
                      textDecoration: 'none',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <i className="fa-solid fa-phone" style={{ color: 'var(--color-secondary)', fontSize: '0.85em' }}></i>
                    {leader.phone}
                  </a>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    -
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <EditLeidingModal
          slug="groepsleiding"
          takName="Groepsleiding"
          initialPhoto={photo}
          initialLeaders={leaders}
          onClose={() => setIsModalOpen(false)}
          onSaved={(savedLeaders, savedPhoto) => {
            setLeaders(savedLeaders)
            setPhoto(savedPhoto)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
