'use client'
import { useState, useRef, KeyboardEvent } from 'react'
import { PaklijstCategorie, PAKLIJST_TEMPLATES, parsePackingList } from '@/lib/kamp'

export default function PaklijstEditor({
  value,
  onChange,
  templateKey,
}: {
  value: PaklijstCategorie[]
  onChange: (v: PaklijstCategorie[]) => void
  templateKey: string
}) {
  const [newItems, setNewItems] = useState<Record<number, string>>({})
  const [newCat, setNewCat] = useState('')
  const [copied, setCopied] = useState(false)
  const newCatRef = useRef<HTMLInputElement>(null)

  function updateCatNaam(idx: number, naam: string) {
    onChange(value.map((c, i) => i === idx ? { ...c, categorie: naam } : c))
  }

  function addItem(catIdx: number) {
    const text = (newItems[catIdx] ?? '').trim()
    if (!text) return
    onChange(value.map((c, i) => i === catIdx ? { ...c, items: [...c.items, text] } : c))
    setNewItems(p => ({ ...p, [catIdx]: '' }))
  }

  function removeItem(catIdx: number, itemIdx: number) {
    onChange(value.map((c, i) => i === catIdx ? { ...c, items: c.items.filter((_, j) => j !== itemIdx) } : c))
  }

  function removeCategorie(catIdx: number) {
    onChange(value.filter((_, i) => i !== catIdx))
  }

  function addCategorie() {
    const naam = newCat.trim()
    if (!naam) return
    onChange([...value, { categorie: naam, items: [] }])
    setNewCat('')
    setTimeout(() => newCatRef.current?.focus(), 10)
  }

  function handleItemKey(catIdx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addItem(catIdx) }
  }

  function handleCatKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addCategorie() }
  }

  function loadTemplate() {
    onChange(parsePackingList(PAKLIJST_TEMPLATES[templateKey] || PAKLIJST_TEMPLATES['groep'] || ''))
  }

  function copyAsList() {
    if (value.length === 0) return
    const text = value.map(cat =>
      `${cat.categorie}\n${cat.items.map(i => `- ${i}`).join('\n')}`
    ).join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={loadTemplate}
          style={{ padding: '5px 12px', border: '1.5px solid #C9963A', color: '#C9963A', background: 'none', borderRadius: 7, fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>
          Sjabloon laden
        </button>
        {value.length > 0 && (
          <>
            <button type="button" onClick={copyAsList}
              style={{ padding: '5px 12px', border: `1.5px solid ${copied ? '#3F7D5A' : '#C2D9C9'}`, color: copied ? '#3F7D5A' : '#6A8A75', background: 'none', borderRadius: 7, fontSize: '.78rem', cursor: 'pointer', transition: 'color .15s, border-color .15s' }}>
              {copied ? '✓ Gekopieerd' : '📋 Kopieer als lijst'}
            </button>
            <button type="button" onClick={() => onChange([])}
              style={{ padding: '5px 12px', border: '1.5px solid #C2D9C9', color: '#6A8A75', background: 'none', borderRadius: 7, fontSize: '.78rem', cursor: 'pointer' }}>
              Leegmaken
            </button>
          </>
        )}
      </div>

      {/* Categories */}
      {value.map((cat, catIdx) => (
        <div key={catIdx} style={{ border: '1.5px solid #C2D9C9', borderRadius: 12, overflow: 'hidden' }}>
          {/* Category header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#EEF5F1', padding: '8px 12px', borderBottom: '1px solid #C2D9C9' }}>
            <input
              value={cat.categorie}
              onChange={e => updateCatNaam(catIdx, e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'inherit', fontWeight: 800, fontSize: '.88rem', color: '#1A3D2A', outline: 'none' }}
              placeholder="Categorienaam"
            />
            <button type="button" onClick={() => removeCategorie(catIdx)}
              style={{ background: 'none', border: 'none', color: '#B23A4D', cursor: 'pointer', fontSize: '.85rem', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}>
              ✕
            </button>
          </div>

          {/* Items */}
          <div style={{ padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {cat.items.map((item, itemIdx) => (
              <span key={itemIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 20, padding: '3px 10px', fontSize: '.82rem', color: '#1A3D2A' }}>
                {item}
                <button type="button" onClick={() => removeItem(catIdx, itemIdx)}
                  style={{ background: 'none', border: 'none', color: '#6A8A75', cursor: 'pointer', fontSize: '.75rem', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                  ×
                </button>
              </span>
            ))}

            {/* Inline add item */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: '1.5px dashed #C2D9C9', borderRadius: 20, padding: '3px 4px 3px 10px', background: '#FAFCFB' }}>
              <input
                value={newItems[catIdx] ?? ''}
                onChange={e => setNewItems(p => ({ ...p, [catIdx]: e.target.value }))}
                onKeyDown={e => handleItemKey(catIdx, e)}
                placeholder="+ item"
                style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '.82rem', color: '#1A3D2A', outline: 'none', width: Math.max(60, ((newItems[catIdx] ?? '').length + 3) * 8) }}
              />
              {(newItems[catIdx] ?? '').trim() && (
                <button type="button" onClick={() => addItem(catIdx)}
                  style={{ background: '#1A3D2A', border: 'none', color: '#fff', borderRadius: 20, fontSize: '.7rem', padding: '2px 8px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
                  +
                </button>
              )}
            </span>
          </div>
        </div>
      ))}

      {/* Add category */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          ref={newCatRef}
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          onKeyDown={handleCatKey}
          placeholder="Nieuwe categorie…"
          style={{ flex: 1, padding: '8px 12px', border: '1.5px dashed #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.85rem', background: '#FAFCFB', outline: 'none', color: '#1A3D2A' }}
        />
        <button type="button" onClick={addCategorie} disabled={!newCat.trim()}
          style={{ padding: '8px 16px', background: newCat.trim() ? '#1A3D2A' : '#C2D9C9', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: newCat.trim() ? 'pointer' : 'default', fontSize: '.85rem' }}>
          + Categorie
        </button>
      </div>

      {value.length === 0 && (
        <p style={{ color: '#6A8A75', fontSize: '.82rem', margin: 0, textAlign: 'center', padding: '12px 0' }}>
          Nog geen categorieën. Laad een sjabloon of voeg er zelf een toe.
        </p>
      )}
    </div>
  )
}
