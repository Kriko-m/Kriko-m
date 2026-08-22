import type { Metadata } from 'next'
import { getSettings } from '@/lib/db'
import InschrijvenClient from './InschrijvenClient'

export const metadata: Metadata = {
  title: 'Inschrijven',
  description: 'Schrijf je in bij Kriko-m. Informatie en stappenplan voor nieuwe en bestaande leden.',
}

export default async function InschrijvenPage() {
  const settings = await getSettings()

  const email = settings?.contact_email ?? 'groepsleiding@kriko-m.be'
  const year = settings?.scouts_year ?? '2026-2027'

  return (
    <>
      {/* Hero Banner */}
      <section className="tak-hero primair hero-inschrijven">
        <div className="container">
          <h1 className="tak-hero-title">Inschrijven</h1>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="section container section--no-top">
        <InschrijvenClient email={email} year={year} />
      </section>
    </>
  )
}
