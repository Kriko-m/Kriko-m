import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding, requireGroepsleiding } from '@/lib/auth'
import { getActiveWerkjaar } from '@/lib/db'
import { sanitizeKampAudience } from '@/lib/kamp'
import { revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = await req.json()

  // Tags valideren; 'groep'/'leiding' enkel voor groepsleiding.
  const { audience, needsGroepsleiding } = sanitizeKampAudience(body.audience)
  if (audience.length === 0) {
    return NextResponse.json({ error: 'Selecteer minstens één tag.' }, { status: 400 })
  }
  if (needsGroepsleiding && !(await requireGroepsleiding())) {
    return NextResponse.json({ error: 'Enkel groepsleiding mag de tags ‘groep’ of ‘leiding’ gebruiken.' }, { status: 403 })
  }

  const werkjaar = await getActiveWerkjaar()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('kampen')
    .insert({
      naam: body.naam,
      audience,
      datum_van: body.datum_van,
      datum_tot: body.datum_tot,
      locatie: body.locatie || '',
      beschrijving: body.beschrijving || '',
      prijs: body.prijs ?? 0,
      contact_info: body.contact_info || '',
      aangemaakt_door: user.id,
      werkjaar,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag('kampen', 'max')
  return NextResponse.json(data)
}
