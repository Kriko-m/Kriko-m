import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

const VALID_TYPES = ['paklijst_pdf', 'uitnodiging', 'infobrief', 'presentatie', 'overige']

// Maakt een link-bijlage aan (bv. Google Slides) — géén bestandsupload.
// Bestands-uploads lopen via /api/admin/upload (type 'kamp-bestand').
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireLeiding()
    if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

    const { id: kampId } = await params
    const body = await req.json()
    const type = String(body.type ?? '')
    const naam = String(body.naam ?? '').trim()
    const url = String(body.url ?? '').trim()

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Ongeldig bijlagetype.' }, { status: 400 })
    }
    if (!naam) {
      return NextResponse.json({ error: 'Geef de bijlage een label.' }, { status: 400 })
    }
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Geef een geldige link (begin met https://).' }, { status: 400 })
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return NextResponse.json({ error: 'Enkel http(s)-links zijn toegestaan.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('kamp_bestanden')
      .insert({ kamp_id: kampId, type, naam, url: parsed.toString(), file_name: '' })
      .select()
      .single()

    if (error) throw error

    revalidateTag('kampen', 'max')
    return NextResponse.json(data)
  } catch (err) {
    console.error('Create camp link error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Serverfout' }, { status: 500 })
  }
}
