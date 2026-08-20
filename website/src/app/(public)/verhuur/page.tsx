import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getSettings, getSiteContent } from '@/lib/db'
import PhotoGallery from '@/components/PhotoGallery'
import EditableBlock from '@/components/editing/EditableBlock'

export const metadata: Metadata = { title: 'Verhuur lokaal | Scouts Kriko-M' }

const PHOTOS = Array.from({length: 8}, (_,i) => `/images/verhuur/lokaal-0${i+1}.jpg`)
const KAMPAS_URL = 'https://www.kampas.be/nl/domein/scouts-kriko-m-lokaal-terrein'

export default async function VerhuurPage() {
  const [settings, siteContent] = await Promise.all([
    getSettings(),
    getSiteContent(),
  ])

  const address = settings?.contact_address ?? 'Industriepark-Noord 33, 9100 Sint-Niklaas'
  const vhBlock = siteContent['verhuur.intro_title'] || {}
  const vhTitle = vhBlock.title || 'Huur ons lokaal voor jouw groep'
  const vhContent = vhBlock.content || 'Ons verwarmde lokaal met ruime keuken en groot omheind terrein in Sint-Niklaas staat te huur voor groepen: ideaal voor weekends, kampen, vergaderingen en familiefeesten.'
  const heroImage = (vhBlock.image_url && vhBlock.image_url !== '/images/lokaal.jpg')
    ? vhBlock.image_url
    : '/images/verhuur/lokaal-04.jpg'

  return (
    <>
      <section className="verhuur-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <Image
          src={heroImage}
          alt="Scouts Kriko-M Lokaal"
          className="verhuur-hero-img"
          fill
          priority
          unoptimized
          style={{ objectFit: 'cover', objectPosition: 'center 42%', zIndex: 1 }}
        />
        <div className="container verhuur-hero-inner" style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="verhuur-hero-title">Ons lokaal</h1>
          <a href={KAMPAS_URL} target="_blank" rel="noopener" className="btn btn-secondary verhuur-hero-btn">
            <i className="fas fa-calendar-check" style={{ marginRight: 8 }}></i>Reserveer via KAMPAS
          </a>
        </div>
      </section>

      <section className="section container vh-page section--no-top">

        <Suspense fallback={null}>
          <EditableBlock
            blockKey="verhuur.intro_title"
            page="verhuur"
            section="hero"
            blockType="text_image"
            initialTitle={vhTitle}
            initialContent={vhContent}
            initialImageUrl={heroImage}
          >
            <div className="vh-intro">
              <span className="vh-eyebrow">Verhuur lokaal &amp; terrein</span>
              <h2 className="vh-intro-title">{vhTitle}</h2>
              <p className="vh-lead" style={{ whiteSpace: 'pre-line' }}>
                {vhContent}{' '}
                Bekijk de beschikbaarheid en boek meteen online via{' '}
                <a
                  href={KAMPAS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 700 }}
                >
                  <strong>KAMPAS</strong>
                </a>
                .
              </p>
            </div>
          </EditableBlock>
        </Suspense>

        <div className="vh-block">
          <h3 className="vh-block-title">In beeld</h3>
          <PhotoGallery photos={PHOTOS} />
        </div>

        <div className="vh-block">
          <h3 className="vh-block-title">In één oogopslag</h3>
          <div className="vh-specs">
            {[
              {
                icon: 'fa-people-roof',
                title: 'Capaciteit',
                text: 'Tot 100 personen overdag in onze verwarmde polyvalente zaal van 165 m² — ideaal voor weekends of kampen.',
              },
              {
                icon: 'fa-bed',
                title: 'Slaapplaatsen',
                text: 'Slaapruimte binnen voor 50 à 60 leden (zonder bedden) + aparte leidingsruimte tot 20 personen. Buiten plaats voor tenten.',
              },
              {
                icon: 'fa-utensils',
                title: 'Keuken',
                text: 'Volledig ingerichte keuken met 5 industriële gasbranders, oven, microgolf, koelkast én diepvries.',
              },
              {
                icon: 'fa-shower',
                title: 'Sanitair',
                text: 'Recent vernieuwd sanitair blok uitgerust met 3 toiletten en 3 douches.',
              },
              {
                icon: 'fa-tree',
                title: 'Speelterrein',
                text: `3.500 m² omheind terrein op ${address} met verhard deel, groot grasveld en schaduwrijke bomen.`,
              },
              {
                icon: 'fa-shield-halved',
                title: 'Afspraken & Regels',
                text: 'Bestemd voor jeugdverenigingen (Scouts, Chiro, etc.). Geen fuiven en geen studentenverenigingen toegelaten.',
              },
            ].map(({ icon, title, text }) => (
              <article key={title} className="vh-feature">
                <div className="vh-feature-icon"><i className={`fas ${icon}`}></i></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>

      </section>
    </>
  )
}

