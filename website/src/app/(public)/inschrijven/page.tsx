import type { Metadata } from 'next'
import { getSettings } from '@/lib/db'
import CopyButton from '@/components/CopyButton'

export const metadata: Metadata = { title: 'Inschrijven | Scouts Kriko-M' }

export default async function InschrijvenPage() {
  const settings = await getSettings()
  const fee1 = settings?.reg_fee_first ?? 50
  const fee2 = settings?.reg_fee_extra ?? 45
  const year = settings?.scouts_year ?? '2026-2027'
  const email = settings?.contact_email ?? 'groepsleiding@kriko-m.be'

  return (
    <>
      <section className="tak-hero primair hero-inschrijven">
        <div className="container">
          <span className="hero-eyebrow">Word lid</span>
          <h1 className="tak-hero-title">Inschrijven &amp; Lidgeld</h1>
          <p style={{ color: 'rgba(255,255,255,.85)', marginTop: 8, fontSize: '1.1rem' }}>
            Sluit je aan bij de tofste scoutsgroep van Sint-Niklaas voor het scoutsjaar {year}!
          </p>
        </div>
      </section>

      <section className="section container">
        <div className="register-layout">

          {/* Stappen */}
          <div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: 24, color: 'var(--color-primary-dark)' }}>Hoe word je lid van Kriko-M?</h3>

            {[
              {
                n: 1, title: 'Kom gratis proberen!',
                body: <>Nieuwe leden mogen eerst <strong>3 keer gratis proberen</strong>! Kom gewoon op zondagochtend om <strong>9:45 stipt</strong> langs bij ons lokaal op het VP-plein (Industriepark-Noord 33). Onze leiding heet je kind van harte welkom!</>,
              },
              {
                n: 2, title: 'Inschrijven via de groepsadministratie',
                body: <>
                  Officieel lid worden doe je via de <strong>groepsadministratie van Scouts &amp; Gidsen Vlaanderen</strong>. Dit regelt meteen de verplichte scoutsverzekering.
                  <a href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/formulier.html#/lidworden?groep=O3108G"
                     target="_blank" rel="noopener"
                     className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '8px 18px', margin: '14px 0', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> Inschrijvingsformulier invullen
                  </a>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    <strong>Al lid?</strong> Log in via{' '}
                    <a href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/" target="_blank" rel="noopener" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                      groepsadmin.scoutsengidsenvlaanderen.be
                    </a>
                  </p>
                </>,
              },
              {
                n: 3, title: 'Betaling lidgeld',
                body: <>
                  Na het invullen schrijf je het lidgeld over. Het bedrag dekt €38 scoutsverzekering en €12 voor onze lokale werking.
                  <div style={{ backgroundColor: 'var(--color-bg-linen)', borderRadius: 'var(--border-radius-md)', padding: '12px 16px', border: '1px solid var(--color-border)', fontSize: '0.9rem', marginTop: 10 }}>
                    <strong>Rekeningnummer:</strong> <code>BE59 7360 6413 2626</code><br />
                    <strong>Begunstigde:</strong> Scouts Kriko-M<br />
                    <strong>Mededeling:</strong> "Lidgeld [Naam kind] + [Tak]"
                  </div>
                </>,
              },
            ].map(({ n, title, body }) => (
              <div key={n} className="step-card">
                <div className="step-number">{n}</div>
                <div className="step-body">
                  <h4>{title}</h4>
                  <div style={{ color: 'var(--color-text-dark)', fontSize: '0.95rem' }}>{body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Zijbalk */}
          <div>
            <div className="side-card" style={{ backgroundColor: 'var(--color-primary-dark)', color: 'var(--color-bg-white)', border: 'none' }}>
              <h3 style={{ color: 'var(--color-accent-light)', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: 12 }}>Jaarlijks Lidgeld</h3>
              <p style={{ fontSize: '0.95rem', color: 'hsla(0,0%,100%,0.85)', marginBottom: 20 }}>
                Tarieven voor het scoutsjaar <strong>{year}</strong>:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  { label: '1e Kind', sub: 'Eerste gezinslid', price: fee1 },
                  { label: 'Extra Kind', sub: 'Zelfde gezin', price: fee2 },
                ].map(({ label, sub, price }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 'var(--border-radius-md)', padding: 14, border: '1px solid rgba(255,255,255,0.15)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{label}:</strong>
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{sub}</span>
                    </div>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--color-accent-light)' }}>€{price}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                Prijzen zijn inclusief de verplichte scoutsverzekering van Scouts &amp; Gidsen Vlaanderen (€38).
              </p>
            </div>

            <div className="side-card" style={{ marginTop: 24 }}>
              <h3>Vragen?</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: 8, marginBottom: 16 }}>
                Aarzel niet om ons te contacteren!
              </p>
              <CopyButton text={email} className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <i className="fas fa-copy"></i> {email}
              </CopyButton>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
