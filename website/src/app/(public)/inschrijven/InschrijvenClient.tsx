'use client'

import { useState } from 'react'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'

interface Props {
  email: string
  year: string
}

export default function InschrijvenClient({ email, year }: Props) {
  const [activeTab, setActiveTab] = useState<'nieuw' | 'bestaand'>('nieuw')

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      
      {/* Situatie Keuze Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          backgroundColor: 'var(--color-bg-linen)',
          padding: 8,
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--color-border)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('nieuw')}
          style={{
            padding: '14px 20px',
            borderRadius: 'var(--border-radius-sm)',
            border: activeTab === 'nieuw' ? '2px solid var(--color-primary)' : '1px solid transparent',
            backgroundColor: activeTab === 'nieuw' ? '#fff' : 'transparent',
            color: activeTab === 'nieuw' ? 'var(--color-primary-dark)' : 'var(--color-text-dark)',
            fontWeight: activeTab === 'nieuw' ? 800 : 600,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'all 0.2s ease',
          }}
        >
          <i className="fa-solid fa-user-plus" style={{ color: 'var(--color-primary)' }}></i>
          Nieuw lid bij Kriko-m
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bestaand')}
          style={{
            padding: '14px 20px',
            borderRadius: 'var(--border-radius-sm)',
            border: activeTab === 'bestaand' ? '2px solid var(--color-primary)' : '1px solid transparent',
            backgroundColor: activeTab === 'bestaand' ? '#fff' : 'transparent',
            color: activeTab === 'bestaand' ? 'var(--color-primary-dark)' : 'var(--color-text-dark)',
            fontWeight: activeTab === 'bestaand' ? 800 : 600,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'all 0.2s ease',
          }}
        >
          <i className="fa-solid fa-user-check" style={{ color: 'var(--color-primary)' }}></i>
          Reeds lid (Herinschrijving)
        </button>
      </div>

      {/* Stappenplan Card */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '28px 32px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {activeTab === 'nieuw' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
              Inschrijven als nieuw lid
            </h2>
            <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 18, lineHeight: 1.6 }}>
              <li>
                <strong>Vul de online inschrijvingsfiche in:</strong>
                <div style={{ marginTop: 8 }}>
                  <a
                    href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/frontend/formulier/lidworden/O3108G"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ padding: '10px 20px', fontSize: '0.95rem', borderRadius: 'var(--border-radius-sm)' }}
                  >
                    Inschrijvingsfiche invullen &raquo;
                  </a>
                </div>
              </li>
              <li>
                <strong>Stort het lidgeld (€50):</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.98rem', color: 'var(--color-text-dark)' }}>
                  Gelieve €50 over te schrijven op rekening <strong>BE59 7360 6413 2626</strong> (Scouts Kriko-M) met vermelding van <code>[Naam Kind] + [Tak]</code>.
                </p>
              </li>
              <li>
                <strong>Ontvang je lidnummer:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.98rem', color: 'var(--color-text-dark)' }}>
                  Na verwerking van de betaling ontvang je per e-mail het persoonlijk lidnummer van je kind om een account aan te maken op de Groepsadministratie en de steekkaart in te vullen.
                </p>
              </li>
            </ol>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
              Herinschrijving voor bestaande leden
            </h2>
            <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 18, lineHeight: 1.6 }}>
              <li>
                <strong>Meld je aan op de Groepsadministratie:</strong>
                <p style={{ margin: '4px 0 8px 0', fontSize: '0.98rem', color: 'var(--color-text-dark)' }}>
                  Meld je aan met het account van je kind op de Groepsadministratie van Scouts en Gidsen Vlaanderen.
                </p>
                <div>
                  <a
                    href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ padding: '10px 20px', fontSize: '0.95rem', borderRadius: 'var(--border-radius-sm)' }}
                  >
                    Aanmelden op Groepsadministratie &raquo;
                  </a>
                </div>
              </li>
              <li>
                <strong>Stort het lidgeld (€50):</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.98rem', color: 'var(--color-text-dark)' }}>
                  Gelieve €50 over te schrijven op rekening <strong>BE59 7360 6413 2626</strong> (Scouts Kriko-M) met vermelding van <code>[Naam Kind] + [Tak]</code>.
                </p>
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Steekkaart Section */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '24px 32px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
          Individuele Steekkaart
        </h3>
        <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: 1.6, color: 'var(--color-text-dark)' }}>
          Met de individuele steekkaart geef je jaarlijks de medische en contactgegevens van je kind door. Vul deze in op de Groepsadministratie en hou ze up-to-date bij eventuele wijzigingen.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a
            href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: '0.92rem', fontWeight: 700 }}
          >
            <i className="fa-solid fa-right-to-bracket"></i> Naar Groepsadministratie &raquo;
          </a>
          <a
            href="https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginas:lid_individuelesteekkaart"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: '0.92rem', fontWeight: 700 }}
          >
            <i className="fa-solid fa-book-open"></i> Handleiding Steekkaart (Wiki) &raquo;
          </a>
        </div>
      </div>

      {/* Lidgeld & Betaling Card */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '24px 32px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
          Lidgeld ({year})
        </h3>
        <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: 1.6, color: 'var(--color-text-dark)' }}>
          Het inschrijvingsgeld bedraagt <strong>€50</strong> per kind per jaar (€38 voor de verzekering via Scouts en Gidsen Vlaanderen + €12 voor werking en materiaal).
        </p>

        <div
          style={{
            backgroundColor: 'var(--color-bg-linen)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <span style={{ fontSize: '0.98rem', display: 'block' }}>
              <strong>IBAN:</strong> <code style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>BE59 7360 6413 2626</code>
            </span>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-dark)', opacity: 0.85 }}>
              Begunstigde: Scouts Kriko-M | Vermelding: [Naam Kind] + [Tak]
            </span>
          </div>
          <CopyButton text="BE59736064132626" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
            Kopiëer IBAN
          </CopyButton>
        </div>

        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-dark)', lineHeight: 1.5 }}>
          Is de prijs een drempel? Via <strong>Scouting op Maat</strong> zoeken we voor iedereen een oplossing. Lees hier meer over op onze <Link href="/info" style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 700 }}>infopagina</Link>.
        </p>
      </div>

      {/* Vragen Card */}
      <div
        style={{
          backgroundColor: 'rgba(101, 11, 25, 0.04)',
          borderLeft: '4px solid var(--color-primary)',
          borderRadius: 'var(--border-radius-md)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
            Vragen over de inschrijving?
          </h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.92rem', color: 'var(--color-text-dark)' }}>
            De groepsleiding helpt je graag verder.
          </p>
        </div>
        <CopyButton text={email} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          <i className="fas fa-envelope" style={{ marginRight: 6 }}></i> {email}
        </CopyButton>
      </div>

    </div>
  )
}
