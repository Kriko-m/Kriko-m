// Gedeelde kamp-helpers: paklijst-parsing, sjablonen en bijlage-metadata.
// Gebruikt door zowel het leidingbeheer als de publieke kamppagina.

import type { KampBestand } from '@/lib/types'

export type PaklijstCategorie = { categorie: string; items: string[] }

// ── Kamp-tags (audience) ────────────────────────────────────
// Geldige tags voor een kamp (zelfde vocab als de kalender). 'groep' en
// 'leiding' zijn voorbehouden aan groepsleiding.
export const KAMP_TAGS = ['leiding', 'kapoenen', 'welpen', 'jonggivers', 'givers', 'groep'] as const
export const KAMP_AGE_TAKKEN = ['kapoenen', 'welpen', 'jonggivers', 'givers'] as const
const GL_ONLY_KAMP_TAGS = new Set<string>(['groep', 'leiding'])

// Schoont de aangeleverde tags en bepaalt of groepsleiding-rechten nodig zijn.
export function sanitizeKampAudience(raw: unknown): { audience: string[]; needsGroepsleiding: boolean } {
  const valid = new Set<string>(KAMP_TAGS)
  const audience = Array.isArray(raw)
    ? [...new Set(raw.filter((a: unknown): a is string => typeof a === 'string' && valid.has(a)))]
    : []
  const needsGroepsleiding = audience.some(a => GL_ONLY_KAMP_TAGS.has(a))
  return { audience, needsGroepsleiding }
}

// Eerste leeftijdstak uit de tags (voor kleur/sjabloon/deeplink); valt terug op 'groep'.
export function kampPrimaryTak(audience: string[] | undefined | null): string {
  const list = audience ?? []
  return (KAMP_AGE_TAKKEN as readonly string[]).find(t => list.includes(t)) ?? 'groep'
}

// True als alle vier de leeftijdstakken aanwezig zijn.
export function kampIsHeleGroep(audience: string[] | undefined | null): boolean {
  const list = audience ?? []
  return (KAMP_AGE_TAKKEN as readonly string[]).every(t => list.includes(t))
}

// Paklijst-sjabloonsleutel: hele groep → 'groep', anders de eerste tak.
export function kampPaklijstTemplateKey(audience: string[] | undefined | null): string {
  return kampIsHeleGroep(audience) ? 'groep' : kampPrimaryTak(audience)
}

// Tekst → gestructureerde paklijst. Formaat per regel: "Categorie: item1, item2".
export function parsePackingList(text: string): PaklijstCategorie[] {
  if (!text) return []
  return text.split('\n')
    .map(line => {
      const parts = line.split(':')
      if (parts.length < 2) return null
      const categorie = parts[0].trim()
      const items = parts.slice(1).join(':').split(',').map(i => i.trim()).filter(Boolean)
      if (!categorie || items.length === 0) return null
      return { categorie, items }
    })
    .filter(Boolean) as PaklijstCategorie[]
}

// Gestructureerde paklijst → bewerkbare tekst.
export function formatPackingList(list: PaklijstCategorie[] | unknown): string {
  if (!Array.isArray(list)) return ''
  return list.map((item: PaklijstCategorie) => `${item.categorie}: ${item.items.join(', ')}`).join('\n')
}

export const PAKLIJST_TEMPLATES: Record<string, string> = {
  kapoenen: `Slapen: Slaapzak, Laken, Matrashoes, Pyjama, Knuffel (onmisbaar!)
Kleding: Speelkleren (vuil worden mag), Dikke trui, Regenjas, Ondergoed, Kousen, Stevige stapschoenen, Reserve schoenen
Toilet: Handdoek, Washandje, Tandenborstel, Tandpasta, Zeep, Kam/Borstel
Diversen: Drinkbus (vooraf gevuld), Kleine rugzak (voor dagtocht), Groepsdas`,
  welpen: `Slapen: Slaapzak, Luchtbed of veldbed, Pyjama, Knuffel
Kleding: Scoutshemd & das, T-shirts (voldoende), Korte & lange broeken, Warme truien, Regenjas, Ondergoed, Kousen, Stevige wandelschoenen, Speelschoenen
Toilet: Handdoeken, Washandjes, Tandenborstel, Tandpasta, Biologisch afbreekbare zeep & shampoo
Diversen: Drinkbus, Zaklamp, Kleine rugzak, Gamelle (eetgerei in stoffen zak)`,
  jonggivers: `Slapen: Slaapzak (warm), Matje of luchtbed, Pyjama
Kleding: Scoutshemd & das, T-shirts, Korte & lange broeken, Warme trui, Regenjas & regenbroek, Ondergoed, Kousen (voldoende), Stevige wandelschoenen (ingelopen)
Toilet: Handdoek, Tandenborstel, Tandpasta, Biologisch afbreekbare zeep
Diversen: Drinkbus (min. 1L), Zaklamp/Hoofdlamp, Kleine rugzak (20-30L), Gamelle (eetgerei in stoffen zak), Zakmes`,
  givers: `Slapen: Slaapzak (warm), Matje of luchtbed, Pyjama
Kleding: Scoutshemd & das, T-shirts, Korte & lange broeken, Warme trui, Regenjas & regenbroek, Ondergoed, Kousen (voldoende), Stevige wandelschoenen (ingelopen)
Toilet: Handdoek, Tandenborstel, Tandpasta, Biologisch afbreekbare zeep
Diversen: Drinkbus (min. 1L), Zaklamp/Hoofdlamp, Kleine rugzak (20-30L), Gamelle (eetgerei in stoffen zak), Zakmes`,
  groep: `Slapen: Slaapzak, Luchtbed, Pyjama
Kleding: Scoutshemd & das, T-shirts, Broek, Regenjas, Warme trui, Sokken, Ondergoed, Wandelschoenen
Toilet: Handdoek, Washandje, Tandenborstel, Tandpasta, Zeep
Diversen: Drinkbus, Zaklamp, Bord/Beker/Bestek`,
}

// Bijlagetypes: label + emoji. Volgorde = weergavevolgorde op de kamppagina.
export const BESTAND_TYPES = ['uitnodiging', 'presentatie', 'paklijst_pdf', 'infobrief', 'overige'] as const
export type BestandType = (typeof BESTAND_TYPES)[number]

export const BESTAND_LABELS: Record<string, string> = {
  uitnodiging: '📬 Uitnodiging',
  presentatie: '📊 Presentatie',
  paklijst_pdf: '🎒 Paklijst',
  infobrief: '📋 Infobrief',
  overige: '📎 Bijlage',
}

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kamp-bestanden`

// Publieke URL voor een bijlage: externe link (url) of opgeslagen bestand.
export function bestandHref(b: KampBestand): string {
  if (b.url) return b.url
  return `${STORAGE_BASE}/${b.file_name}`
}

// Zet een Google Slides "edit/view"-link om naar een embed-link. Niet-Slides
// links worden ongewijzigd teruggegeven.
export function googleSlidesEmbed(url: string): string | null {
  const m = url.match(/^https:\/\/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/)
  if (!m) return null
  return `https://docs.google.com/presentation/d/${m[1]}/embed`
}
