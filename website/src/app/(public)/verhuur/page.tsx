import type { Metadata } from 'next'
import { getSettings, getSiteContent } from '@/lib/db'
import PhotoGallery from '@/components/PhotoGallery'
import EditableText from '@/components/editing/EditableText'
import EditableImage from '@/components/editing/EditableImage'

export const metadata: Metadata = { title: 'Verhuur lokaal | Scouts Kriko-M' }

const PHOTOS = Array.from({length: 8}, (_,i) => `/images/verhuur/lokaal-0${i+1}.jpg`)
const KAMPAS_URL = 'https://www.kampas.be/nl/domein/scouts-kriko-m-lokaal-terrein'

export default async function VerhuurPage() {
  const [settings, siteContent] = await Promise.all([
    getSettings(),
    getSiteContent(),
  ])

  const address = settings?.contact_address ?? 'Industriepark-Noord 33, 9100 Sint-Niklaas'
  const vhBlock = siteContent['verhuur.intro_title'] || siteContent['verhuur.intro'] || {}
  const vhTitle = vhBlock.title || 'Huur ons lokaal voor jouw groep'
  const vhContent = vhBlock.content || 'Ons verwarmde lokaal met ruime keuken en groot omheind terrein in Sint-Niklaas staat te huur voor groepen: ideaal voor weekends, kampen, vergaderingen en familiefeesten.'
  const heroImage = (vhBlock.image_url && vhBlock.image_url !== '/images/lokaal.jpg')
    ? vhBlock.image_url
    : '/images/verhuur/lokaal-04.jpg'

  const galleryBlock = siteContent['verhuur.gallery.photos'] || {}
  let galleryPhotos = PHOTOS
  if (galleryBlock.content) {
    try {
      const parsed = JSON.parse(galleryBlock.content)
      if (Array.isArray(parsed) && parsed.length > 0) {
        galleryPhotos = parsed
      }
    } catch {}
  }

  return (
    <>
      <section className="verhuur-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <EditableImage
          blockKey="verhuur.hero.image"
          page="verhuur"
          section="hero"
          defaultSrc={heroImage}
          alt="Scouts Kriko-M Lokaal"
          fill
          priority
          uploadType="verhuur"
          className="verhuur-hero-img"
          imageStyle={{ objectFit: 'cover', objectPosition: 'center 42%', zIndex: 1 }}
        />
        <div className="container verhuur-hero-inner" style={{ position: 'relative', zIndex: 2 }}>
          <EditableText
            blockKey="verhuur.hero.title"
            page="verhuur"
            section="hero"
            field="title"
            defaultValue="Ons lokaal"
            as="h1"
            className="verhuur-hero-title"
          />
          <a href={KAMPAS_URL} target="_blank" rel="noopener" className="btn btn-secondary verhuur-hero-btn">
            <i className="fas fa-calendar-check" style={{ marginRight: 8 }}></i>
            <EditableText
              blockKey="verhuur.hero.btn"
              page="verhuur"
              section="hero"
              defaultValue="Reserveer via KAMPAS"
            />
          </a>
        </div>
      </section>

      <section className="section container vh-page section--no-top">

        <div className="vh-intro">
          <EditableText
            blockKey="verhuur.intro.eyebrow"
            page="verhuur"
            section="intro"
            defaultValue="Verhuur lokaal &amp; terrein"
            as="span"
            className="vh-eyebrow"
          />
          <EditableText
            blockKey="verhuur.intro.title"
            page="verhuur"
            section="intro"
            field="title"
            defaultValue={vhTitle}
            as="h2"
            className="vh-intro-title"
          />
          <p className="vh-lead" style={{ whiteSpace: 'pre-line' }}>
            <EditableText
              blockKey="verhuur.intro.content"
              page="verhuur"
              section="intro"
              field="content"
              defaultValue={vhContent}
              as="span"
              multiline
            />{' '}
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

        <div className="vh-block">
          <EditableText
            blockKey="verhuur.gallery.title"
            page="verhuur"
            section="gallery"
            field="title"
            defaultValue="In beeld"
            as="h3"
            className="vh-block-title"
          />
          <PhotoGallery photos={galleryPhotos} />
        </div>

        <div className="vh-block">
          <EditableText
            blockKey="verhuur.specs.title"
            page="verhuur"
            section="specs"
            field="title"
            defaultValue="In één oogopslag"
            as="h3"
            className="vh-block-title"
          />
          <div className="vh-specs">
            {[
              {
                id: 'capaciteit',
                icon: 'fa-people-roof',
                defaultTitle: 'Capaciteit',
                defaultText: 'Tot 100 personen overdag in onze verwarmde polyvalente zaal van 165 m² — ideaal voor weekends of kampen.',
              },
              {
                id: 'slaapplaatsen',
                icon: 'fa-bed',
                defaultTitle: 'Slaapplaatsen',
                defaultText: 'Slaapruimte binnen voor 50 à 60 leden (zonder bedden) + aparte leidingsruimte tot 20 personen. Buiten plaats voor tenten.',
              },
              {
                id: 'keuken',
                icon: 'fa-utensils',
                defaultTitle: 'Keuken',
                defaultText: 'Volledig ingerichte keuken met 5 industriële gasbranders, oven, microgolf, koelkast én diepvries.',
              },
              {
                id: 'sanitair',
                icon: 'fa-shower',
                defaultTitle: 'Sanitair',
                defaultText: 'Recent vernieuwd sanitair blok uitgerust met 3 toiletten en 3 douches.',
              },
              {
                id: 'speelterrein',
                icon: 'fa-tree',
                defaultTitle: 'Speelterrein',
                defaultText: `3.500 m² omheind terrein op ${address} met verhard deel, groot grasveld en schaduwrijke bomen.`,
              },
              {
                id: 'afspraken',
                icon: 'fa-shield-halved',
                defaultTitle: 'Afspraken & Regels',
                defaultText: 'Bestemd voor jeugdverenigingen (Scouts, Chiro, etc.). Geen fuiven en geen studentenverenigingen toegelaten.',
              },
            ].map(({ id, icon, defaultTitle, defaultText }) => (
              <article key={id} className="vh-feature">
                <div className="vh-feature-icon"><i className={`fas ${icon}`}></i></div>
                <EditableText
                  blockKey={`verhuur.specs.${id}.title`}
                  page="verhuur"
                  section="specs"
                  field="title"
                  defaultValue={defaultTitle}
                  as="h3"
                />
                <EditableText
                  blockKey={`verhuur.specs.${id}.text`}
                  page="verhuur"
                  section="specs"
                  field="content"
                  defaultValue={defaultText}
                  as="p"
                  multiline
                />
              </article>
            ))}
          </div>
        </div>

      </section>
    </>
  )
}
