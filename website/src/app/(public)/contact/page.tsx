import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getSettings, getSiteContent } from '@/lib/db'
import ContactForm from './ContactForm'
import CopyButton from '@/components/CopyButton'
import EditableBlock from '@/components/editing/EditableBlock'

export const metadata: Metadata = { title: 'Contact | Scouts Kriko-M' }

export default async function ContactPage() {
  const [settings, siteContent] = await Promise.all([
    getSettings(),
    getSiteContent(),
  ])

  const vergaderingBlock = siteContent['contact.vergaderingen'] || {}
  const vergaderingTitle = vergaderingBlock.title || 'Vergaderingen'
  const vergaderingText = vergaderingBlock.content || 'Elke zondag van 9:45 tot 12:30 op het VP-plein (Industriepark-Noord 33, Sint-Niklaas).'

  return (
    <>
      <section className="tak-hero primair hero-contact">
        <div className="container">
          <h1 className="tak-hero-title">Contact</h1>
        </div>
      </section>

      <section className="section container section--no-top">
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 40 }}>

          <div style={{ background: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', padding: 40, border: '1px solid var(--color-border)' }}>
            <h2 style={{ marginBottom: 8 }}>Stuur ons een berichtje</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 28 }}>We antwoorden normaal binnen de 2 werkdagen.</p>
            <ContactForm />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="side-card">
              <h3>Contactgegevens</h3>
              <ul className="contact-sidebar-list" style={{ marginTop: 16 }}>
                <li className="contact-sidebar-item">
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>E-mail</span>
                  <CopyButton
                    text={settings?.contact_email ?? ''}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {settings?.contact_email} <i className="fas fa-copy" style={{ fontSize: '0.85em', opacity: 0.7 }}></i>
                  </CopyButton>
                </li>
                <li className="contact-sidebar-item">
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Telefoon</span>
                  <a href={`tel:${settings?.contact_phone?.replace(/\s+/g,'')}`} style={{ fontWeight: 600 }}>{settings?.contact_phone}</a>
                </li>
                <li className="contact-sidebar-item">
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Adres</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.contact_address ?? '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600, color: 'var(--color-primary)', textAlign: 'right', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    className="address-map-link"
                  >
                    {settings?.contact_address} <i className="fa-solid fa-map-location-dot" style={{ fontSize: '0.85em', opacity: 0.7 }}></i>
                  </a>
                </li>
              </ul>
            </div>

            <Suspense fallback={null}>
              <EditableBlock
                blockKey="contact.vergaderingen"
                page="contact"
                section="vergaderingen"
                initialTitle={vergaderingTitle}
                initialContent={vergaderingText}
              >
                <div className="side-card">
                  <h3>{vergaderingTitle}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: 8, whiteSpace: 'pre-line' }}>
                    {vergaderingText}
                  </p>
                </div>
              </EditableBlock>
            </Suspense>
          </div>

        </div>
      </section>
    </>
  )
}

