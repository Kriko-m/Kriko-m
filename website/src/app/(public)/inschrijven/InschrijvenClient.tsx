'use client'

import { useState } from 'react'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'

interface Props {
  email: string
  year: string
  siteContent?: Record<string, { title?: string; content?: string; image_url?: string }>
}

export default function InschrijvenClient({ email, year }: Props) {
  const [activeTab, setActiveTab] = useState<'nieuw' | 'bestaand'>('nieuw')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>

      {/* Intro paperless card */}
      <div
        style={{
          backgroundColor: 'rgba(101, 11, 25, 0.04)',
          border: '1px solid rgba(101, 11, 25, 0.15)',
          borderLeft: '5px solid var(--color-primary)',
          borderRadius: 'var(--border-radius-md)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-leaf"></i>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
            Elektronisch Inschrijven
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.98rem', color: 'var(--color-text-dark)', lineHeight: 1.5 }}>
            Om de natuur een beetje te sparen en de papierberg te verminderen, kan je je eenvoudig elektronisch inschrijven bij Scouts Kriko-M.
          </p>
        </div>
      </div>

      {/* Main Layout: 2 Columns on Desktop */}
      <div className="register-layout">
        
        {/* Left Column: Interactive Stappenplan & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* Situation Selector Buttons */}
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: 14, fontWeight: 800 }}>
              Kies jouw situatie:
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
                  padding: '16px 20px',
                  borderRadius: 'var(--border-radius-sm)',
                  border: activeTab === 'nieuw' ? '2px solid var(--color-primary)' : '1px solid transparent',
                  backgroundColor: activeTab === 'nieuw' ? '#fff' : 'transparent',
                  color: activeTab === 'nieuw' ? 'var(--color-primary-dark)' : 'var(--color-text-dark)',
                  fontWeight: activeTab === 'nieuw' ? 800 : 600,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: activeTab === 'nieuw' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <i className="fa-solid fa-user-plus" style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}></i>
                Nieuw lid bij Kriko-m
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bestaand')}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--border-radius-sm)',
                  border: activeTab === 'bestaand' ? '2px solid var(--color-primary)' : '1px solid transparent',
                  backgroundColor: activeTab === 'bestaand' ? '#fff' : 'transparent',
                  color: activeTab === 'bestaand' ? 'var(--color-primary-dark)' : 'var(--color-text-dark)',
                  fontWeight: activeTab === 'bestaand' ? 800 : 600,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: activeTab === 'bestaand' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <i className="fa-solid fa-user-check" style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}></i>
                Reeds lid bij Kriko-m
              </button>
            </div>
          </div>

          {/* TAB 1: NIEUW LID STAPPENPLAN */}
          {activeTab === 'nieuw' && (
            <div
              style={{
                backgroundColor: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 16 }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  Stappenplan
                </span>
                <h3 style={{ margin: 0, fontSize: '1.45rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                  Nieuw lid bij Kriko-m
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                      Vul de online inschrijvingsfiche in
                    </h4>
                    <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '1rem' }}>
                      Als je een nieuw lid bent, vul je de inschrijvingsfiche online in via het officiële platform van Scouts &amp; Gidsen Vlaanderen.
                    </p>
                    <div style={{ marginTop: 14 }}>
                      <a
                        href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/formulier.html#/lidworden?groep=O3108G"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', fontWeight: 700, borderRadius: 'var(--border-radius-sm)' }}
                      >
                        <i className="fa-solid fa-pen-to-square"></i> Inschrijvingsfiche invullen (Nieuw Lid) &raquo;
                      </a>
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                      Schrijf het lidgeld (€50) over
                    </h4>
                    <p style={{ margin: '0 0 12px 0', color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '1rem' }}>
                      Het inschrijvingsgeld bedraagt <strong>50 euro</strong> (38 euro voor verzekering + 12 euro voor spelmateriaal en drukkosten). Gelieve dit bedrag te storten op ons rekeningnummer met vermelding van <strong>naam en tak</strong>.
                    </p>
                    
                    <div
                      style={{
                        backgroundColor: 'var(--color-bg-linen)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <span style={{ fontSize: '0.98rem' }}>
                          <strong>Rekeningnummer:</strong> <code style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>BE59 7360 6413 2626</code>
                        </span>
                        <CopyButton text="BE59736064132626" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                          Kopiëer IBAN
                        </CopyButton>
                      </div>
                      <div style={{ fontSize: '0.95rem' }}>
                        <strong>Begunstigde:</strong> Scouts Kriko-M
                      </div>
                      <div style={{ fontSize: '0.95rem' }}>
                        <strong>Vermelding:</strong> <code style={{ backgroundColor: '#fff', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}>[Naam Kind] + [Tak]</code>
                      </div>
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    3
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                      Ontvang je persoonlijk lidnummer via mail
                    </h4>
                    <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '1rem' }}>
                      Daarna zal je na overschrijving van het lidgeld via mail je persoonlijk lidnummer ontvangen van de groepsleiding.
                    </p>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

                {/* Step 4 */}
                <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    4
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                      Maak een account &amp; vul de steekkaart in op de Groepsadministratie
                    </h4>
                    <p style={{ margin: '0 0 12px 0', color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '1rem' }}>
                      Hiermee kan je ook een persoonlijk account maken op de{' '}
                      <a
                        href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 700 }}
                      >
                        Groepsadministratie
                      </a>
                      . De groepsadministratie is het platform waar je de persoonlijke steekkaart van je kind invult.
                    </p>
                    <a
                      href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontWeight: 700 }}
                    >
                      <i className="fa-solid fa-right-to-bracket"></i> Naar de Groepsadministratie &raquo;
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: REEDS LID STAPPENPLAN */}
          {activeTab === 'bestaand' && (
            <div
              style={{
                backgroundColor: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 16 }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  Herinschrijving
                </span>
                <h3 style={{ margin: 0, fontSize: '1.45rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                  Reeds lid bij Kriko-m
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                      Meld je aan op de Groepsadministratie
                    </h4>
                    <p style={{ margin: '0 0 12px 0', color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '1rem' }}>
                      Ben je al lid bij Kriko-m, meld je dan aan op de{' '}
                      <a
                        href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 700 }}
                      >
                        Groepsadministratie
                      </a>{' '}
                      en betaal vervolgens je lidgeld.
                    </p>

                    <div style={{ margin: '14px 0' }}>
                      <a
                        href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', fontWeight: 700, borderRadius: 'var(--border-radius-sm)' }}
                      >
                        <i className="fa-solid fa-right-to-bracket"></i> Aanmelden op Groepsadministratie &raquo;
                      </a>
                    </div>

                    {/* Eerste keer inloggen info block */}
                    <div
                      style={{
                        backgroundColor: 'var(--color-bg-linen)',
                        borderLeft: '4px solid var(--color-primary)',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '16px 20px',
                        fontSize: '0.95rem',
                        color: 'var(--color-text-dark)',
                        lineHeight: 1.6,
                        marginTop: 14,
                      }}
                    >
                      <strong style={{ color: 'var(--color-primary-dark)', display: 'block', marginBottom: 6, fontSize: '1rem' }}>
                        <i className="fa-solid fa-info-circle" style={{ color: 'var(--color-primary)', marginRight: 6 }}></i>
                        Eerste keer dat u inlogt op deze website?
                      </strong>
                      Indien het de eerste keer is dat u inlogt op deze website moet je je kind eerst registreren. Voor elk kind maak je apart een login aan, het is immers de bedoeling dat ze hun gegevens zelf beheren als ze oud genoeg zijn. Hiervoor heb je het persoonlijk lidnummer van je kind nodig. Deze worden in september doorgemaild door de groepsleiding of vind je op de lidkaart van je kind.
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                      Betaal vervolgens je lidgeld (€50)
                    </h4>
                    <p style={{ margin: '0 0 12px 0', color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '1rem' }}>
                      Het inschrijvingsgeld bedraagt <strong>50 euro</strong>. Gelieve dit bedrag te storten op het rekeningnummer met vermelding van <strong>naam en tak</strong>.
                    </p>

                    <div
                      style={{
                        backgroundColor: 'var(--color-bg-linen)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <span style={{ fontSize: '0.98rem' }}>
                          <strong>Rekeningnummer:</strong> <code style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>BE59 7360 6413 2626</code>
                        </span>
                        <CopyButton text="BE59736064132626" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                          Kopiëer IBAN
                        </CopyButton>
                      </div>
                      <div style={{ fontSize: '0.95rem' }}>
                        <strong>Begunstigde:</strong> Scouts Kriko-M
                      </div>
                      <div style={{ fontSize: '0.95rem' }}>
                        <strong>Vermelding:</strong> <code style={{ backgroundColor: '#fff', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}>[Naam Kind] + [Tak]</code>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION: Aanmelden en invullen van de steekkaart op groepsadministratie */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-file-medical"></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                Aanmelden en invullen van de steekkaart op de groepsadministratie
              </h3>
            </div>

            <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '1rem' }}>
              Met deze individuele steekkaart geven ouders jaarlijks aan de takleiding alle noodzakelijke inlichtingen over hun kind(eren). Deze informatie draagt bij aan een veilige en persoonlijke begeleiding van alle leden en wordt vertrouwelijk behandeld door de leidingsploeg.
            </p>

            <div
              style={{
                backgroundColor: 'rgba(101, 11, 25, 0.04)',
                borderLeft: '4px solid var(--color-primary)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '16px 20px',
                fontSize: '0.98rem',
                color: 'var(--color-text-dark)',
                lineHeight: 1.6,
              }}
            >
              <strong><i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--color-primary)', marginRight: 6 }}></i> Belangrijk:</strong> Wanneer er wijzigingen zijn in deze gegevens is het belangrijk om deze ten allen tijde aan te passen in de groepsadministratie (via je persoonlijk account).
            </div>

            {/* Downloadable Stappenplan Card */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <i className="fa-solid fa-file-pdf" style={{ fontSize: '2.2rem', color: '#dc2626' }}></i>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                    Stappenplan Steekkaart Invullen
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-dark)', opacity: 0.8 }}>
                    Handleiding voor ouders voor het aanmelden en invullen van de steekkaart (PDF)
                  </p>
                </div>
              </div>

              <a
                href="https://www.scoutsengidsenvlaanderen.be/files/paginas/2015.09.21_handleiding_ouders_steekkaart.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontWeight: 700, fontSize: '0.92rem' }}
              >
                <i className="fa-solid fa-download"></i> Bekijk Stappenplan (PDF) &raquo;
              </a>
            </div>

          </div>

          {/* SECTION: Lidgeld */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-coins"></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                Lidgeld
              </h3>
            </div>

            <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '1rem' }}>
              Het inschrijvingsgeld bedraagt <strong>50 euro</strong>. Dit geld gaat naar de verzekering (38 euro) en andere kosten (12 euro) zoals spelmateriaal en drukkosten.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--color-bg-linen)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>€38</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 2 }}>Verzekering</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', opacity: 0.8, marginTop: 4 }}>
                  Scouts &amp; Gidsen Vlaanderen
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-linen)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>€12</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 2 }}>Werkingskosten</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', opacity: 0.8, marginTop: 4 }}>
                  Spelmateriaal &amp; drukkosten
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-bg-linen)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <p style={{ margin: 0, fontSize: '0.98rem' }}>
                Gelieve dit bedrag te storten op het rekeningnummer <code>BE59 7360 6413 2626</code> met vermelding van <strong>naam en tak</strong>.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                  IBAN: BE59 7360 6413 2626
                </span>
                <CopyButton text="BE59736064132626" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                  Kopiëer IBAN
                </CopyButton>
              </div>
            </div>

          </div>

          {/* SECTION: Scouting op maat */}
          <div
            style={{
              backgroundColor: 'rgba(101, 11, 25, 0.04)',
              border: '1px solid rgba(101, 11, 25, 0.15)',
              borderLeft: '5px solid var(--color-primary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="fa-solid fa-heart-pulse" style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}></i>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                Scouting op Maat
              </h3>
            </div>

            <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '1rem' }}>
              We weten dat de prijs van een jaar scouting voor uw kind(eren) een belangrijke hap uit uw gezinsbudget kan zijn. Maar we vinden ook dat dit voor niemand een reden mag zijn om thuis te blijven.
            </p>

            <div>
              <Link
                href="/info"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontWeight: 700, fontSize: '0.95rem' }}
              >
                <i className="fa-solid fa-arrow-right"></i> Meer informatie op de infopagina &raquo;
              </Link>
            </div>
          </div>

        </div>

        {/* Right Sidebar Column */}
        <div>
          <div
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              borderRadius: 'var(--border-radius-lg)',
              padding: '28px 24px',
              position: 'sticky',
              top: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h3
              style={{
                color: 'var(--color-accent-light)',
                borderBottom: '1px dashed rgba(255,255,255,0.25)',
                paddingBottom: 12,
                marginTop: 0,
                marginBottom: 0,
                fontSize: '1.25rem',
                fontWeight: 800,
              }}
            >
              Overzicht Inschrijving {year}
            </h3>

            {/* Price badge */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 'var(--border-radius-md)',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>Lidgeld per jaar</strong>
                <span style={{ fontSize: '0.82rem', opacity: 0.85 }}>€38 verzekering + €12 werking</span>
              </div>
              <span
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: 'var(--color-accent-light)',
                  fontFamily: 'var(--font-outfit), sans-serif',
                }}
              >
                €50
              </span>
            </div>

            {/* Quick links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-accent-light)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Handige Links:
              </strong>

              <a
                href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  padding: '10px 14px',
                  borderRadius: 'var(--border-radius-sm)',
                  transition: 'background 0.2s ease',
                }}
              >
                <i className="fa-solid fa-right-to-bracket" style={{ color: 'var(--color-accent-light)' }}></i>
                <span>Groepsadministratie</span>
              </a>

              <a
                href="https://www.scoutsengidsenvlaanderen.be/files/paginas/2015.09.21_handleiding_ouders_steekkaart.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  padding: '10px 14px',
                  borderRadius: 'var(--border-radius-sm)',
                  transition: 'background 0.2s ease',
                }}
              >
                <i className="fa-solid fa-file-pdf" style={{ color: 'var(--color-accent-light)' }}></i>
                <span>Handleiding Steekkaart (PDF)</span>
              </a>

              <Link
                href="/info"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  padding: '10px 14px',
                  borderRadius: 'var(--border-radius-sm)',
                  transition: 'background 0.2s ease',
                }}
              >
                <i className="fa-solid fa-info-circle" style={{ color: 'var(--color-accent-light)' }}></i>
                <span>Infopagina &amp; Scouting op Maat</span>
              </Link>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.2)', margin: '4px 0' }} />

            {/* Questions contact box */}
            <div>
              <h4 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: '0.98rem', fontWeight: 700 }}>
                Nog vragen over inschrijven?
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', marginBottom: 12, lineHeight: 1.5 }}>
                De groepsleiding helpt je graag verder!
              </p>
              <CopyButton
                text={email}
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.88rem', padding: '10px' }}
              >
                <i className="fas fa-envelope"></i> {email}
              </CopyButton>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
