'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useScrollLock } from '@/lib/useScrollLock'
import EditableText from '@/components/editing/EditableText'

type ModalType = 'bestellen' | 'afhaling' | 'uniform' | null

interface ShopInfoModalsProps {
  bankIban?: string
  webshopPhone?: string
}

export default function ShopInfoModals({
  bankIban = 'BE59 7360 6413 2626',
  webshopPhone = '',
}: ShopInfoModalsProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [mounted, setMounted] = useState(false)

  useScrollLock(activeModal !== null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sluiten bij Escape toets
  useEffect(() => {
    if (!activeModal) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModal])

  const closeModal = () => setActiveModal(null)

  return (
    <>
      {/* 3 Navigatie Knoppen (in dezelfde stijl als de Info en Inschrijfpagina) */}
      <div className="shop-info-tabs-bar" style={{ marginBottom: 36 }}>
        <button
          type="button"
          onClick={() => setActiveModal('bestellen')}
          className={`shop-info-tab-btn ${activeModal === 'bestellen' ? 'active' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={activeModal === 'bestellen'}
        >
          <i className="fa-solid fa-cart-shopping shop-info-tab-icon" aria-hidden="true" />
          <span className="shop-info-tab-label">Hoe bestellen &amp; betalen?</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModal('afhaling')}
          className={`shop-info-tab-btn ${activeModal === 'afhaling' ? 'active' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={activeModal === 'afhaling'}
        >
          <i className="fa-solid fa-handshake shop-info-tab-icon" aria-hidden="true" />
          <span className="shop-info-tab-label">Afhaling van bestellingen</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModal('uniform')}
          className={`shop-info-tab-btn ${activeModal === 'uniform' ? 'active' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={activeModal === 'uniform'}
        >
          <i className="fa-solid fa-shirt shop-info-tab-icon" aria-hidden="true" />
          <span className="shop-info-tab-label">Waar koop je wat? (Hopper)</span>
        </button>
      </div>

      {/* Pop-out Modals via Portal */}
      {mounted && typeof document !== 'undefined' && activeModal && createPortal(
        <div
          className="shop-modal-overlay"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="shop-modal-container"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* ========================================================================= */}
            {/* MODAL 1: HOE BESTELLEN & BETALEN */}
            {/* ========================================================================= */}
            {activeModal === 'bestellen' && (
              <>
                <div className="shop-modal-header">
                  <div className="shop-modal-title-group">
                    <div className="shop-modal-header-icon" aria-hidden="true">
                      <i className="fa-solid fa-cart-shopping" />
                    </div>
                    <div>
                      <h3 className="shop-modal-title">Hoe bestellen &amp; betalen?</h3>
                      <p className="shop-modal-subtitle">Eenvoudig bestellen in 4 stappen zonder account</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shop-modal-close-btn"
                    onClick={closeModal}
                    aria-label="Venster sluiten"
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </div>

                <div className="shop-modal-body">
                  <div className="shop-modal-steps-list">
                    {/* Stap 1 */}
                    <div className="shop-modal-step-card">
                      <div className="shop-modal-step-badge">1</div>
                      <div className="shop-modal-step-text">
                        <h4>Kies je artikelen &amp; maat</h4>
                        <p>
                          Kies je trui, t-shirt, groepsdas of kentekens, selecteer de gewenste maat en klik op <strong>In winkelmandje</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Stap 2 */}
                    <div className="shop-modal-step-card">
                      <div className="shop-modal-step-badge">2</div>
                      <div className="shop-modal-step-text">
                        <h4>Bestel &amp; bevestig</h4>
                        <p>
                          Afrekenen gebeurt snel en eenvoudig zonder account. Vul enkel je naam en telefoonnummer in (e-mailadres is optioneel indien je een bevestigingsmail wenst). Na het afronden kan je direct je bestelbevestiging downloaden!
                        </p>
                      </div>
                    </div>

                    {/* Stap 3 */}
                    <div className="shop-modal-step-card">
                      <div className="shop-modal-step-badge">3</div>
                      <div className="shop-modal-step-text">
                        <h4>Kies je betaalmethode</h4>
                        <p style={{ marginBottom: 8 }}>
                          Bij het afrekenen kies je hoe je wenst te betalen:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.88rem', color: '#4A5568', lineHeight: 1.6 }}>
                          <li style={{ marginBottom: 6 }}>
                            <strong>Betaling via overschrijving:</strong> Schrijf het bedrag over naar onze rekening (<code style={{ background: '#F0ECE4', padding: '2px 6px', borderRadius: 4, fontWeight: 700, color: 'var(--color-primary-dark)' }}>{bankIban}</code>) met vermelding van je unieke mededeling (bv. <code style={{ background: '#F0ECE4', padding: '2px 6px', borderRadius: 4, fontWeight: 700, color: 'var(--color-primary-dark)' }}>KM-0042</code>).
                          </li>
                          <li>
                            <strong>Betaling bij afhaling (Cash / Payconiq):</strong> Betaal ter plaatse cash of via Payconiq. <em>Belangrijk:</em> bij contante betaling vragen we <strong>steeds een gepaste hoeveelheid cash</strong> mee te brengen.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Stap 4 */}
                    <div className="shop-modal-step-card">
                      <div className="shop-modal-step-badge">4</div>
                      <div className="shop-modal-step-text">
                        <h4>Afhaling wordt besproken via bericht</h4>
                        <p>
                          Onze uniformverantwoordelijke{webshopPhone ? ` (${webshopPhone})` : ''} neemt rechtstreeks via bericht (SMS of WhatsApp) of telefonisch contact met je op om de afhaling af te spreken.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shop-modal-footer">
                  <div className="shop-modal-footer-links">
                    <Link href="/voorwaarden" onClick={closeModal} className="shop-modal-link">
                      Verkoopsvoorwaarden
                    </Link>
                    <span className="shop-modal-dot">•</span>
                    <Link href="/contact" onClick={closeModal} className="shop-modal-link">
                      Contacteer ons bij vragen
                    </Link>
                  </div>
                  <button type="button" className="btn btn-outline" onClick={closeModal}>
                    Begrepen
                  </button>
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2: AFHALING VAN BESTELLINGEN */}
            {/* ========================================================================= */}
            {activeModal === 'afhaling' && (
              <>
                <div className="shop-modal-header">
                  <div className="shop-modal-title-group">
                    <div className="shop-modal-header-icon" aria-hidden="true">
                      <i className="fa-solid fa-handshake" />
                    </div>
                    <div>
                      <h3 className="shop-modal-title">Afhaling van bestellingen</h3>
                      <p className="shop-modal-subtitle">Rechtstreeks besproken met onze uniformverantwoordelijke</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shop-modal-close-btn"
                    onClick={closeModal}
                    aria-label="Venster sluiten"
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </div>

                <div className="shop-modal-body">
                  <div className="shop-modal-notices-grid">
                    <div className="shop-modal-notice-item">
                      <div className="shop-modal-notice-icon">
                        <i className="fa-solid fa-comments" />
                      </div>
                      <div>
                        <h4>Afhaling via rechtstreeks bericht</h4>
                        <p>
                          Het afhalen van bestellingen gebeurt niet zomaar aan de lokalen, maar wordt steeds <strong>rechtstreeks via bericht (SMS / WhatsApp) of telefonisch besproken met onze uniformverantwoordelijke{webshopPhone ? ` (${webshopPhone})` : ''}</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="shop-modal-notice-item">
                      <div className="shop-modal-notice-icon">
                        <i className="fa-solid fa-wallet" />
                      </div>
                      <div>
                        <h4>Betaalmethode bij overhandiging</h4>
                        <p>
                          Kies je voor betaling bij afhaling? Dan kan je ter plaatse betalen via <strong>Payconiq of cash</strong>. Bij een cash betaling vragen we vriendelijk doch uitdrukkelijk om <strong>steeds een gepaste hoeveelheid cash</strong> te voorzien.
                        </p>
                      </div>
                    </div>

                    <div className="shop-modal-notice-item">
                      <div className="shop-modal-notice-icon">
                        <i className="fa-solid fa-box-open" />
                      </div>
                      <div>
                        <h4>Geen verzending per post</h4>
                        <p>
                          Bestelde artikelen worden niet per post verzonden om extra verzendkosten en administratie te vermijden.
                        </p>
                      </div>
                    </div>

                    <div className="shop-modal-notice-item">
                      <div className="shop-modal-notice-icon">
                        <i className="fa-solid fa-rotate" />
                      </div>
                      <div>
                        <h4>Omruilen of maat aanpassen</h4>
                        <p>
                          Past een kledingstuk toch niet zoals gewenst? In overleg met de uniformverantwoordelijke kan dit kosteloos worden omgeruild (mits ongebruikt en in originele staat).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="shop-modal-callout" style={{ background: '#FAF6EE', borderColor: '#EADECC' }}>
                    <i className="fa-solid fa-circle-question" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                    <div>
                      <strong>Vragen over een bestelling of afhaling?</strong>{' '}
                      {webshopPhone ? (
                        <>
                          Contacteer onze uniformverantwoordelijke op{' '}
                          <a
                            href={`tel:${webshopPhone.replace(/\s+/g, '')}`}
                            style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
                          >
                            {webshopPhone}
                          </a>{' '}
                          of neem contact op via het{' '}
                        </>
                      ) : (
                        'Neem gerust contact op via het '
                      )}
                      <Link href="/contact" onClick={closeModal} style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}>contactformulier</Link>.
                    </div>
                  </div>
                </div>

                <div className="shop-modal-footer">
                  <Link href="/voorwaarden" onClick={closeModal} className="shop-modal-link">
                    Lees onze verkoopsvoorwaarden
                  </Link>
                  <button type="button" className="btn btn-outline" onClick={closeModal}>
                    Sluiten
                  </button>
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* MODAL 3: WAAR KOOP JE WAT (HOPPER VS KRIKO-M) */}
            {/* ========================================================================= */}
            {activeModal === 'uniform' && (
              <>
                <div className="shop-modal-header">
                  <div className="shop-modal-title-group">
                    <div className="shop-modal-header-icon" aria-hidden="true">
                      <i className="fa-solid fa-shirt" />
                    </div>
                    <div>
                      <h3 className="shop-modal-title">Waar koop je wat?</h3>
                      <p className="shop-modal-subtitle">Overzicht tussen de Kriko-M webshop en de Hopper scoutswinkel</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shop-modal-close-btn"
                    onClick={closeModal}
                    aria-label="Venster sluiten"
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </div>

                <div className="shop-modal-body">
                  <p style={{ margin: 0, fontSize: '0.94rem', color: '#333333', lineHeight: 1.6 }}>
                    <EditableText
                      blockKey="shop.info.content"
                      page="shop"
                      section="info"
                      field="content"
                      defaultValue="Standaard scoutskledij zoals de officiële scoutsbroek of -rok en het scoutshemd schaf je aan via de Hopper winkel of webshop. Via onze eigen Kriko-M webshop bestel je onze unieke groepskledij (T-shirt, trui en groepsdas). Kentekens zijn eveneens te bestellen via Hopper, maar bieden we voor het gemak ook rechtstreeks aan in onze webshop!"
                      as="span"
                      multiline
                    />
                  </p>

                  {/* 2 Kolommen overzicht */}
                  <div className="shop-modal-uniform-grid">
                    {/* Kriko-M Webshop */}
                    <div className="shop-modal-uniform-box" style={{ background: '#FAF6EE', borderColor: '#EADECC' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--color-primary, #650B19)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="fa-solid fa-shirt" style={{ fontSize: '0.9rem' }} aria-hidden="true" />
                        <span>Kriko-M Webshop (deze site)</span>
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.92rem', color: '#2C1D18' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="fa-solid fa-check" style={{ color: 'var(--color-primary, #650B19)', fontSize: '0.8rem' }} aria-hidden="true" />
                          <span>Kriko-M Trui (bordeaux)</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="fa-solid fa-check" style={{ color: 'var(--color-primary, #650B19)', fontSize: '0.8rem' }} aria-hidden="true" />
                          <span>Kriko-M T-shirt (bordeaux)</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="fa-solid fa-check" style={{ color: 'var(--color-primary, #650B19)', fontSize: '0.8rem' }} aria-hidden="true" />
                          <span>Kriko-M Groepsdas (bordeaux/beige)</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="fa-solid fa-check" style={{ color: 'var(--color-primary, #650B19)', fontSize: '0.8rem' }} aria-hidden="true" />
                          <span>Kentekens (jaarteken, takteken, etc.)</span>
                        </li>
                      </ul>
                    </div>

                    {/* Hopper Winkel */}
                    <div className="shop-modal-uniform-box" style={{ background: '#FAF6EE', borderColor: '#EADECC' }}>
                      <div>
                        <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#1C3A27', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="fa-solid fa-compass" style={{ color: '#2E8B3A', fontSize: '0.9rem' }} aria-hidden="true" />
                          <span>Hopper Scoutswinkel</span>
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.92rem', color: '#1C2921' }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fa-solid fa-check" style={{ color: '#2E8B3A', fontSize: '0.8rem' }} aria-hidden="true" />
                            <span>Scoutshemd</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fa-solid fa-check" style={{ color: '#2E8B3A', fontSize: '0.8rem' }} aria-hidden="true" />
                            <span>Scoutsbroek, -rok of -short</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fa-solid fa-check" style={{ color: '#2E8B3A', fontSize: '0.8rem' }} aria-hidden="true" />
                            <span>Scoutsriem &amp; -kousen</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fa-solid fa-check" style={{ color: '#2E8B3A', fontSize: '0.8rem' }} aria-hidden="true" />
                            <span>Kampeermateriaal</span>
                          </li>
                        </ul>
                      </div>
                      <a
                        href="https://www.hopper.be"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{ fontSize: '0.85rem', padding: '6px 12px', textAlign: 'center', marginTop: 10 }}
                      >
                        Bezoek Hopper.be <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.75rem', marginLeft: 4 }} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="shop-modal-footer">
                  <a
                    href="https://www.scoutsengidsenvlaanderen.be/scouts-en-gidsenleden/praktisch/waar-horen-de-kentekens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shop-modal-link"
                    style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <i className="fa-solid fa-compass" />
                    Opnaai-instructies kentekens
                  </a>
                  <button type="button" className="btn btn-outline" onClick={closeModal}>
                    Sluiten
                  </button>
                </div>
              </>
            )}

          </div>
        </div>,
        document.body
      )}
    </>
  )
}
