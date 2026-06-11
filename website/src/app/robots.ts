import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kriko-m.be'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Privélinks, portaal en checkout horen niet in de index.
      disallow: ['/portaal', '/kamp/', '/api/', '/shop/checkout', '/shop/bevestiging'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
