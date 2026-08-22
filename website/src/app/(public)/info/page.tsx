import type { Metadata } from 'next'
import { getSettings, getSiteContent } from '@/lib/db'
import InfoTabbedContent from './InfoTabbedContent'

export const metadata: Metadata = { title: 'Algemene Info' }

export default async function InfoPage() {
  const [settings, siteContent] = await Promise.all([
    getSettings(),
    getSiteContent(),
  ])

  const email = settings?.contact_email ?? 'groepsleiding@kriko-m.be'
  const address = settings?.contact_address ?? 'Industriepark-Noord 33, 9100 Sint-Niklaas'

  return (
    <>
      <section className="tak-hero primair hero-info">
        <div className="container">
          <h1 className="tak-hero-title">Algemene Info</h1>
        </div>
      </section>

      <section className="section container section--no-top">
        <InfoTabbedContent email={email} address={address} siteContent={siteContent} />
      </section>
    </>
  )
}


