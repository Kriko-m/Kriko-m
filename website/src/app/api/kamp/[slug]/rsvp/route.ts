import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { TAKKEN } from '@/lib/constants'

const VALID_TAKKEN = new Set<string>(TAKKEN)
const VALID_STATUS = new Set(['ja', 'nee'])

interface RsvpAntwoord {
  kind_naam?: string
  tak?: string
  status?: string
  opmerking?: string
}

// Trim + binnenste witruimte samenvouwen (display-normalisatie).
function cleanNaam(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await req.json()
    const { antwoorden, website } = body as { antwoorden?: RsvpAntwoord[]; website?: string }

    // Honeypot — bots vullen dit verborgen veld in.
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    if (!Array.isArray(antwoorden) || antwoorden.length === 0) {
      return NextResponse.json({ error: 'Vul minstens één kind in.' }, { status: 400 })
    }
    if (antwoorden.length > 10) {
      return NextResponse.json({ error: 'Te veel kinderen in één keer.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Slug → kamp. (slug is de enige toegangspoort, dus lang & ongokbaar.)
    const { data: kamp } = await admin
      .from('kampen')
      .select('id, werkjaar')
      .eq('slug', slug)
      .single()

    if (!kamp) {
      return NextResponse.json({ error: 'Kamp niet gevonden.' }, { status: 404 })
    }

    const rows: Array<{ kamp_id: string; kind_naam: string; tak: string; status: string; opmerking: string; werkjaar: string; updated_at: string }> = []
    for (const a of antwoorden) {
      const naam = cleanNaam(String(a.kind_naam ?? ''))
      const tak = String(a.tak ?? '')
      const status = String(a.status ?? '')
      const opmerking = String(a.opmerking ?? '').slice(0, 500)

      if (!naam) return NextResponse.json({ error: 'Vul voor elk kind een naam in.' }, { status: 400 })
      if (naam.length > 120) return NextResponse.json({ error: 'Een naam is te lang.' }, { status: 400 })
      if (!VALID_TAKKEN.has(tak)) return NextResponse.json({ error: 'Selecteer een geldige tak.' }, { status: 400 })
      if (!VALID_STATUS.has(status)) return NextResponse.json({ error: 'Geef ja of nee op.' }, { status: 400 })

      rows.push({ kamp_id: kamp.id, kind_naam: naam, tak, status, opmerking, werkjaar: kamp.werkjaar ?? '', updated_at: new Date().toISOString() })
    }

    // Upsert — laatste antwoord per (kamp, genormaliseerde naam, tak) wint.
    const { error } = await admin
      .from('kamp_rsvp')
      .upsert(rows, { onConflict: 'kamp_id,kind_naam_norm,tak' })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('RSVP API error:', err)
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het opnieuw.' }, { status: 500 })
  }
}
