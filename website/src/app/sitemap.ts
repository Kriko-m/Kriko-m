import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kriko-m.be'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/takken',
    '/takken/kapoenen',
    '/takken/welpen',
    '/takken/jonggivers',
    '/takken/givers',
    '/echos',
    '/kalender',
    '/verhuur',
    '/inschrijven',
    '/shop',
    '/archief',
    '/contact',
    '/privacy',
    '/voorwaarden',
  ]
  const now = new Date()
  return routes.map(path => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
}
