'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PortalResource } from '@/app/api/admin/portal-resources/route'

interface Props {
  initialResources: PortalResource[]
  isGroepsleiding: boolean
}

const PRESET_CATEGORIES = [
  '🏕️ Kamp',
  '💶 Financieel',
  '🎲 Spel & Activiteiten',
  '📑 Veiligheid & Formulieren',
  'Algemeen'
]

const ICON_OPTIONS = [
  { label: 'Scouts Lelie', icon: 'scouts-lelie' },
  { label: 'Huis / Lokaal', icon: 'fa-solid fa-house' },
  { label: 'Kampas (Jeugdverblijven)', icon: 'kampas' },
  { label: 'Tent / Kamp', icon: 'fa-solid fa-tent' },
  { label: 'Scoutsklaver', icon: 'fa-solid fa-clover' },
  { label: 'Geld / Biljet', icon: 'fa-solid fa-money-bill-wave' },
  { label: 'Muntstukken / Geld', icon: 'fa-solid fa-coins' },
  { label: 'Portemonnee', icon: 'fa-solid fa-wallet' },
  { label: 'Euro Teken', icon: 'fa-solid fa-euro-sign' },
  { label: 'Rekenmachine', icon: 'fa-solid fa-calculator' },
  { label: 'Kassabon', icon: 'fa-solid fa-receipt' },
  { label: 'Map / Bestanden', icon: 'fa-brands fa-google-drive' },
  { label: 'Checklist', icon: 'fa-solid fa-clipboard-check' },
  { label: 'Spel / Document', icon: 'fa-solid fa-file-pen' },
  { label: 'Lijst / Overzicht', icon: 'fa-solid fa-list-check' },
  { label: 'Ideeën / Lamp', icon: 'fa-solid fa-lightbulb' },
  { label: 'Medisch', icon: 'fa-solid fa-notes-medical' },
  { label: 'Telefoon / Nood', icon: 'fa-solid fa-phone-volume' },
  { label: 'Administratie / Tandwiel', icon: 'fa-solid fa-users-gear' },
  { label: 'Scouts & Gidsen VL Logo', icon: 'scouts-gidsen-vl' },
  { label: 'Kompas', icon: 'fa-solid fa-compass-drafting' },
  { label: 'Facebook', icon: 'fa-brands fa-facebook' },
  { label: 'Standaard Bestand', icon: 'fa-solid fa-file' },
]

function RenderIcon({ icon }: { icon: string }) {
  if (icon === 'scouts-lelie' || icon === 'fa-solid fa-fleur-de-lis' || icon === '/images/scouts-lelie.png') {
    return (
      <svg width="22" height="22" viewBox="0 0 100 100" fill="#1A3D2A" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        {/* Main Central Pointed Petal */}
        <path d="M50 4 C50 4 67 22 67 44 H33 C33 22 47 4 50 4 Z" />
        {/* Inner Diamond slit in central petal */}
        <path d="M50 12 L56 41 H44 Z" fill="#EEF5F1" />

        {/* Left Wing Petal */}
        <path d="M37 43 C22 43 10 33 13 18 C15 7 28 12 36 24 C38 29 40 37 40 43 Z" />
        {/* Left Star Cutout */}
        <polygon points="23,22 25,27 30,27 26,30 28,35 23,32 18,35 20,30 16,27 21,27" fill="#EEF5F1" />

        {/* Right Wing Petal */}
        <path d="M63 43 C78 43 90 33 87 18 C85 7 72 12 64 24 C62 29 60 37 60 43 Z" />
        {/* Right Star Cutout */}
        <polygon points="77,22 79,27 84,27 80,30 82,35 77,32 72,35 74,30 70,27 75,27" fill="#EEF5F1" />

        {/* Horizontal Tie Ring */}
        <rect x="29" y="47" width="42" height="7" rx="3.5" />

        {/* Lower Base Cutouts & Tail */}
        <path d="M35 56 C28 66 35 78 44 75 C44 68 39 60 39 56 Z" />
        <path d="M65 56 C72 66 65 78 56 75 C56 68 61 60 61 56 Z" />
        <path d="M44 56 L50 86 L56 56 Z" />
      </svg>
    )
  }

  if (icon === 'kampas' || icon === 'kampas-logo' || icon === '/images/kampas-logo.svg') {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src="/images/kampas-logo.svg"
        alt="Kampas Logo"
        width={24}
        height={24}
        style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 4, display: 'block', flexShrink: 0 }}
      />
    )
  }

  if (
    icon === 'scouts-gidsen-vl' ||
    icon === 'scouts-gidsen-vlaanderen' ||
    icon === 'fa-solid fa-compass-drafting' ||
    icon === '/images/scouts-gidsen-vl.svg'
  ) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src="/images/scouts-gidsen-vl.svg"
        alt="Scouts & Gidsen Vlaanderen Logo"
        width={24}
        height={24}
        style={{ width: 24, height: 24, objectFit: 'contain', display: 'block', flexShrink: 0 }}
      />
    )
  }

  return <i className={icon || 'fa-solid fa-file'}></i>
}

