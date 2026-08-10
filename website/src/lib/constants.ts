// Gedeelde constanten — voorheen verspreid over meerdere bestanden.

export const TAKKEN = ['kapoenen', 'welpen', 'jonggivers', 'givers'] as const
export type Tak = (typeof TAKKEN)[number]

// Inclusief 'alle' voor kampen/verslagen die over de hele groep gaan.
export const TAKKEN_MET_ALLE = [...TAKKEN, 'alle'] as const

// Tabs in het leiding-portaal (volgorde = sidebar-volgorde).
// De 4 leeftijdstakken + 'groepsleiding' (beheerstak, enkel zichtbaar voor rol
// groepsleiding). "Evenementen" is GEEN tak — het is een kalender-tag (zie
// AUDIENCE_TAGS, label "Groep").
export const PORTAAL_TAKKEN = ['kapoenen', 'welpen', 'jonggivers', 'givers', 'groepsleiding'] as const
export type PortaalTak = (typeof PORTAAL_TAKKEN)[number]

// Tabs die enkel zichtbaar zijn voor rol groepsleiding.
export const GROEPSLEIDING_ONLY_TAKKEN = ['groepsleiding'] as const

export const TAK_NAMEN: Record<string, string> = {
  kapoenen: 'Kapoenen',
  welpen: 'Welpen',
  jonggivers: 'Jonggivers',
  givers: 'Givers',
  groepsleiding: 'Groepsleiding',
  alle: 'Alle takken',
}

// Leeftijdslabels voor dropdowns.
export const TAK_LABELS: Record<string, string> = {
  kapoenen: 'Kapoenen (6–8j)',
  welpen: 'Welpen (8–11j)',
  jonggivers: 'Jonggivers (11–14j)',
  givers: 'Givers (14–17j)',
}

export const TAK_KLEUREN: Record<string, string> = {
  kapoenen: '#F4C842',
  welpen: '#5D9E6C',
  jonggivers: '#E07B1A',
  givers: '#1A3FB5',
  groepsleiding: '#650B19', // bordeaux
  alle: '#1A3D2A',
}

// Audience-tags voor kalender én kampen (wie de activiteit betreft).
// 'groep' = de enige tag die iets publiek op de website-kalender zet (enkel
// groepsleiding mag hem toekennen).
export const AUDIENCE_TAGS = ['leiding', 'kapoenen', 'welpen', 'jonggivers', 'givers', 'groep'] as const
export type AudienceTagConst = (typeof AUDIENCE_TAGS)[number]

export const AUDIENCE_NAMEN: Record<string, string> = {
  leiding: 'Leiding',
  kapoenen: 'Kapoenen',
  welpen: 'Welpen',
  jonggivers: 'Jonggivers',
  givers: 'Givers',
  groep: 'Groep',
}

// Kleuren per audience-tag (hergebruikt TAK_KLEUREN + leiding/groep).
export const AUDIENCE_KLEUREN: Record<string, string> = {
  ...TAK_KLEUREN,
  leiding: '#650B19', // bordeaux
  groep: '#C9963A',   // goud
}

export const MAANDEN = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

// Productie-URL — fallback wanneer leiding lokaal test, zodat gekopieerde
// uitnodigingslinks nooit naar localhost wijzen.
export const SITE_URL = 'https://kriko-m-indol.vercel.app'

// Origin voor publiek deelbare links (RSVP-uitnodigingen e.d.).
export function publicOrigin(): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) return SITE_URL
  return origin
}
