import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { TAK_NAMEN, TAK_KLEUREN } from '@/lib/constants'
import { BESTAND_LABELS, bestandHref } from '@/lib/kamp'
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
  const prijs = kamp.prijs != null && kamp.prijs > 0
    ? `€${Number(kamp.prijs).toFixed(2).replace('.', ',')}`
    : null


  return (
    <div
      className="kamp-page-root"
      style={{
        '--bg-photo': fotoUrl ? `url(${fotoUrl})` : 'none',
        '--tak-kleur': takKleur,
      } as React.CSSProperties}
    >
      {/* Full-page bordeaux overlay */}
      <div className="kamp-bg-overlay" />

      {/* Leiding notice */}
      {leiding && (
        <div className="kamp-leiding-banner">
          <span>👋 Je bekijkt de publieke versie als leiding.</span>
          <Link href="/portaal/leiding" className="kamp-leiding-btn">✏️ Naar portaal →</Link>
        </div>
      )}

      {/* ── Hero text — kamp naam on the background ── */}
      <div className="kamp-hero-area">
        <div className="container">
          <span className="hero-eyebrow" style={{ color: takKleur }}>
            {TAK_NAMEN[kamp.tak] ?? kamp.tak}
          </span>
          <h1 className="tak-hero-title kamp-hero-naam">{kamp.naam}</h1>
          <div className="kamp-hero-chips">
            <span className="kamp-hero-chip">
              📅 {periodeStr} &middot; {aantalNachten} {aantalNachten === 1 ? 'nacht' : 'nachten'}
            </span>
            {kamp.locatie && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(kamp.locatie)}`}
                target="_blank" rel="noopener noreferrer"
                className="kamp-hero-chip kamp-hero-chip-link"
              >
                📍 {kamp.locatie} ↗
              </a>
            )}
            {prijs && <span className="kamp-hero-chip">🏷 {prijs}</span>}
          </div>
        </div>
      </div>

      {/* ── Glass card body ── */}
      <div className="kamp-glass-body">
        <div className="container">
          <div className="tak-layout">

            {/* Left: info glass cards */}
            <div className="kamp-info-col">

              {kamp.beschrijving && (
                <div className="kamp-glass-card kamp-info-card">
                  <h2>Over dit kamp</h2>
                  <p className="kamp-beschrijving">{kamp.beschrijving}</p>
                </div>
              )}

              {(kamp.briefadres || kamp.contact_info) && (
                <div className="kamp-glass-card kamp-info-card">
                  <h2>Praktische info</h2>
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

              {bestanden.length > 0 && (
                <div className="kamp-glass-card kamp-info-card">
                  <h2>Documenten &amp; links</h2>
                  <div className="kamp-bijlagen-grid">
                    {bestanden.map(b => (
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
                  </div>
                </div>
              )}

              {paklijst.length > 0 && (
                <div className="kamp-glass-card kamp-info-card">
                  <h2>Inpaklijst</h2>
                  <p className="kamp-paklijst-hint">Vink af terwijl je inpakt — wordt bijgehouden in je browser.</p>
                  <PaklijstViewer paklijst={paklijst} />
                </div>
              )}

            </div>

            {/* Right: RSVP glass card */}
            <div className="kamp-rsvp-col">
              <div className="kamp-glass-card kamp-rsvp-card">
                <RsvpForm slug={slug} kampTak={kamp.tak} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
