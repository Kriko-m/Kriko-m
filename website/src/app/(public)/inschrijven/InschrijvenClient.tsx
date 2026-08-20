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
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Situatie Keuze Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 8,
          backgroundColor: '#fff',
          padding: 6,
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('nieuw')}
          style={{
            padding: '14px 24px',
            borderRadius: 'var(--border-radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'nieuw' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'nieuw' ? '#fff' : 'var(--color-primary-dark)',
            fontWeight: activeTab === 'nieuw' ? 800 : 600,
            fontSize: '1.05rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'nieuw' ? '0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent)' : 'none',
          }}
        >
          <i
            className="fa-solid fa-user-plus"
            style={{
              color: activeTab === 'nieuw' ? 'var(--color-accent)' : 'var(--color-primary)',
              fontSize: '1.1rem',
            }}
          ></i>
          Nieuw lid bij Kriko-M
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bestaand')}
          style={{
            padding: '14px 24px',
            borderRadius: 'var(--border-radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'bestaand' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'bestaand' ? '#fff' : 'var(--color-primary-dark)',
            fontWeight: activeTab === 'bestaand' ? 800 : 600,
            fontSize: '1.05rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'bestaand' ? '0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent)' : 'none',
          }}
        >
          <i
            className="fa-solid fa-user-check"
            style={{
              color: activeTab === 'bestaand' ? 'var(--color-accent)' : 'var(--color-primary)',
              fontSize: '1.1rem',
            }}
          ></i>
          Reeds lid (Herinschrijving)
        </button>
      </div>

      {activeTab === 'nieuw' ? (
        <>
          {/* STAP 1: Inschrijvingsformulier (Openklappen) */}
          <div
            style={{
              backgroundColor: '#fff',
              border: isFormOpen ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '28px 32px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'inline-block', backgroundColor: 'var(--color-primary)', color: '#fff', padding: '4px 12px', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', fontWeight: 800, marginBottom: 8 }}>
                  Stap 1
                </div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                  Inschrijvingsformulier invullen
                </h2>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.98rem', color: 'var(--color-text-dark)', lineHeight: 1.6 }}>
                  Vul het officiële inschrijvingsformulier van Scouts en Gidsen Vlaanderen in met de gegevens van het nieuwe lid en de contactgegevens van de ouders.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="btn btn-secondary"
                style={{
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 'var(--border-radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  whiteSpace: 'nowrap',
                }}
              >
                <i className={`fa-solid ${isFormOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                {isFormOpen ? 'Verberg het inschrijvingsformulier' : 'Open het inschrijvingsformulier'}
              </button>
            </div>

            {/* Klap-in / Klap-uit Iframe Formulier */}
            {isFormOpen && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 20,
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '820px',
                    borderRadius: 'var(--border-radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#fcfcfc',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <iframe
                    src="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/frontend/formulier/lidworden/O3108G"
                    title="Inschrijvingsformulier Scouts Kriko-M"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 4 }}>
                  <span style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    Lukt het invullen hier niet of open je het formulier liever op een groter scherm?
                  </span>
                  <a
                    href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/frontend/formulier/lidworden/O3108G"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '10px 20px', fontSize: '0.92rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> Open hetzelfde inschrijvingsformulier in nieuw tabblad &raquo;
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* STAP 2: Lidgeld overschrijven */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '28px 32px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: 'inline-block', backgroundColor: 'var(--color-primary)', color: '#fff', padding: '4px 12px', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', fontWeight: 800, marginBottom: 8 }}>
                Stap 2
              </div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                Lidgeld overschrijven (€ 50)
              </h2>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.98rem', color: 'var(--color-text-dark)', lineHeight: 1.6 }}>
                Na het versturen van het inschrijvingsformulier stort je het lidgeld. Het bedrag is <strong>€ 50</strong> per kind per jaar (€ 38 voor de verzekering via Scouts en Gidsen Vlaanderen + € 12 voor de algemene werking en materiaal van Kriko-M).
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-bg-linen)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-md)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <span style={{ fontSize: '1.05rem', display: 'block', marginBottom: 2 }}>
                  <strong>IBAN:</strong> <code style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>BE59 7360 6413 2626</code>
                </span>
                <span style={{ fontSize: '0.92rem', color: 'var(--color-text-dark)' }}>
                  <strong>Begunstigde:</strong> Scouts Kriko-M &nbsp;|&nbsp; <strong>Vermelding:</strong> <code>[Naam Kind] + [Tak]</code>
                </span>
              </div>
              <CopyButton text="BE59736064132626" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.92rem' }}>
                Kopiëer IBAN
              </CopyButton>
            </div>

            <div style={{ backgroundColor: 'rgba(101, 11, 25, 0.04)', borderRadius: 'var(--border-radius-sm)', padding: '12px 16px', borderLeft: '4px solid var(--color-primary)' }}>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-primary-dark)', fontWeight: 600, lineHeight: 1.5 }}>
                <i className="fa-solid fa-user-check" style={{ marginRight: 8 }}></i>
                Na ontvangst van het formulier en de betaling wordt de inschrijving goedgekeurd door onze verantwoordelijke.
              </p>
            </div>
          </div>

          {/* STAP 3: Individuele Steekkaart (Informatie) */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '28px 32px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: 'inline-block', backgroundColor: 'var(--color-primary)', color: '#fff', padding: '4px 12px', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', fontWeight: 800, marginBottom: 8 }}>
                Stap 3
              </div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                Individuele Steekkaart (na ontvangst lidnummer)
              </h2>
            </div>

            <div style={{ backgroundColor: 'rgba(237, 232, 208, 0.4)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: '16px 20px' }}>
              <p style={{ margin: 0, fontSize: '0.96rem', color: 'var(--color-text-dark)', lineHeight: 1.6 }}>
                <strong>Let op:</strong> Deze stap is pas van toepassing nadat je na een week of 2 à 3 je persoonlijk lidnummer per e-mail hebt ontvangen!
              </p>
            </div>

            <p style={{ margin: 0, fontSize: '0.96rem', lineHeight: 1.6, color: 'var(--color-text-dark)' }}>
              Met het lidnummer kun je inloggen op de Groepsadministratie van Scouts en Gidsen Vlaanderen om de <strong>Individuele Steekkaart</strong> van je kind in te vullen. Hierop geef je belangrijke medische gegevens, dieetwensen en noodnummers door voor een veilige werking.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
              <a
                href="https://www.scoutsengidsenvlaanderen.be/ouders/praktisch/inschrijven/individuele-steekkaart"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.95rem', fontWeight: 700 }}
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Info Individuele Steekkaart &raquo;
              </a>
              <a
                href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.95rem', fontWeight: 700 }}
              >
                <i className="fa-solid fa-right-to-bracket"></i> Naar Groepsadministratie &raquo;
              </a>
            </div>
          </div>
        </>
      ) : (
        /* REEDS LID (HERINSCHRIJVING) - COMPACT & ESSENTIEEL */
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '32px 36px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
              Herinschrijving voor bestaande leden
            </h2>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.98rem', color: 'var(--color-text-dark)', lineHeight: 1.5 }}>
              Je blijft in principe <strong>voor altijd ingeschreven</strong> bij Kriko-M tot wanneer je jezelf formeel uitschrijft of je lidgeld niet meer betaalt.
            </p>
          </div>

          {/* Enkel Lidgeld Betaling */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-linen)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
              Om te herinschrijven hoef je enkel het lidgeld (€ 50) over te schrijven:
            </h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                backgroundColor: '#fff',
                padding: '16px 20px',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <span style={{ fontSize: '1.05rem', display: 'block', marginBottom: 2 }}>
                  <strong>IBAN:</strong> <code style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>BE59 7360 6413 2626</code>
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)' }}>
                  <strong>Begunstigde:</strong> Scouts Kriko-M &nbsp;|&nbsp; <strong>Vermelding:</strong> <code>[Naam Kind] + [Tak]</code>
                </span>
              </div>
              <CopyButton text="BE59736064132626" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                Kopiëer IBAN
              </CopyButton>
            </div>
          </div>

          {/* Steekkaart herinnering */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
              Individuele Steekkaart controleren
            </h4>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-dark)', lineHeight: 1.6 }}>
              Vergeet niet om jaarlijks eventuele nieuwe medische of contactgegevens van je kind aan te passen op de Groepsadministratie.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
              <a
                href="https://www.scoutsengidsenvlaanderen.be/ouders/praktisch/inschrijven/individuele-steekkaart"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.95rem', fontWeight: 700 }}
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Info Individuele Steekkaart &raquo;
              </a>
              <a
                href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.95rem', fontWeight: 700 }}
              >
                <i className="fa-solid fa-right-to-bracket"></i> Naar Groepsadministratie &raquo;
              </a>
            </div>
          </div>
        </div>
      )}

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
            De groepsleiding en inschrijvingsverantwoordelijke helpen je graag verder.
          </p>
        </div>
        <CopyButton text={email} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          <i className="fas fa-envelope" style={{ marginRight: 6 }}></i> {email}
        </CopyButton>
      </div>

    </div>
  )
}

