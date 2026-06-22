import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { TAK_NAMEN, TAK_KLEUREN } from '@/lib/constants'
import { BESTAND_LABELS, bestandHref, googleSlidesEmbed } from '@/lib/kamp'
import { Kamp } from '@/lib/types'
import RsvpForm from './RsvpForm'
import PaklijstViewer from './PaklijstViewer'

export const metadata: Metadata = {
  title: 'Inschrijven – Scouts Kriko-M',
  robots: { index: false, follow: false, nocache: true },
}

const FOTO_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kamp-fotos`

const BIJLAGE_ICONEN: Record<string, string> = {
  uitnodiging: '📬',
  presentatie: '📊',
  paklijst_pdf: '🎒',
  infobrief: '📋',
  overige: '📎',
}

export default async function KampRsvpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data } = await admin
    .from('kampen')
    .select('*, kamp_bestanden(*)')
    .eq('slug', slug)
    .single()

  if (!data) notFound()
  const kamp = data as Kamp

  const leiding = await requireLeiding()

  // Date formatting
  const van = new Date(kamp.datum_van)
  const tot = new Date(kamp.datum_tot)
  const maandVan = van.toLocaleString('nl-BE', { month: 'long' })
  const maandTot = tot.toLocaleString('nl-BE', { month: 'long' })
  const jaar = tot.getFullYear()
  const periodeStr = maandVan === maandTot
    ? `${van.getDate()} – ${tot.getDate()} ${maandTot} ${jaar}`
    : `${van.getDate()} ${maandVan} – ${tot.getDate()} ${maandTot} ${jaar}`
  const aantalNachten = Math.round((tot.getTime() - van.getTime()) / (1000 * 60 * 60 * 24))

  const bestanden = kamp.kamp_bestanden ?? []
  const paklijst: { categorie: string; items: string[] }[] = Array.isArray(kamp.paklijst) ? kamp.paklijst : []
  const takKleur = TAK_KLEUREN[kamp.tak] ?? '#1A3D2A'
  const fotoUrl = kamp.foto ? `${FOTO_BASE}/${kamp.foto}` : null

  // Split slides (embed + card) from other files (card only)
  const slidesEmbeds = bestanden.filter(b => b.type === 'presentatie' && b.url && googleSlidesEmbed(b.url))
  const overigeBestanden = bestanden.filter(b => !(b.type === 'presentatie' && b.url && googleSlidesEmbed(b.url)))

  // For kapoenen (yellow bg) use dark badge text
  const badgeTextKleur = kamp.tak === 'kapoenen' ? '#3a2800' : '#fff'

  return (
    <div>
      {/* Leiding-only banner */}
      {leiding && (
        <div className="kamp-leiding-banner">
          <span>👋 Je bekijkt de publieke versie als leiding.</span>
          <Link href="/portaal/leiding" className="kamp-leiding-btn">✏️ Naar portaal →</Link>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="kamp-hero" style={{ '--tak-kleur': takKleur } as React.CSSProperties}>
        {fotoUrl && (
          <Image
            src={fotoUrl}
            alt={kamp.naam}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        )}
        <div className="kamp-hero-overlay" />
        <div className="kamp-hero-content">
          <span className="kamp-tak-badge" style={{ background: takKleur, color: badgeTextKleur }}>
            {TAK_NAMEN[kamp.tak] ?? kamp.tak}
          </span>
          <h1 className="kamp-hero-titel">{kamp.naam}</h1>
          <div className="kamp-hero-meta">
            <span className="kamp-meta-pill">
              📅 {periodeStr} &middot; {aantalNachten} {aantalNachten === 1 ? 'nacht' : 'nachten'}
            </span>
            {kamp.locatie && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(kamp.locatie)}`}
                target="_blank" rel="noopener noreferrer"
                className="kamp-meta-pill kamp-meta-link"
              >
                📍 {kamp.locatie} ↗
              </a>
            )}
            {kamp.prijs != null && kamp.prijs > 0 && (
              <span className="kamp-meta-pill">
                🏷 &euro;{Number(kamp.prijs).toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="kamp-body">

        {/* Main column */}
        <div className="kamp-main">

          {kamp.beschrijving && (
            <div className="kamp-card">
              <h2 className="kamp-section-title">Over dit kamp</h2>
              <p className="kamp-beschrijving">{kamp.beschrijving}</p>
            </div>
          )}

          {bestanden.length > 0 && (
            <div className="kamp-card">
              <h2 className="kamp-section-title">Documenten &amp; links</h2>

              {/* Download cards */}
              <div className="kamp-bijlagen-grid">
                {overigeBestanden.map(b => (
                  <a key={b.id} href={bestandHref(b)} target="_blank" rel="noopener" className="kamp-bijlage-card">
                    <span className="kamp-bijlage-icon">{BIJLAGE_ICONEN[b.type] ?? '📎'}</span>
                    <span className="kamp-bijlage-info">
                      <strong>{b.naam}</strong>
                      <span className="kamp-bijlage-type">
                        {BESTAND_LABELS[b.type]?.replace(/^[^\s]+ /, '') ?? 'Bijlage'} {b.url ? '↗' : '↓'}
                      </span>
                    </span>
                  </a>
                ))}
                {slidesEmbeds.map(b => (
                  <a key={b.id} href={bestandHref(b)} target="_blank" rel="noopener" className="kamp-bijlage-card">
                    <span className="kamp-bijlage-icon">📊</span>
                    <span className="kamp-bijlage-info">
                      <strong>{b.naam}</strong>
                      <span className="kamp-bijlage-type">Presentatie ↗</span>
                    </span>
                  </a>
                ))}
              </div>

              {/* Inline Google Slides embeds */}
              {slidesEmbeds.map(b => (
                <div key={`embed-${b.id}`} className="kamp-slides-wrap">
                  <strong className="kamp-slides-titel">📊 {b.naam}</strong>
                  <div className="kamp-slides-frame">
                    <iframe
                      src={googleSlidesEmbed(b.url!)!}
                      title={b.naam}
                      allowFullScreen
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {(kamp.briefadres || kamp.contact_info) && (
            <div className="kamp-card">
              <h2 className="kamp-section-title">Praktische info</h2>
              <div className="kamp-praktisch-grid">
                {kamp.briefadres && (
                  <div>
                    <div className="kamp-praktisch-label">✉ Briefadres op kamp</div>
                    <pre className="kamp-briefadres">{kamp.briefadres}</pre>
                  </div>
                )}
                {kamp.contact_info && (
                  <div>
                    <div className="kamp-praktisch-label">📞 Contact leiding</div>
                    <p className="kamp-contact">{kamp.contact_info}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {paklijst.length > 0 && (
            <div className="kamp-card">
              <h2 className="kamp-section-title">Inpaklijst</h2>
              <p className="kamp-paklijst-hint">Vink af terwijl je inpakt — wordt bijgehouden in je browser.</p>
              <PaklijstViewer paklijst={paklijst} />
            </div>
          )}
        </div>

        {/* Sidebar — RSVP form */}
        <div className="kamp-sidebar">
          <div className="kamp-sidebar-sticky">
            <RsvpForm slug={slug} kampTak={kamp.tak} />
          </div>
        </div>
      </div>
    </div>
  )
}
