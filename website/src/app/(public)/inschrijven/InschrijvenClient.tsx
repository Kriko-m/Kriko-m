'use client'

import { useState } from 'react'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'

interface Props {
  fee1: number
  fee2: number
  year: string
  email: string
}

export default function InschrijvenClient({ fee1, fee2, year, email }: Props) {
  const [activeTab, setActiveTab] = useState<'nieuw' | 'bestaand'>('nieuw')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Proefproberen highlight card */}
      <div
        style={{
          backgroundColor: 'rgba(101, 11, 25, 0.04)',
          border: '1px solid rgba(101, 11, 25, 0.15)',
          borderLeft: '5px solid var(--color-primary)',
          borderRadius: 'var(--border-radius-md)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
        }}
      >
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
            fontSize: '1.2rem',
            flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-star"></i>
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
            Eerst 3 keer gratis proberen?
          </h4>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.95rem', color: 'var(--color-text-dark)', lineHeight: 1.5 }}>
            Twijfel je nog? Nieuwe leden mogen altijd <strong>3 keer gratis proberen</strong> vooraleer in te schrijven! Kom gerust eens langs op zondagochtend om <strong>9:45 stipt</strong> bij ons lokaal op het VP-plein (Industriepark-Noord 33, Sint-Niklaas).
          </p>
        </div>
      </div>

      {/* Selector: Nieuw Lid vs Bestaand Lid */}
      <div>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: 12 }}>
          Kies jouw situatie voor het stappenplan:
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: activeTab === 'nieuw' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fa-solid fa-user-plus" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}></i>
            Nieuw Lid (Eerste Inschrijving)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bestaand')}
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--border-radius-sm)',
              border: activeTab === 'bestaand' ? '2px solid var(--color-secondary)' : '1px solid transparent',
              backgroundColor: activeTab === 'bestaand' ? '#fff' : 'transparent',
              color: activeTab === 'bestaand' ? 'var(--color-primary-dark)' : 'var(--color-text-dark)',
              fontWeight: activeTab === 'bestaand' ? 800 : 600,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: activeTab === 'bestaand' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fa-solid fa-user-check" style={{ color: 'var(--color-secondary)', fontSize: '1.1rem' }}></i>
            Bestaand Lid (Herinschrijving)
          </button>
        </div>
      </div>

      {/* TAB 1: NIEUW LID STAPPENPLAN */}
      {activeTab === 'nieuw' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Stappenplan voor nieuwe leden
              </span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>
                Nieuw inschrijven bij Scouts Kriko-M
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  1
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                    Vul het online inschrijvingsformulier van Scouts &amp; Gidsen Vlaanderen in
                  </h4>
                  <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Als nieuw lid vul je de online inschrijvingsfiche in via het officiële platform van Scouts &amp; Gidsen Vlaanderen.
                  </p>
                  <div style={{ marginTop: 12 }}>
                    <a
                      href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/formulier.html#/lidworden?groep=O3108G"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontWeight: 700 }}
                    >
                      <i className="fa-solid fa-user-plus"></i> Inschrijvingsformulier (Nieuw Lid) &raquo;
                    </a>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  2
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                    Betaal het jaarlijkse lidgeld
                  </h4>
                  <p style={{ margin: '0 0 10px 0', color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Het lidgeld bedraagt <strong>€{fee1}</strong> (of <strong>€{fee2}</strong> voor een volgend kind uit hetzelfde gezin). Dit omvat de verplichte verzekering van Scouts &amp; Gidsen Vlaanderen (€38) en lokale werkingskosten (€12).
                  </p>
                  <div
                    style={{
                      backgroundColor: 'var(--color-bg-linen)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '14px 16px',
                      fontSize: '0.92rem',
                    }}
                  >
                    <div><strong>Rekening:</strong> <code>BE59 7360 6413 2626</code> (Scouts Kriko-M)</div>
                    <div style={{ marginTop: 4 }}><strong>Mededeling:</strong> <code>Lidgeld [Naam Kind] + [Tak]</code></div>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  3
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                    Ontvang je unieke lidnummer per e-mail
                  </h4>
                  <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Zodra de leiding de betaling verwerkt heeft, ontvang je via mail het <strong>persoonlijke lidnummer van Scouts &amp; Gidsen Vlaanderen</strong>.
                  </p>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  4
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                    Maak een account op de Groepsadministratie &amp; vul de steekkaart in
                  </h4>
                  <p style={{ margin: '0 0 10px 0', color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Met het lidnummer maak je een account op de{' '}
                    <a
                      href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 700 }}
                    >
                      Groepsadministratie
                    </a>
                    . Vul hier de <strong>individuele steekkaart</strong> van je kind in (medische gegevens, allergieën en noodcontacten).
                  </p>
                  <a
                    href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', fontSize: '0.9rem' }}
                  >
                    <i className="fa-solid fa-right-to-bracket"></i> Naar Groepsadministratie &raquo;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BESTAAND LID STAPPENPLAN */}
      {activeTab === 'bestaand' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Stappenplan voor herinschrijving
              </span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>
                Herinschrijven voor bestaande leden ({year})
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#fff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  1
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                    Meld je aan op de Groepsadministratie
                  </h4>
                  <p style={{ margin: '0 0 10px 0', color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Ga naar de online{' '}
                    <a
                      href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 700 }}
                    >
                      Groepsadministratie van Scouts &amp; Gidsen Vlaanderen
                    </a>{' '}
                    en log in met je bestaande gebruikersnaam en wachtwoord.
                  </p>
                  <a
                    href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontWeight: 700 }}
                  >
                    <i className="fa-solid fa-right-to-bracket"></i> Inloggen op Groepsadministratie &raquo;
                  </a>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#fff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  2
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                    Controleer en herbevestig de persoonlijke gegevens &amp; steekkaart
                  </h4>
                  <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Controleer of het adres, de telefoonnummers, e-mailadres en de <strong>individuele medische steekkaart</strong> (allergieën, medicatie, noodcontacten) nog helemaal up-to-date zijn voor het nieuwe werkjaar.
                  </p>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#fff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  3
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                    Schrijf het jaarlijkse lidgeld over
                  </h4>
                  <p style={{ margin: '0 0 10px 0', color: 'var(--color-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Maak het lidgeld over (<strong>€{fee1}</strong> voor 1e kind, <strong>€{fee2}</strong> voor volgend kind). Zodra de betaling ontvangen is, is de herinschrijving definitief in orde!
                  </p>
                  <div
                    style={{
                      backgroundColor: 'var(--color-bg-linen)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '14px 16px',
                      fontSize: '0.92rem',
                    }}
                  >
                    <div><strong>Rekening:</strong> <code>BE59 7360 6413 2626</code> (Scouts Kriko-M)</div>
                    <div style={{ marginTop: 4 }}><strong>Mededeling:</strong> <code>Lidgeld [Naam Kind] + [Tak]</code></div>
                  </div>
                </div>
              </div>

              {/* Helpful callout box */}
              <div
                style={{
                  backgroundColor: 'var(--color-bg-linen)',
                  borderLeft: '4px solid var(--color-secondary)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '16px 20px',
                  fontSize: '0.92rem',
                  color: 'var(--color-text-dark)',
                  lineHeight: 1.55,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fa-solid fa-circle-info" style={{ color: 'var(--color-secondary)' }}></i>
                  Eerste keer inloggen op Groepsadministratie?
                </div>
                Heb je nog geen wachtwoord? Maak bij je eerste aanmelding een account aan met het unieke lidnummer van je kind. Dit nummer vind je op de lidkaart of kan opgevraagd worden bij de groepsleiding via <a href={`mailto:${email}`} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>{email}</a>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Groepsadministratie & Medische Steekkaart */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-notes-medical"></i>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--color-primary-dark)' }}>
            Belangrijk: De Individuele Medische Steekkaart
          </h3>
        </div>

        <p style={{ color: 'var(--color-text-dark)', lineHeight: 1.6, margin: 0, fontSize: '0.98rem' }}>
          De individuele steekkaart is een vertrouwelijk medisch en praktisch paspoort. Hiermee bezorgen ouders jaarlijks alle nodige gegevens aan de leiding (allergieën, medicatie, dieetwensen, zwemvaardigheid en noodnummers). Zo garanderen we een veilige en persoonlijke begeleiding op elke activiteit, weekend en kamp.
        </p>

        <div
          style={{
            backgroundColor: 'var(--color-bg-linen)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-md)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className="fa-solid fa-file-pdf" style={{ fontSize: '2rem', color: '#d9381e' }}></i>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                Handleiding Ouders — Invullen Steekkaart
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                Stap-voor-stap handleiding van Scouts &amp; Gidsen Vlaanderen (PDF)
              </div>
            </div>
          </div>

          <a
            href="https://www.scoutsengidsenvlaanderen.be/files/paginas/2015.09.21_handleiding_ouders_steekkaart.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', padding: '9px 18px' }}
          >
            <i className="fa-solid fa-arrow-down-long"></i> Download Handleiding (PDF)
          </a>
        </div>
      </div>

      {/* SECTION: Lidgeld Details & Betaalbox */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-credit-card"></i>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>
            Betaling Lidgeld &amp; Terugbetaling Ziekenfonds
          </h3>
        </div>

        <p style={{ color: 'var(--color-text-dark)', lineHeight: 1.6, margin: 0, fontSize: '0.98rem' }}>
          Het jaarlijkse lidgeld bedraagt <strong>€{fee1}</strong> voor het eerste kind en <strong>€{fee2}</strong> voor elk volgend kind uit hetzelfde gezin. 
        </p>

        {/* Bank Transfer Card */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-linen)',
            borderRadius: 'var(--border-radius-md)',
            padding: '20px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--color-text-dark)' }}>
              <strong>Rekeningnummer:</strong> <code style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>BE59 7360 6413 2626</code>
            </span>
            <CopyButton text="BE59736064132626" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              <i className="fas fa-copy"></i> Kopiëer IBAN
            </CopyButton>
          </div>
          <div style={{ fontSize: '0.95rem' }}>
            <strong>Begunstigde:</strong> Scouts Kriko-M
          </div>
          <div style={{ fontSize: '0.95rem' }}>
            <strong>Mededeling:</strong> <code style={{ backgroundColor: '#fff', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}>Lidgeld [Naam Kind] + [Tak]</code>
          </div>
        </div>

        {/* Mutualiteit / Ziekenfonds Tip */}
        <div
          style={{
            backgroundColor: 'rgba(57, 115, 84, 0.08)',
            borderLeft: '4px solid var(--color-primary)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-hand-holding-medical" style={{ color: 'var(--color-primary)' }}></i>
            Tegemoetkoming van het Ziekenfonds / Mutualiteit
          </h4>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-dark)', lineHeight: 1.55 }}>
            Vrijwel alle ziekenfondsen (CM, Solidaris, Helan, LM, NZVL, etc.) betalen jaarlijks een deel van het lidgeld voor jeugdverenigingen en kampen terug (vaak tussen €15 en €50). Je kan een <strong>fiscale en lidgeldattest rechtstreeks downloaden op de Groepsadministratie</strong> na betaling van het lidgeld!
          </p>
        </div>

        {/* Scouting op maat */}
        <div
          style={{
            backgroundColor: 'rgba(235, 178, 55, 0.12)',
            borderLeft: '4px solid var(--color-accent-light)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-hand-holding-heart" style={{ color: 'var(--color-primary)' }}></i>
            Scouting op Maat (€10 Verminderd Lidgeld)
          </h4>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-dark)', lineHeight: 1.55 }}>
            Financiële drempels mogen voor niemand een reden zijn om thuis te blijven. Via Scouting op Maat betaal je slechts <strong>€10 voor het hele scoutsjaar</strong> (na 1 maart: €5). Spreek in alle vertrouwen een leiding of de groepsleiding aan — we regelen dit discreet.
          </p>
          <div style={{ marginTop: 4 }}>
            <Link
              href="/info?tab=op-maat"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <i className="fa-solid fa-arrow-right"></i> Lees alles over Scouting op Maat &raquo;
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
