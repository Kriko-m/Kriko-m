'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useScrollLock } from '@/lib/useScrollLock'

export type BlockType = 'text_only' | 'text_image' | 'tak_card' | 'waariswat' | 'webshop_card'

interface Props {
  blockKey: string
  page: string
  section: string
  blockType?: BlockType
  initialTitle?: string
  initialContent?: string
  initialImageUrl?: string
  onClose: () => void
  onSaved: () => void
}

export default function EditBlockModal({
  blockKey,
  page,
  section,
  blockType: explicitBlockType,
  initialTitle = '',
  initialContent = '',
  initialImageUrl = '',
  onClose,
  onSaved,
}: Props) {
  useScrollLock(true)
  // Determine blockType automatically if not specified
  let blockType: BlockType = explicitBlockType || 'text_only'
  if (!explicitBlockType) {
    if (blockKey.startsWith('info.takken.')) {
      blockType = 'tak_card'
    } else if (blockKey === 'info.waariswat') {
      blockType = 'waariswat'
    } else if (blockKey === 'info.uniform.webshop') {
      blockType = 'webshop_card'
    } else if (initialImageUrl || section === 'hero' || section === 'card' || section === 'welcome') {
      blockType = 'text_image'
    }
  }

  // Common states
  const [title, setTitle] = useState(initialTitle)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse structured JSON for complex blocks if applicable
  const parsedData = (() => {
    try {
      if (initialContent.trim().startsWith('{')) {
        return JSON.parse(initialContent)
      }
    } catch {}
    return null
  })()

  // Standard text state
  const [content, setContent] = useState(() => {
    if (parsedData) {
      let val = parsedData.uitleg ?? parsedData.intro ?? ''
      if (typeof val === 'string' && val.trim().startsWith('{')) {
        try {
          const nested = JSON.parse(val)
          val = nested.intro ?? ''
        } catch {}
      }
      return val
    }
    return initialContent
  })

  // Tak card fields
  const [takSfeer, setTakSfeer] = useState<string>(parsedData?.sfeer || '')
  const [takAge, setTakAge] = useState<string>(parsedData?.age || '')
  const [takKamp, setTakKamp] = useState<string>(parsedData?.kamp || '')

  // Webshop card fields
  const [contactInfo, setContactInfo] = useState<string>(parsedData?.contact || 'Vragen over bestellingen? Neem contact op met de webshopverantwoordelijke.')

  // Waar is wat links descriptions
  const [linkKalender, setLinkKalender] = useState<string>(parsedData?.links?.kalender || 'Bekijk wanneer de vergaderingen vallen en wanneer onze familie-evenementen plaatsvinden.')
  const [linkEcho, setLinkEcho] = useState<string>(parsedData?.links?.echo || 'Ons maandelijkse programmaboekje met het concrete programma en uren per tak.')
  const [linkTakken, setLinkTakken] = useState<string>(parsedData?.links?.takken || 'Ontdek alle leeftijdsgroepen en hoe lang je in dezelfde tak blijft.')
  const [linkInschrijven, setLinkInschrijven] = useState<string>(parsedData?.links?.inschrijven || 'Alle info over de inschrijvingsfiche, steekkaart en het jaarlijks lidgeld.')
  const [linkOpMaat, setLinkOpMaat] = useState<string>(parsedData?.links?.opmaat || 'Alles over verminderd lidgeld (€10), Fonds op Maat en kortingen via het ziekenfonds.')
  const [linkUniform, setLinkUniform] = useState<string>(parsedData?.links?.uniform || 'Info over onze das, kledij en bestellen via de shop.')
  const [linkOudertak, setLinkOudertak] = useState<string>(parsedData?.links?.oudertak || 'De kritische vriend van onze groep: hoe ouders en oud-leiding Kriko-M ondersteunen.')

  async function handleFileUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'home-leiding-foto')
      if (imageUrl) formData.append('oldUrl', imageUrl)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Upload mislukt')
      }

      const data = await res.json()
      setImageUrl(data.url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij uploaden afbeelding')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    // Build payload according to blockType
    let finalContent = content

    if (blockType === 'tak_card') {
      finalContent = JSON.stringify({
        sfeer: takSfeer,
        age: takAge,
        uitleg: content,
        kamp: takKamp,
      })
    } else if (blockType === 'waariswat') {
      finalContent = JSON.stringify({
        intro: content,
        links: {
          kalender: linkKalender,
          echo: linkEcho,
          takken: linkTakken,
          inschrijven: linkInschrijven,
          opmaat: linkOpMaat,
          uniform: linkUniform,
          oudertak: linkOudertak,
        }
      })
    } else if (blockType === 'webshop_card') {
      finalContent = JSON.stringify({
        uitleg: content,
        contact: contactInfo,
      })
    }

    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: blockKey,
          page,
          section,
          title,
          content: finalContent,
          image_url: imageUrl,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Opslaan mislukt')
      }

      onSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij opslaan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backdropFilter: 'blur(4px)',
      fontFamily: 'var(--font-body, Outfit, sans-serif)',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        maxWidth: 620,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 24,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0, color: '#162544', fontWeight: 900, fontSize: '1.25rem', fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>
              ✏️ {blockType === 'tak_card' ? 'Tak Inhoud Bewerken' : blockType === 'waariswat' ? 'Waar Vind Je Wat Bewerken' : 'Inhoud Bewerken'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
              Sleutel: {blockKey}
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: '#FDF0F2', color: '#B23A4D', border: '1px solid #E0C0C4', borderRadius: 8, marginBottom: 16, fontSize: '0.88rem', fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Titel */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#162544', textTransform: 'uppercase', marginBottom: 4 }}>
              Titel / Opschrift
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="bv. Welkom bij Kriko-M!"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: '0.95rem', color: '#162544' }}
            />
          </div>

          {/* TAK CARD SPECIFIC FIELDS */}
          {blockType === 'tak_card' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#162544', textTransform: 'uppercase', marginBottom: 4 }}>
                  🎨 Sfeer / Subtitel
                </label>
                <input
                  type="text"
                  value={takSfeer}
                  onChange={e => setTakSfeer(e.target.value)}
                  placeholder="bv. Spel, fantasie & de allereerste scoutservaring."
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: '0.92rem', color: '#162544' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#162544', textTransform: 'uppercase', marginBottom: 4 }}>
                  🏷️ Leeftijdsgroep
                </label>
                <input
                  type="text"
                  value={takAge}
                  onChange={e => setTakAge(e.target.value)}
                  placeholder="bv. 6 tot 8 jaar (1e & 2e leerjaar)"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: '0.92rem', color: '#162544' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#162544', textTransform: 'uppercase', marginBottom: 4 }}>
                  📝 Uitleg / Beschrijving
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={4}
                  placeholder="Beschrijf de werking van deze tak..."
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: '0.92rem', fontFamily: 'inherit', resize: 'vertical', color: '#162544' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#162544', textTransform: 'uppercase', marginBottom: 4 }}>
                  🏕️ Zomerkamp Info
                </label>
                <input
                  type="text"
                  value={takKamp}
                  onChange={e => setTakKamp(e.target.value)}
                  placeholder="bv. 5 dagen kamp (in een gebouw)"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: '0.92rem', color: '#162544' }}
                />
              </div>
            </>
          )}

          {/* WAAR IS WAT SPECIFIC FIELDS */}
          {blockType === 'waariswat' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#162544', textTransform: 'uppercase', marginBottom: 4 }}>
                  Introductietekst
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={2}
                  placeholder="Omdat we alle praktische zaken al overzichtelijk..."
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: '0.92rem', fontFamily: 'inherit', color: '#162544' }}
                />
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h4 style={{ margin: 0, color: '#162544', fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>
                  🔗 Omschrijving per Navigatielink:
                </h4>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>📅 1. Kalender Link</label>
                  <input type="text" value={linkKalender} onChange={e => setLinkKalender(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.86rem', color: '#162544' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>📖 2. Kriko Echo Link</label>
                  <input type="text" value={linkEcho} onChange={e => setLinkEcho(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.86rem', color: '#162544' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>⚜️ 3. Onze Takken Link</label>
                  <input type="text" value={linkTakken} onChange={e => setLinkTakken(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.86rem', color: '#162544' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>📝 4. Inschrijven &amp; Lidgeld Link</label>
                  <input type="text" value={linkInschrijven} onChange={e => setLinkInschrijven(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.86rem', color: '#162544' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>💚 5. Scouting op Maat Link</label>
                  <input type="text" value={linkOpMaat} onChange={e => setLinkOpMaat(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.86rem', color: '#162544' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>👔 6. Uniform &amp; Webshop Link</label>
                  <input type="text" value={linkUniform} onChange={e => setLinkUniform(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.86rem', color: '#162544' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>👨‍👩‍👧‍👦 7. Oudertak Link</label>
                  <input type="text" value={linkOudertak} onChange={e => setLinkOudertak(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.86rem', color: '#162544' }} />
                </div>
              </div>
            </>
          )}

          {/* WEBSHOP CARD SPECIFIC FIELDS */}
          {blockType === 'webshop_card' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#162544', textTransform: 'uppercase', marginBottom: 4 }}>
                  📝 Beschrijving
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={3}
                  placeholder="Bestel de officiële groepsdas..."
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: '0.92rem', fontFamily: 'inherit', color: '#162544' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#162544', textTransform: 'uppercase', marginBottom: 4 }}>
                  📞 Contactgegevens
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  placeholder="bijv: Vragen over bestellingen? Neem contact op via webshop@kriko-m.be"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: '0.92rem', color: '#162544' }}
                />
              </div>
            </>
          )}

          {/* STANDARD TEXT FIELDS (For text_only & text_image) */}
          {(blockType === 'text_only' || blockType === 'text_image') && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#162544', textTransform: 'uppercase', marginBottom: 4 }}>
                Tekst / Inhoud
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
                placeholder="Voer de tekst in..."
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: '0.92rem', fontFamily: 'inherit', resize: 'vertical', color: '#162544' }}
              />
            </div>
          )}

          {/* AFBEELDING FIELDS (ONLY FOR text_image or tak_card) */}
          {(blockType === 'text_image' || blockType === 'tak_card') && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#162544', textTransform: 'uppercase', marginBottom: 4 }}>
                📷 Foto / Afbeelding
              </label>

              {imageUrl && (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', backgroundColor: '#F8FAFC', marginBottom: 10, border: '1px solid #CBD5E1' }}>
                  <Image
                    src={imageUrl}
                    alt="Voorbeeld"
                    fill
                    unoptimized
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://... of upload een bestand"
                  style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: '0.85rem', color: '#162544' }}
                />

                <label style={{
                  padding: '8px 14px',
                  backgroundColor: '#EBF0F9',
                  border: '1.5px dashed #243B6B',
                  borderRadius: 8,
                  color: '#243B6B',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: uploading ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                  {uploading ? 'Uploaden...' : '📷 Upload'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    disabled={uploading}
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) handleFileUpload(f)
                    }}
                  />
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
          <button
            onClick={onClose}
            type="button"
            style={{ padding: '10px 18px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', color: '#475569' }}
          >
            Annuleren
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            type="button"
            style={{ padding: '10px 24px', backgroundColor: '#162544', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 900, cursor: saving ? 'wait' : 'pointer' }}
          >
            {saving ? 'Opslaan...' : '💾 Opslaan'}
          </button>
        </div>
      </div>
    </div>
  )
}
