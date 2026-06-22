import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { TAK_NAMEN } from '@/lib/constants'
import { BESTAND_LABELS, bestandHref, googleSlidesEmbed } from '@/lib/kamp'
import { Kamp } from '@/lib/types'
import RsvpForm from './RsvpForm'

// Privélink: niet indexeren, niet volgen.
export const metadata: Metadata = {
  title: 'Inschrijven – Scouts Kriko-M',
  robots: { index: false, follow: false, nocache: true },
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

  // Leiding (ingelogd) krijgt een beheerbalk; ouders zien deze niet.
  const leiding = await requireLeiding()

  const van = new Date(kamp.datum_van)
  const tot = new Date(kamp.datum_tot)
  const periode = `${van.getDate()}/${van.getMonth() + 1} – ${tot.getDate()}/${tot.getMonth() + 1}/${tot.getFullYear()}`
  const bestanden = kamp.kamp_bestanden ?? []
  const paklijst: { categorie: string; items: string[] }[] = Array.isArray(kamp.paklijst) ? kamp.paklijst : []

  return (
    <section className="section container" style={{ maxWidth: 760 }}>
      {leiding && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, background: '#EEF5F1', border: '1.5px solid #C2D9C9', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
          <span style={{ fontSize: '.85rem', fontWeight: 700, color: '#1A3D2A' }}>👋 Je bekijkt de publieke versie als leiding.</span>
          <Link href={`/portaal/leiding/kampen/${kamp.id}`} style={{ marginLeft: 'auto', padding: '7px 14px', background: '#1A3D2A', color: '#fff', borderRadius: 8, fontSize: '.8rem', fontWeight: 700, textDecoration: 'none' }}>
            ✏️ Bewerk in portaal →
          </Link>
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <span className="hero-eyebrow" style={{ color: 'var(--color-secondary)' }}>{TAK_NAMEN[kamp.tak] ?? kamp.tak}</span>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', margin: '6px 0 8px' }}>{kamp.naam}</h1>
        <div style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
          📅 {periode}
          {kamp.locatie && (
            <>
              {' '}·{' '}📍{' '}
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(kamp.locatie)}`}
                target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                {kamp.locatie}
              </a>
            </>
          )}
        </div>
        {kamp.prijs != null && kamp.prijs > 0 && (
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary-dark)', marginTop: 8 }}>
            Prijs: €{Number(kamp.prijs).toFixed(2).replace('.', ',')}
          </div>
        )}
      </div>

      {kamp.beschrijving && (
        <p style={{ lineHeight: 1.6, color: 'var(--color-text)', marginBottom: 24 }}>{kamp.beschrijving}</p>
      )}

      {/* Bijlagen (uitnodiging, presentatie, infobrief, paklijst-PDF, ...) */}
      {bestanden.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {bestanden.map(b => (
            <a key={b.id} href={bestandHref(b)} target="_blank" rel="noopener"
              className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.85rem', fontWeight: 600 }}>
              {BESTAND_LABELS[b.type] ?? '📎 Bijlage'} — {b.naam}
              {b.url ? ' ↗' : ''}
            </a>
          ))}
        </div>
      )}

      {/* Google Slides-presentaties inline tonen (bv. infoavond gemist) */}
      {bestanden
        .filter(b => b.type === 'presentatie' && b.url && googleSlidesEmbed(b.url))
        .map(b => (
          <div key={`embed-${b.id}`} style={{ marginBottom: 24 }}>
            <strong style={{ display: 'block', color: 'var(--color-primary-dark)', marginBottom: 8 }}>📊 {b.naam}</strong>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '60%', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <iframe src={googleSlidesEmbed(b.url!)!} title={b.naam} allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />
            </div>
          </div>
        ))}

      {/* Praktische info */}
      {(kamp.briefadres || kamp.contact_info) && (
        <div style={{ background: 'var(--color-bg-linen)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: '16px 18px', marginBottom: 24, fontSize: '.9rem' }}>
          <strong style={{ display: 'block', color: 'var(--color-primary-dark)', marginBottom: 8 }}>📮 Praktische info</strong>
          {kamp.briefadres && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>Briefadres op kamp:</span>
              <p style={{ margin: '2px 0 0', fontFamily: 'monospace', fontSize: '.82rem' }}>{kamp.briefadres}</p>
            </div>
          )}
          {kamp.contact_info && (
            <div>
              <span style={{ fontWeight: 700 }}>Contact leiding:</span>
              <p style={{ margin: '2px 0 0' }}>{kamp.contact_info}</p>
            </div>
          )}
        </div>
      )}

      {/* Paklijst (read-only weergave) */}
      {paklijst.length > 0 && (
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: '16px 18px', marginBottom: 28 }}>
          <strong style={{ display: 'block', color: 'var(--color-primary-dark)', marginBottom: 10 }}>🎒 Paklijst</strong>
          <div style={{ display: 'grid', gap: 14 }}>
            {paklijst.map((cat, ci) => (
              <div key={ci}>
                <strong style={{ fontSize: '.78rem', color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{cat.categorie}</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: 20, fontSize: '.88rem', color: 'var(--color-text)' }}>
                  {cat.items.map((it, ii) => <li key={ii}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <RsvpForm slug={slug} kampTak={kamp.tak} />
    </section>
  )
}
