import { notFound } from 'next/navigation'
import { getSettings, getEchos, getSiteContent } from '@/lib/db'
import type { Metadata } from 'next'
import { Echo, Leader } from '@/lib/types'
import TakPageClient from './TakPageClient'

const TAK_DARK: Record<string, string> = {
  kapoenen:   '#d4780a',
  welpen:     '#1a5216',
  jonggivers: '#8a3200',
  givers:     '#153666',
}

const VALID_TAKKEN = ['kapoenen', 'welpen', 'jonggivers', 'givers']

export async function generateStaticParams() {
  return VALID_TAKKEN.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!VALID_TAKKEN.includes(slug)) return {}
  const settings = await getSettings()
  const tak = settings?.takken?.[slug]
  return { title: `${tak?.name ?? slug} | Scouts Kriko-M` }
}

export default async function TakPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!VALID_TAKKEN.includes(slug)) notFound()

  const [settings, allEchos, siteContent] = await Promise.all([
    getSettings(),
    getEchos(),
    getSiteContent(),
  ])

  const tak = settings?.takken?.[slug] ?? {}
  const dbLeaders: Leader[] = tak.leaders ?? []
  const leadersToDisplay: Leader[] = dbLeaders
  const takPhotoSrc = tak.photo && tak.photo.trim() !== '' ? tak.photo : null

  // 2 meest recente echos voor deze tak
  const now = new Date()
  const curM = now.getMonth() + 1, curY = now.getFullYear()
  const nxtM = curM === 12 ? 1 : curM + 1, nxtY = curM === 12 ? curY + 1 : curY

  const recentEchos = (allEchos as Echo[])
    .filter((e: Echo) => e.tak === slug && (
      (e.month === curM && e.year === curY) ||
      (e.month === nxtM && e.year === nxtY)
    ))
    .slice(0, 2)

  const dark = TAK_DARK[slug] ?? '#3a0a14'

  return (
    <TakPageClient
      slug={slug}
      takName={tak.name || slug}
      takDescription={tak.description || ''}
      takEmail={tak.email || `${slug}@kriko-m.be`}
      takWhatsapp={tak.whatsapp_url || ''}
      takPhotoSrc={takPhotoSrc}
      leadersToDisplay={leadersToDisplay}
      recentEchos={recentEchos}
      dark={dark}
      siteContent={siteContent}
    />
  )
}
