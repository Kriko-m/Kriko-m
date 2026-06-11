import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireGroepsleiding } from '@/lib/auth'
import { revalidateTag } from 'next/cache'
import { TAKKEN } from '@/lib/constants'
import { WerkjaarConcept } from '@/lib/types'

// Huidige staat: actief werkjaar + concept-draft.
export async function GET() {
  const user = await requireGroepsleiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const admin = createAdminClient()
  const { data } = await admin.from('settings').select('scouts_year, takken, concept').eq('id', 1).single()
  return NextResponse.json({
    actief: data?.scouts_year ?? '',
    takken: data?.takken ?? {},
    concept: data?.concept ?? {},
  })
}

function isValidConcept(c: unknown): c is WerkjaarConcept {
  if (!c || typeof c !== 'object') return false
  const obj = c as Record<string, unknown>
  if (typeof obj.werkjaar !== 'string' || !obj.leiding || typeof obj.leiding !== 'object') return false
  return true
}

// Concept-draft opslaan (nog niet live).
export async function PUT(req: NextRequest) {
  const user = await requireGroepsleiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = await req.json()
  if (!isValidConcept(body)) return NextResponse.json({ error: 'Ongeldig concept' }, { status: 400 })

  // Normaliseer: enkel geldige takken, naam/rol als strings.
  const leiding: Record<string, { naam: string; rol: string }[]> = {}
  for (const tak of TAKKEN) {
    const rows = Array.isArray(body.leiding[tak]) ? body.leiding[tak] : []
    leiding[tak] = rows
      .map((r: { naam?: unknown; rol?: unknown }) => ({ naam: String(r.naam ?? '').trim().slice(0, 120), rol: String(r.rol ?? '').trim().slice(0, 80) }))
      .filter((r: { naam: string }) => r.naam !== '')
  }
  const concept: WerkjaarConcept = { werkjaar: body.werkjaar.trim().slice(0, 20), leiding }

  const admin = createAdminClient()
  const { error } = await admin.from('settings').update({ concept }).eq('id', 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag('settings', 'max')
  return NextResponse.json({ ok: true, concept })
}

// Publiceren: snapshot het aflopende jaar, zet het nieuwe jaar live.
// Niet-destructief: bestaande jaargebonden rijen behouden hun werkjaar.
export async function POST() {
  const user = await requireGroepsleiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const admin = createAdminClient()
  const { data: settings } = await admin.from('settings').select('scouts_year, takken, concept').eq('id', 1).single()
  if (!settings) return NextResponse.json({ error: 'Instellingen niet gevonden' }, { status: 500 })

  const concept = settings.concept as WerkjaarConcept | Record<string, never>
  if (!isValidConcept(concept) || !concept.werkjaar) {
    return NextResponse.json({ error: 'Er is nog geen concept-werkjaar klaargezet.' }, { status: 400 })
  }

  const oudWerkjaar: string = settings.scouts_year
  const takken = (settings.takken ?? {}) as Record<string, { leaders?: { name: string; role: string }[]; [k: string]: unknown }>

  // 1. Snapshot van wie welke tak had dit (aflopende) jaar.
  const snapshotRows: { werkjaar: string; tak: string; naam: string; rol: string }[] = []
  for (const tak of TAKKEN) {
    for (const leader of takken[tak]?.leaders ?? []) {
      if (leader?.name) snapshotRows.push({ werkjaar: oudWerkjaar, tak, naam: leader.name, rol: leader.role ?? '' })
    }
  }
  if (snapshotRows.length > 0) {
    // Voorkom dubbele snapshots als er per ongeluk twee keer gepubliceerd wordt.
    await admin.from('werkjaar_leiding').delete().eq('werkjaar', oudWerkjaar)
    const { error: snapErr } = await admin.from('werkjaar_leiding').insert(snapshotRows)
    if (snapErr) return NextResponse.json({ error: snapErr.message }, { status: 500 })
  }

  // 2. Pas de leiding→tak van het concept toe op de live takken-config.
  const nieuweTakken = { ...takken }
  for (const tak of TAKKEN) {
    const leiders = (concept.leiding[tak] ?? []).map(l => ({ name: l.naam, role: l.rol }))
    nieuweTakken[tak] = { ...(takken[tak] ?? {}), leaders: leiders }
  }

  // 3. Flip de live pointer + leeg het concept.
  const { error: updErr } = await admin
    .from('settings')
    .update({ scouts_year: concept.werkjaar, takken: nieuweTakken, concept: {} })
    .eq('id', 1)
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  revalidateTag('settings', 'max')
  return NextResponse.json({ ok: true, nieuwWerkjaar: concept.werkjaar })
}
