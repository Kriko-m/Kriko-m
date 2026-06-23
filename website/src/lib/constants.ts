// Gedeelde constanten — voorheen verspreid over meerdere bestanden.

export const TAKKEN = ['kapoenen', 'welpen', 'jonggivers', 'givers'] as const
export type Tak = (typeof TAKKEN)[number]

// Inclusief 'alle' voor kampen/verslagen die over de hele groep gaan.
export const TAKKEN_MET_ALLE = [...TAKKEN, 'alle'] as const

// Tabs in het leiding-portaal (volgorde = sidebar-volgorde).
// - 'evenementen' = overkoepelende/publieke acties (leesbaar voor alle leiding,
//   enkel bewerkbaar door rol groepsleiding).
// - 'groepsleiding' = beheerstak, enkel zichtbaar voor rol groepsleiding.
export const PORTAAL_TAKKEN = ['evenementen', 'kapoenen', 'welpen', 'jonggivers', 'givers', 'groepsleiding'] as const
export type PortaalTak = (typeof PORTAAL_TAKKEN)[number]

// Tabs die enkel met rol groepsleiding relevant zijn (UI-gating).
// 'evenementen' = zichtbaar voor allen, bewerken enkel GL.
// 'groepsleiding' = enkel zichtbaar voor GL.
export const GROEPSLEIDING_ONLY_TAKKEN = ['groepsleiding'] as const
export const GROEPSLEIDING_EDIT_TAKKEN = ['evenementen', 'groepsleiding'] as const

export const TAK_NAMEN: Record<string, string> = {
  evenementen: 'Evenementen',
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
  evenementen: '#C9963A', // goud
  kapoenen: '#F4C842',
  welpen: '#5D9E6C',
  jonggivers: '#E07B1A',
  givers: '#1A3FB5',
  groepsleiding: '#650B19', // bordeaux
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
  ouders: 'Groep',
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
