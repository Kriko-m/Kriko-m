import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { TAK_KLEUREN, AUDIENCE_NAMEN } from '@/lib/constants'
import { BESTAND_LABELS, bestandHref, kampPrimaryTak, kampIsHeleGroep, KAMP_AGE_TAKKEN } from '@/lib/kamp'
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
  const primaryTak = kampPrimaryTak(kamp.audience)
  const takKleur = TAK_KLEUREN[primaryTak] ?? '#1A3D2A'
  // Label voor de tak-badge: "Hele groep" als alle 4 takken, anders de tags.
  const takLabel = kampIsHeleGroep(kamp.audience)
    ? 'Hele groep'
    : (kamp.audience ?? []).map(a => AUDIENCE_NAMEN[a] ?? a).join(' · ') || 'Kamp'
  // Portaal-deeplink: eerste leeftijdstak, anders de groepsleiding-tab.
  const deeplinkTak = (KAMP_AGE_TAKKEN as readonly string[]).includes(primaryTak) ? primaryTak : 'groepsleiding'
  const fotoUrl = kamp.foto ? `${FOTO_BASE}/${kamp.foto}` : null
  const prijs = kamp.prijs != null && kamp.prijs > 0
    ? `€${Number(kamp.prijs).toFixed(2).replace('.', ',')}`
    : null

  const hasInfo = !!(kamp.briefadres || kamp.contact_info)

  return (
    <div
      className="kamp-page-root"
      style={{
        '--bg-photo': fotoUrl ? `url(${fotoUrl})` : 'none',
        '--tak-kleur': takKleur,
      } as React.CSSProperties}
    >
      <div className="kamp-bg-overlay" />

      {leiding && (
        <div className="kamp-leiding-banner">
          <span>👋 Je bekijkt de publieke versie als leiding.</span>
          <Link
            href={`/portaal/leiding?tak=${deeplinkTak}&kamp=${kamp.id}`}
            className="kamp-leiding-btn"
          >✏️ Naar portaal →</Link>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="kamp-hero-area">
        <div className="container">
          <span className="kamp-tak-badge">
            <span className="kamp-tak-dot" style={{ background: takKleur }} />
            {takLabel}
          </span>
          <h1 className="tak-hero-title kamp-hero-naam">{kamp.naam}</h1>
          <div className="kamp-hero-chips">
            <span className="kamp-hero-chip kamp-hero-chip--primary" style={{ borderColor: takKleur }}>
              <i className="fa-solid fa-calendar-day" style={{ color: takKleur }} />
              <span>{periodeStr}<span className="kamp-hero-chip-sub"> · {aantalNachten} {aantalNachten === 1 ? 'nacht' : 'nachten'}</span></span>
            </span>
            {kamp.locatie && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(kamp.locatie)}`}
                target="_blank" rel="noopener noreferrer"
                className="kamp-hero-chip kamp-hero-chip-link"
              >
                <i className="fa-solid fa-location-dot" /> {kamp.locatie}
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '.7em', opacity: .7 }} />
              </a>
            )}
            {prijs && (
              <span className="kamp-hero-chip">
                <i className="fa-solid fa-tag" /> {prijs}
              </span>
            )}
          </div>
          {kamp.beschrijving && (
            <p className="kamp-hero-beschrijving">{kamp.beschrijving}</p>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="kamp-glass-body">
        <div className="container">
          <div className="kamp-layout">

            {/* Left: RSVP — primary action */}
            <div className="kamp-rsvp-col">
              <div className="kamp-glass-card kamp-rsvp-card" style={{ borderTop: `4px solid ${takKleur}` }}>
                <RsvpForm slug={slug} kampTak={primaryTak} />
              </div>
            </div>

            {/* Right: Info accordion */}
            {(hasInfo || bestanden.length > 0 || paklijst.length > 0) && (
              <div className="kamp-info-col">

                {hasInfo && (
                  <details className="kamp-accordion" open>
                    <summary className="kamp-accordion-header"><i className="fa-solid fa-circle-info kamp-accordion-icon" />Praktische info</summary>
                    <div className="kamp-accordion-body kamp-praktisch-grid">
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
                  </details>
                )}

                {bestanden.length > 0 && (
                  <details className="kamp-accordion" open>
                    <summary className="kamp-accordion-header"><i className="fa-solid fa-paperclip kamp-accordion-icon" />Documenten &amp; links</summary>
                    <div className="kamp-accordion-body">
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
                  </details>
                )}

                {paklijst.length > 0 && (
                  <details className="kamp-accordion">
                    <summary className="kamp-accordion-header"><i className="fa-solid fa-suitcase-rolling kamp-accordion-icon" />Inpaklijst</summary>
                    <div className="kamp-accordion-body">
                      <p className="kamp-paklijst-hint">Vink af terwijl je inpakt — wordt bijgehouden in je browser.</p>
                      <PaklijstViewer paklijst={paklijst} />
                    </div>
                  </details>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
