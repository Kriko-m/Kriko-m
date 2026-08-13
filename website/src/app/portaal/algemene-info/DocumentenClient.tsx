'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PortalResource } from '@/app/api/admin/portal-resources/route'

interface Props {
  initialResources: PortalResource[]
  isGroepsleiding: boolean
}

const PRESET_CATEGORIES = [
  'Snelkoppelingen',
  '🏕️ Kamp',
  '💶 Financieel',
  '🎲 Spel & Activiteiten',
  '📑 Veiligheid & Formulieren',
  'Algemeen'
]

const ICON_OPTIONS = [
  { label: 'Map / Bestanden', icon: 'fa-brands fa-google-drive' },
  { label: 'Tent / Kamp', icon: 'fa-solid fa-tent' },
  { label: 'Checklist', icon: 'fa-solid fa-clipboard-check' },
  { label: 'Rekenmachine', icon: 'fa-solid fa-calculator' },
  { label: 'Kassabon', icon: 'fa-solid fa-receipt' },
  { label: 'Spel / Document', icon: 'fa-solid fa-file-pen' },
  { label: 'Lijst / Overzicht', icon: 'fa-solid fa-list-check' },
  { label: 'Ideeën / Lamp', icon: 'fa-solid fa-lightbulb' },
  { label: 'Medisch', icon: 'fa-solid fa-notes-medical' },
  { label: 'Telefoon / Nood', icon: 'fa-solid fa-phone-volume' },
  { label: 'Administratie / Tandwiel', icon: 'fa-solid fa-users-gear' },
  { label: 'Kompas', icon: 'fa-solid fa-compass-drafting' },
  { label: 'Facebook', icon: 'fa-brands fa-facebook' },
  { label: 'Standaard Bestand', icon: 'fa-solid fa-file' },
]

function ResourceCard({
  item,
  showEditControls,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: PortalResource
  showEditControls: boolean
  onEdit: (item: PortalResource) => void
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  const handleClick = () => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 18px',
        borderRadius: 16,
        background: '#fff',
        border: showEditControls ? '2px solid #1A3D2A' : '1.5px solid #C2D9C9',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        cursor: item.url ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      className="action-card-hover"
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: '#EEF5F1',
          color: '#1A3D2A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          flexShrink: 0,
        }}
      >
        <i className={item.icon}></i>
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingRight: showEditControls ? 64 : 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={{ fontSize: '.95rem', fontWeight: 800, color: '#1A3D2A', lineHeight: 1.3 }}>
            {item.label}
          </strong>
          {item.url && (
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '.72rem', color: '#6A8A75', flexShrink: 0 }}></i>
          )}
        </div>
        {item.description && (
          <p style={{ margin: '3px 0 0', fontSize: '.82rem', color: '#6A8A75', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.description}
          </p>
        )}
      </div>

      {showEditControls && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: 4,
            background: '#fff',
            padding: '3px 5px',
            borderRadius: 8,
            border: '1px solid #C2D9C9',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(item)
            }}
            title="Bewerken"
            style={{
              background: 'none',
              border: 'none',
              borderRadius: 6,
              padding: '4px 6px',
              fontSize: '.78rem',
              color: '#1A3D2A',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
            disabled={isDeleting}
            title="Verwijderen"
            style={{
              background: 'none',
              border: 'none',
              borderRadius: 6,
              padding: '4px 6px',
              fontSize: '.78rem',
              color: '#B91C1C',
              cursor: 'pointer',
            }}
          >
            <i className="fa-solid fa-trash-can"></i>
          </button>
        </div>
      )}
    </div>
  )
}

