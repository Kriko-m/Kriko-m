import type { Metadata } from 'next'
import Image from 'next/image'
import { getSettings } from '@/lib/db'
import PhotoGallery from '@/components/PhotoGallery'

export const metadata: Metadata = { title: 'Verhuur lokaal | Scouts Kriko-M' }

const PHOTOS = Array.from({length: 8}, (_,i) => `/images/verhuur/lokaal-0${i+1}.jpg`)
const KAMPAS_URL = 'https://www.kampas.be/nl/domein/scouts-kriko-m-lokaal-terrein'

export default async function VerhuurPage() {
  const settings = await getSettings()
  const address = settings?.contact_address ?? 'Industriepark-Noord 33, 9100 Sint-Niklaas'

  return (
    <>
      <section className="verhuur-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <Image
          src="/images/verhuur/lokaal-04.jpg"
          alt="Scouts Kriko-M Lokaal"
          fill
          unoptimized={true}
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 42%', zIndex: 1 }}
          className="verhuur-hero-img"
        />
        <div className="container verhuur-hero-inner" style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="verhuur-hero-title">Ons lokaal</h1>
          <a href={KAMPAS_URL} target="_blank" rel="noopener" className="btn btn-primary verhuur-hero-btn">
            <i className="fas fa-calendar-check" style={{ marginRight: 8 }}></i>Reserveer via KAMPAS
          </a>
        </div>
      </section>

      <section className="section container vh-page">

        <div className="vh-intro">
          <span className="vh-eyebrow">Verhuur lokaal &amp; terrein</span>
          <h2 className="vh-intro-title">Huur ons lokaal voor jouw groep</h2>
          <p className="vh-lead">
            Ons verwarmde lokaal met ruime keuken en groot omheind terrein in Sint-Niklaas staat te huur voor groepen:
            ideaal voor weekends, kampen, vergaderingen en familiefeesten. Bekijk de beschikbaarheid en boek meteen
            online via <strong>KAMPAS</strong>.
          </p>
        </div>

        <div className="vh-block">
          <h3 className="vh-block-title">In beeld</h3>
          <PhotoGallery photos={PHOTOS} />
        </div>

        <div className="vh-block">
          <h3 className="vh-block-title">In één oogopslag</h3>
          <div className="vh-specs">
            {[
              { icon: 'fa-people-roof', title: 'Capaciteit', text: 'Tot 100 gasten overdag in onze verwarmde polyvalente zaal van 165 m² — eten, spelen of vergaderen.' },
              { icon: 'fa-location-dot', title: 'Locatie', text: `${address}, met 3.500 m² volledig omheind terrein om te ravotten.` },
              { icon: 'fa-utensils', title: 'Keuken', text: 'Volledig uitgerust: vijf industriële gasbranders, oven, microgolf, koelkast én diepvries.' },
              { icon: 'fa-bed', title: 'Slaapplaatsen', text: "'s Nachts slaapplaats voor 50 à 60 personen, met een aparte leidingsruimte erbij." },
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