function ResourceCard({
  item,
  showEditControls,
  onEdit,
  onDelete,
  isDeleting,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  item: PortalResource
  showEditControls: boolean
  onEdit: (item: PortalResource) => void
  onDelete: (item: PortalResource) => void
  isDeleting: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  isDragging: boolean
}) {
  const handleClick = () => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      onClick={handleClick}
      draggable={showEditControls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 20px',
        borderRadius: 18,
        background: '#fff',
        border: showEditControls ? '2px solid #1A3D2A' : '1.5px solid #C2D9C9',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        cursor: showEditControls ? 'grab' : item.url ? 'pointer' : 'default',
        opacity: isDragging ? 0.4 : 1,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="action-card-hover"
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #EEF5F1 0%, #E3EFE8 100%)',
          color: '#1A3D2A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          flexShrink: 0,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        <RenderIcon icon={item.icon} />
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingRight: showEditControls ? 64 : 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {showEditControls && (
            <i className="fa-solid fa-grip-vertical" style={{ color: '#A0A0A0', fontSize: '.8rem', marginRight: 2, cursor: 'grab' }}></i>
          )}
          <strong style={{ fontSize: '.98rem', fontWeight: 800, color: '#1A3D2A', lineHeight: 1.3 }}>
            {item.label}
          </strong>
        </div>

        {item.description && (
          <p style={{ margin: '2px 0 0', fontSize: '.82rem', color: '#4A6855', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.description}
          </p>
        )}
      </div>

      {!showEditControls && item.url && (
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#EEF5F1',
          color: '#1A3D2A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.85rem',
          flexShrink: 0,
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}>
          <i className="fa-solid fa-chevron-right"></i>
        </div>
      )}

      {showEditControls && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: 4,
            background: '#fff',
            padding: '4px 6px',
            borderRadius: 10,
            border: '1.5px solid #C2D9C9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
              onDelete(item)
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

  // Separate Modal states
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false)

  // Custom In-Page Confirm Modal state (Rendered at top z-index: 1200)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmBtnText, setConfirmBtnText] = useState('Verwijderen')
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void> | void) | null>(null)

  const [newCategoryInput, setNewCategoryInput] = useState('')
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [editCategoryInput, setEditCategoryInput] = useState('')

  const [userCreatedCategories, setUserCreatedCategories] = useState<string[]>([])
  const [editingItem, setEditingItem] = useState<PortalResource | null>(null)

  // Drag and Drop states
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverCat, setDragOverCat] = useState<string | null>(null)

  // Item Form states
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('🏕️ Kamp')
  const [url, setUrl] = useState('')
  const [icon, setIcon] = useState('fa-solid fa-file')

  // UI states
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)

  // Dynamic category list (Presets + active DB categories + user-created categories)
  const allCategoriesList = Array.from(
    new Set([
      ...PRESET_CATEGORIES,
      ...resources.map(r => r.category),
      ...userCreatedCategories,
    ])
  )

  function showConfirmDialog(title: string, message: string, btnText: string, action: () => Promise<void> | void) {
    setConfirmTitle(title)
    setConfirmMessage(message)
    setConfirmBtnText(btnText)
    setConfirmAction(() => action)
    setConfirmModalOpen(true)
  }

  function openNewItemModal(presetCategory?: string) {
    setEditingItem(null)
    setLabel('')
    setDescription('')
    setUrl('')
    setIcon('scouts-lelie')
    setError('')

    const target = presetCategory || '🏕️ Kamp'
    setCategory(allCategoriesList.includes(target) ? target : '🏕️ Kamp')
    setItemModalOpen(true)
  }

  function openEditItemModal(item: PortalResource) {
    setEditingItem(item)
    setLabel(item.label)
    setDescription(item.description)
    setUrl(item.url)
    setIcon(item.icon)
    setError('')
    setCategory(item.category || 'Algemeen')
    setItemModalOpen(true)
  }

  function openCategoryModal() {
    setNewCategoryInput('')
    setError('')
    setCategoryModalOpen(true)
  }

  function openEditCategoryModal(catName: string) {
    setEditingCategoryName(catName)
    setEditCategoryInput(catName)
    setError('')
    setEditCategoryModalOpen(true)
  }

  function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCategoryInput.trim()) return

    const newCat = newCategoryInput.trim()
    if (!userCreatedCategories.includes(newCat)) {
      setUserCreatedCategories(prev => [...prev, newCat])
    }
    setCategoryModalOpen(false)
    setNewCategoryInput('')
  }

  async function handleRenameCategorySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editCategoryInput.trim()) return

    const rawOld = editingCategoryName
    const trimmedNew = editCategoryInput.trim()

    if (trimmedNew === editingCategoryName) {
      setEditCategoryModalOpen(false)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/admin/portal-resources/rename-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldCategory: rawOld, newCategory: trimmedNew }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fout bij hernoemen van categorie')

      setResources(prev => prev.map(r => r.category === rawOld ? { ...r, category: trimmedNew } : r))
      setUserCreatedCategories(prev => prev.map(c => c === editingCategoryName ? trimmedNew : c))
      setEditCategoryModalOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij hernoemen van categorie')
    } finally {
      setSubmitting(false)
    }
  }

  function requestDeleteCategory() {
    if (!editingCategoryName) return
    const rawCategory = editingCategoryName
    const count = resources.filter(r => r.category === rawCategory).length

    const confirmMsg = count > 0
      ? `Weet je zeker dat je de categorie "${editingCategoryName}" én alle ${count} items daarin wilt verwijderen?`
      : `Weet je zeker dat je de categorie "${editingCategoryName}" wilt verwijderen?`

    showConfirmDialog(
      '⚠️ Categorie Verwijderen',
      confirmMsg,
      'Ja, Categorie Verwijderen',
      async () => {
        setIsDeletingCategory(true)
        setError('')
        try {
          const res = await fetch('/api/admin/portal-resources/delete-category', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: rawCategory }),
          })

          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Fout bij verwijderen van categorie')

          setResources(prev => prev.filter(r => r.category !== rawCategory))
          setUserCreatedCategories(prev => prev.filter(c => c !== editingCategoryName && c !== rawCategory))
          setEditCategoryModalOpen(false)
          router.refresh()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Verwijderen mislukt')
        } finally {
          setIsDeletingCategory(false)
        }
      }
    )
  }

  async function handleDropToCategory(resourceId: string, targetCat: string) {
    setDraggedId(null)
    const item = resources.find(r => r.id === resourceId)
    if (!item || item.category === targetCat) return

    // Optimistic update
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, category: targetCat } : r))

    try {
      const res = await fetch(`/api/admin/portal-resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: targetCat }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fout bij verplaatsen')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verplaatsen mislukt')
      // Revert state
      setResources(prev => prev.map(r => r.id === resourceId ? item : r))
    }
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

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return

    setSubmitting(true)
    setError('')

    const payload = {
      type: 'document',
      label: label.trim(),
      description: description.trim(),
      category: category || 'Algemeen',
      url: url.trim(),
      icon,
      sort_order: editingItem?.sort_order ?? 10,
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

      setItemModalOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout ingetreden')
    } finally {
      setSubmitting(false)
    }
  }

  function requestDeleteItem(item: PortalResource) {
    showConfirmDialog(
      '⚠️ Item Verwijderen',
      `Weet je zeker dat je "${item.label}" wilt verwijderen?`,
      'Ja, Verwijderen',
      async () => {
        setDeletingId(item.id)
        try {
          const res = await fetch(`/api/admin/portal-resources/${item.id}`, {
            method: 'DELETE',
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Fout bij verwijderen')

          setResources(prev => prev.filter(r => r.id !== item.id))
          router.refresh()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Verwijderen mislukt')
        } finally {
          setDeletingId(null)
        }
      }
    )
  }

  // Group items by category (including empty user-created categories)
  const categoryNames = Array.from(
    new Set([
      ...Object.keys(
        resources.reduce((acc, item) => {
          const cat = item.category || 'Algemeen'
          acc[cat] = true
          return acc
        }, {} as Record<string, boolean>)
      ),
      ...userCreatedCategories,
    ])
  )

  const categoriesMap = categoryNames.reduce((acc, cat) => {
    acc[cat] = resources.filter(r => (r.category || 'Algemeen') === cat)
    return acc
  }, {} as Record<string, PortalResource[]>)

  const showEditControls = isGroepsleiding && editMode

  return (
    <div style={{ padding: '36px 36px 32px', maxWidth: 1440, margin: '0 auto', width: '100%' }}>

      {/* Documenten & Sjablonen per Categorie */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {Object.entries(categoriesMap).map(([catName, items], index) => {
          if (items.length === 0 && !showEditControls) return null

          return (
            <section
              key={catName}
              style={{
                padding: dragOverCat === catName ? '12px' : '0px',
                borderRadius: 18,
                border: dragOverCat === catName ? '2px dashed #FFFFFF' : '2px solid transparent',
                background: dragOverCat === catName ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
              onDragOver={(e) => {
                if (!showEditControls) return
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (dragOverCat !== catName) setDragOverCat(catName)
              }}
              onDragLeave={(e) => {
                if (!showEditControls) return
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverCat(null)
                }
              }}
              onDrop={(e) => {
                if (!showEditControls) return
                e.preventDefault()
                setDragOverCat(null)
                setDraggedId(null)
                const resId = e.dataTransfer.getData('text/plain') || draggedId
                if (resId) handleDropToCategory(resId, catName)
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-heading, Nunito, sans-serif)', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
                  <span>{catName}</span>
                  {showEditControls && (
                    <button
                      onClick={() => openEditCategoryModal(catName)}
                      title="Categorie bewerken of verwijderen"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: '.75rem',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        marginLeft: 6,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <i className="fa-solid fa-gear"></i> Categorie bewerken
                    </button>
                  )}
                </h2>

                {index === 0 && isGroepsleiding && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 16px',
                        borderRadius: 12,
                        background: editMode ? '#F5B82E' : '#FFFFFF',
                        color: editMode ? '#3a2a00' : '#1A3D2A',
                        border: 'none',
                        fontWeight: 900,
                        fontSize: '.84rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <i className={editMode ? 'fa-solid fa-check' : 'fa-solid fa-pen-to-square'}></i>
                      <span>{editMode ? 'Klaar met bewerken' : 'Bewerken'}</span>
                    </button>

                    {editMode && (
                      <>
                        <button
                          onClick={openCategoryModal}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '7px 16px',
                            borderRadius: 12,
                            background: 'rgba(255, 255, 255, 0.95)',
                            color: '#1A3D2A',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '.84rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                            transition: 'all 0.15s ease',
                          }}
                          className="action-card-hover"
                        >
                          <i className="fa-solid fa-folder-plus"></i>
                          <span>Nieuwe Categorie</span>
                        </button>

                        <button
                          onClick={() => openNewItemModal()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '7px 16px',
                            borderRadius: 12,
                            background: '#C9963A',
                            color: '#FFFFFF',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '.84rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                            transition: 'all 0.15s ease',
                          }}
                          className="action-card-hover"
                        >
                          <i className="fa-solid fa-plus"></i>
                          <span>Nieuw Item</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {items.map(item => (
                  <ResourceCard
                    key={item.id}
                    item={item}
                    showEditControls={showEditControls}
                    onEdit={openEditItemModal}
                    onDelete={requestDeleteItem}
                    isDeleting={deletingId === item.id}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', item.id)
                      setDraggedId(item.id)
                    }}
                    onDragEnd={() => setDraggedId(null)}
                    isDragging={draggedId === item.id}
                  />
                ))}

                {/* Skeleton Add Card at the end of Category in Edit Mode */}
                {showEditControls && (
                  <div
                    onClick={() => openNewItemModal(catName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '16px 18px',
                      borderRadius: 16,
                      border: '2px dashed rgba(255, 255, 255, 0.45)',
                      background: 'rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    className="action-card-hover"
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: 'rgba(255, 255, 255, 0.25)',
                        border: '1.5px dashed #FFFFFF',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}
                    >
                      <i className="fa-solid fa-plus"></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: '.9rem', fontWeight: 800, color: '#1A3D2A', display: 'block' }}>
                        Item toevoegen
                      </strong>
                      <span style={{ fontSize: '.78rem', color: '#6A8A75' }}>
                        Toevoegen aan {catName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>

      {/* Dedicated Modal for Creating a New Category */}
      {categoryModalOpen && (
        <div className="portaal-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="portaal-modal-card" style={{ maxWidth: 440 }}>
            <div className="portaal-modal-header">
              <h3 className="portaal-modal-title">📁 Nieuwe Categorie Maken</h3>
              <button className="portaal-modal-close" onClick={() => setCategoryModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className="portaal-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label" htmlFor="new_cat_input">Categorienaam *</label>
                  <input
                    type="text"
                    id="new_cat_input"
                    className="form-control"
                    placeholder="bijv. ⛺ Vlottenbouw & Technieken"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    required
                    autoFocus
                  />
                  <span style={{ fontSize: '.75rem', color: '#6A8A75', marginTop: 6, display: 'block' }}>
                    Tip: Gebruik een emoji aan het begin voor een mooie uitstraling.
                  </span>
                </div>
              </div>

              <div className="portaal-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setCategoryModalOpen(false)}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={!newCategoryInput.trim()}
                >
                  Categorie Aanmaken
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Modal for Editing / Renaming / Deleting a Category */}
      {editCategoryModalOpen && (
        <div className="portaal-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="portaal-modal-card" style={{ maxWidth: 460 }}>
            <div className="portaal-modal-header">
              <h3 className="portaal-modal-title">⚙️ Categorie Bewerken</h3>
              <button className="portaal-modal-close" onClick={() => setEditCategoryModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleRenameCategorySubmit}>
              <div className="portaal-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {error && (
                  <div className="portaal-modal-alert error">
                    {error}
                  </div>
                )}

                <div>
                  <label className="form-label" htmlFor="edit_cat_input">Categorienaam *</label>
                  <input
                    type="text"
                    id="edit_cat_input"
                    className="form-control"
                    value={editCategoryInput}
                    onChange={(e) => setEditCategoryInput(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="portaal-modal-footer" style={{ justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={requestDeleteCategory}
                  disabled={isDeletingCategory || submitting}
                  style={{
                    background: '#FEE2E2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5',
                    borderRadius: 10,
                    padding: '8px 14px',
                    fontSize: '.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <i className="fa-solid fa-trash-can"></i>
                  <span>{isDeletingCategory ? 'Verwijderen…' : 'Verwijderen'}</span>
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditCategoryModalOpen(false)}
                    disabled={submitting}
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={submitting || !editCategoryInput.trim()}
                  >
                    {submitting ? 'Opslaan…' : 'Opslaan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding / Editing a Resource Item */}
      {itemModalOpen && (
        <div className="portaal-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="portaal-modal-card" style={{ maxWidth: 540 }}>
            <div className="portaal-modal-header">
              <h3 className="portaal-modal-title">
                {editingItem ? '✏️ Item Bewerken' : '➕ Nieuw Item Toevoegen'}
              </h3>
              <button className="portaal-modal-close" onClick={() => setItemModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleItemSubmit}>
              <div className="portaal-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {error && (
                  <div className="portaal-modal-alert error">
                    {error}
                  </div>
                )}

                {/* 1. Title / Label */}
                <div>
                  <label className="form-label" htmlFor="res_label">Titel / Naam *</label>
                  <input
                    type="text"
                    id="res_label"
                    className="form-control"
                    placeholder="bijv. Kampgids 2026 of Groepsadmin link"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    required
                  />
                </div>

                {/* 2. Description */}
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

                {/* 3. Category Selection */}
                <div>
                  <label className="form-label" htmlFor="res_cat">Categorie *</label>
                  <select
                    id="res_cat"
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {allCategoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 4. URL / Link / File Upload */}
                <div>
                  <label className="form-label" htmlFor="res_url">Link / URL (Google Drive, website of bestand)</label>
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

                {/* 5. Icon Selection */}
                <div>
                  <label className="form-label">Icoontje</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 120, overflowY: 'auto', padding: 6, border: '1px solid #C2D9C9', borderRadius: 10, background: '#FAFDFB' }}>
                    {ICON_OPTIONS.map(opt => (
                      <button
                        key={opt.icon}
                        type="button"
                        onClick={() => setIcon(opt.icon)}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          border: icon === opt.icon ? '2px solid #1A3D2A' : '1px solid #E0E0E0',
                          background: icon === opt.icon ? '#EEF5F1' : '#fff',
                          color: '#1A3D2A',
                          fontSize: '1.15rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={opt.label}
                      >
                        <RenderIcon icon={opt.icon} />
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="portaal-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setItemModalOpen(false)}
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

      {/* Custom In-Page Confirmation Modal (Rendered at top layer z-index: 1200) */}
      {confirmModalOpen && (
        <div className="portaal-modal-overlay" style={{ zIndex: 1200 }}>
          <div className="portaal-modal-card" style={{ maxWidth: 440 }}>
            <div className="portaal-modal-header">
              <h3 className="portaal-modal-title">{confirmTitle}</h3>
              <button className="portaal-modal-close" onClick={() => setConfirmModalOpen(false)}>&times;</button>
            </div>

            <div className="portaal-modal-body" style={{ padding: '16px 20px' }}>
              <p style={{ margin: 0, fontSize: '.95rem', color: '#1A3D2A', lineHeight: 1.5 }}>
                {confirmMessage}
              </p>
            </div>

            <div className="portaal-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setConfirmModalOpen(false)}
              >
                Annuleren
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ background: '#B91C1C', borderColor: '#B91C1C', color: '#fff' }}
                onClick={async () => {
                  if (confirmAction) {
                    await confirmAction()
                  }
                  setConfirmModalOpen(false)
                }}
              >
                {confirmBtnText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
