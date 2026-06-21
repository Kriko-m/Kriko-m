// Gedeelde constanten — voorheen verspreid over meerdere bestanden.

export const TAKKEN = ['kapoenen', 'welpen', 'jonggivers', 'givers'] as const
export type Tak = (typeof TAKKEN)[number]

// Inclusief 'alle' voor kampen/verslagen die over de hele groep gaan.
export const TAKKEN_MET_ALLE = [...TAKKEN, 'alle'] as const

export const TAK_NAMEN: Record<string, string> = {
  kapoenen: 'Kapoenen',
  welpen: 'Welpen',
  jonggivers: 'Jonggivers',
  givers: 'Givers',
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
  alle: '#1A3D2A',
}

// Audience-tags voor de kalender (wie het event betreft). 'ouders' = publiek.
export const AUDIENCE_TAGS = ['leiding', 'kapoenen', 'welpen', 'jonggivers', 'givers', 'ouders'] as const
export type AudienceTagConst = (typeof AUDIENCE_TAGS)[number]

export const AUDIENCE_NAMEN: Record<string, string> = {
  leiding: 'Leiding',
  kapoenen: 'Kapoenen',
  welpen: 'Welpen',
  jonggivers: 'Jonggivers',
  givers: 'Givers',
  ouders: 'Ouders',
}

// Kleuren per audience-tag (hergebruikt TAK_KLEUREN + leiding/ouders).
export const AUDIENCE_KLEUREN: Record<string, string> = {
  ...TAK_KLEUREN,
  leiding: '#650B19', // bordeaux
  ouders: '#C9963A',  // goud
}

export const MAANDEN = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]