export default function DocumentenClient({ initialResources, isGroepsleiding }: Props) {
  const router = useRouter()
  const [resources, setResources] = useState<PortalResource[]>(initialResources)
  const [editMode, setEditMode] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortalResource | null>(null)

  // Form states
  const [type, setType] = useState<'quicklink' | 'document'>('document')
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('🏕️ Kamp')
  const [customCategory, setCustomCategory] = useState('')
  const [url, setUrl] = useState('')
  const [icon, setIcon] = useState('fa-solid fa-file')
  const [sortOrder, setSortOrder] = useState<number>(10)

  // UI states
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openNewModal(defaultType: 'quicklink' | 'document' = 'document') {
    setEditingItem(null)
    setType(defaultType)
    setLabel('')
    setDescription('')
    setCategory(defaultType === 'quicklink' ? 'Snelkoppelingen' : '🏕️ Kamp')
    setCustomCategory('')
    setUrl('')
    setIcon(defaultType === 'quicklink' ? 'fa-brands fa-google-drive' : 'fa-solid fa-file')
    setSortOrder(defaultType === 'quicklink' ? 5 : 10)
    setError('')
    setModalOpen(true)
  }

  function openEditModal(item: PortalResource) {
    setEditingItem(item)
    setType(item.type)
    setLabel(item.label)
    setDescription(item.description)
    if (PRESET_CATEGORIES.includes(item.category)) {
      setCategory(item.category)
      setCustomCategory('')
    } else {
      setCategory('CUSTOM')
      setCustomCategory(item.category)
    }
    setUrl(item.url)
    setIcon(item.icon)
    setSortOrder(item.sort_order)
    setError('')
    setModalOpen(true)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'portal-document')

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fout bij uploaden')

      setUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bestand kon niet geüpload worden')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return

    setSubmitting(true)
    setError('')

    const finalCategory = category === 'CUSTOM' ? customCategory.trim() : category

    const payload = {
      type,
      label: label.trim(),
      description: description.trim(),
      category: finalCategory || 'Algemeen',
      url: url.trim(),
      icon,
      sort_order: sortOrder,
    }

    try {
      let res: Response
      if (editingItem) {
        res = await fetch(`/api/admin/portal-resources/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/portal-resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fout bij opslaan')

      if (editingItem) {
        setResources(prev => prev.map(r => (r.id === editingItem.id ? data : r)))
      } else {
        setResources(prev => [...prev, data])
      }

      setModalOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout ingetreden')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je dit item wilt verwijderen?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/portal-resources/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fout bij verwijderen')

      setResources(prev => prev.filter(r => r.id !== id))
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Verwijderen mislukt')
    } finally {
      setDeletingId(null)
    }
  }

  const quicklinks = resources.filter(r => r.type === 'quicklink')
  const documentItems = resources.filter(r => r.type === 'document')

  // Group document items by category
  const categoriesMap = documentItems.reduce((acc, item) => {
    const cat = item.category || 'Algemeen'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, PortalResource[]>)

  const showEditControls = isGroepsleiding && editMode

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header with Title & Action Button */}
      <header style={{ marginBottom: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, color: '#1A3D2A', fontWeight: 900, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            📁 Documenten & Links
          </h1>
          <p style={{ margin: '6px 0 0', color: '#6A8A75', fontSize: '.95rem' }}>
            Handige sjablonen, checklists, links en formulieren voor de leiding.
          </p>
        </div>

        {isGroepsleiding && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 10,
                background: editMode ? '#1A3D2A' : '#fff',
                color: editMode ? '#fff' : '#1A3D2A',
                border: '1.5px solid #1A3D2A',
                fontWeight: 700,
                fontSize: '.82rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(26,61,42,0.08)',
                transition: 'all 0.15s ease',
              }}
            >
              <i className={editMode ? 'fa-solid fa-check' : 'fa-solid fa-pen-to-square'}></i>
              <span>{editMode ? 'Klaar met bewerken' : 'Bewerken'}</span>
            </button>

            {editMode && (
              <button
                onClick={() => openNewModal('document')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: '#C9963A',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(201,150,58,0.18)',
                  transition: 'transform 0.15s, background-color 0.15s',
                }}
                className="action-card-hover"
              >
                <i className="fa-solid fa-plus"></i>
                <span>Nieuw Item Toevoegen</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Top Quicklinks / Snelkoppelingen */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1A3D2A', margin: 0 }}>
            ⚡ Snelkoppelingen
          </h2>
          {showEditControls && (
            <button
              onClick={() => openNewModal('quicklink')}
              style={{ background: 'none', border: 'none', color: '#1A3D2A', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <i className="fa-solid fa-plus-circle"></i> Snelkoppeling toevoegen
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {quicklinks.map(link => (
            <ResourceCard
              key={link.id}
              item={link}
              showEditControls={showEditControls}
              onEdit={openEditModal}
              onDelete={handleDelete}
              isDeleting={deletingId === link.id}
            />
          ))}
        </div>
      </section>

      {/* Documenten & Sjablonen per Categorie */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {Object.entries(categoriesMap).map(([catName, items]) => (
          <section key={catName}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A3D2A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              {catName}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {items.map(item => (
                <ResourceCard
                  key={item.id}
                  item={item}
                  showEditControls={showEditControls}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  isDeleting={deletingId === item.id}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Modal for Adding / Editing Resource */}
      {modalOpen && (
        <div className="portaal-modal-overlay">
          <div className="portaal-modal-card" style={{ maxWidth: 540 }}>
            <div className="portaal-modal-header">
              <h3 className="portaal-modal-title">
                {editingItem ? '✏️ Item Bewerken' : '➕ Nieuw Item Toevoegen'}
              </h3>
              <button className="portaal-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="portaal-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {error && (
                  <div className="portaal-modal-alert error">
                    {error}
                  </div>
                )}

                {/* Type Selection */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <label style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: type === 'document' ? '2px solid #1A3D2A' : '1px solid #C2D9C9', background: type === 'document' ? '#EEF5F1' : '#fff' }}>
                    <input
                      type="radio"
                      name="res_type"
                      checked={type === 'document'}
                      onChange={() => {
                        setType('document')
                        if (category === 'Snelkoppelingen') setCategory('🏕️ Kamp')
                      }}
                    />
                    <strong style={{ fontSize: '.9rem', color: '#1A3D2A' }}>📄 Document / Sjabloon</strong>
                  </label>
                  <label style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: type === 'quicklink' ? '2px solid #1A3D2A' : '1px solid #C2D9C9', background: type === 'quicklink' ? '#EEF5F1' : '#fff' }}>
                    <input
                      type="radio"
                      name="res_type"
                      checked={type === 'quicklink'}
                      onChange={() => {
                        setType('quicklink')
                        setCategory('Snelkoppelingen')
                      }}
                    />
                    <strong style={{ fontSize: '.9rem', color: '#1A3D2A' }}>⚡ Snelkoppeling</strong>
                  </label>
                </div>

                {/* Title / Label */}
                <div>
                  <label className="form-label" htmlFor="res_label">Titel / Naam *</label>
                  <input
                    type="text"
                    id="res_label"
                    className="form-control"
                    placeholder="bijv. Kampgids 2026 of Kasboek Sjabloon"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="form-label" htmlFor="res_desc">Korte Beschrijving</label>
                  <input
                    type="text"
                    id="res_desc"
                    className="form-control"
                    placeholder="bijv. Handleiding en stappenplan voor het kamp."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Category Selection */}
                {type === 'document' && (
                  <div>
                    <label className="form-label" htmlFor="res_cat">Categorie</label>
                    <select
                      id="res_cat"
                      className="form-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {PRESET_CATEGORIES.filter(c => c !== 'Snelkoppelingen').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="CUSTOM">+ Nieuwe categorie toevoegen…</option>
                    </select>

                    {category === 'CUSTOM' && (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nieuwe categorienaam (bijv. 📁 EHBO & Veiligheid)"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        style={{ marginTop: 8 }}
                        required
                      />
                    )}
                  </div>
                )}

                {/* URL / Link / File Upload */}
                <div>
                  <label className="form-label" htmlFor="res_url">Link / URL (Google Drive of website)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="url"
                      id="res_url"
                      className="form-control"
                      placeholder="https://drive.google.com/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '0 14px',
                      borderRadius: 10,
                      background: '#EEF5F1',
                      border: '1.5px solid #C2D9C9',
                      fontSize: '.85rem',
                      fontWeight: 700,
                      color: '#1A3D2A',
                      cursor: uploading ? 'wait' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}>
                      <i className={uploading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-upload'}></i>
                      <span>{uploading ? 'Uploaden...' : 'Upload'}</span>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      />
                    </label>
                  </div>
                  <span style={{ fontSize: '.75rem', color: '#6A8A75', marginTop: 4, display: 'block' }}>
                    Plak een Google Drive link of upload rechtstreeks een PDF/bestand.
                  </span>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="form-label">Icoontje</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 110, overflowY: 'auto', padding: 4, border: '1px solid #C2D9C9', borderRadius: 10 }}>
                    {ICON_OPTIONS.map(opt => (
                      <button
                        key={opt.icon}
                        type="button"
                        onClick={() => setIcon(opt.icon)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: icon === opt.icon ? '2px solid #1A3D2A' : '1px solid #E0E0E0',
                          background: icon === opt.icon ? '#EEF5F1' : '#fff',
                          color: '#1A3D2A',
                          fontSize: '1.1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={opt.label}
                      >
                        <i className={opt.icon}></i>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="portaal-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={submitting || !label.trim()}
                >
                  {submitting ? 'Opslaan…' : 'Opslaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
