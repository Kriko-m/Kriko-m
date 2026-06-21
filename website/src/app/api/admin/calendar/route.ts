import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding, requireGroepsleiding } from '@/lib/auth'
import { getActiveWerkjaar } from '@/lib/db'
import { AUDIENCE_TAGS } from '@/lib/constants'
import { revalidateTag } from 'next/cache'

const VALID_AUDIENCE = new Set<string>(AUDIENCE_TAGS)

// Schoont en valideert de audience-tags en past de rechten toe. Enkel
// groepsleiding mag publiceren naar 'ouders' (publiek) of evenementen aanmaken.
function sanitizeAudience(raw: unknown, isEvenement: boolean, isGroepsleiding: boolean) {
  let audience = Array.isArray(raw) ? raw.filter(a => VALID_AUDIENCE.has(a)) : []
  let evenement = !!isEvenement
  if (!isGroepsleiding) {
    audience = audience.filter(a => a !== 'ouders') // gewone leiding mag niet publiek publiceren
    evenement = false
  }
  // Dedupe
  audience = [...new Set(audience)]
  return { audience, evenement }
}

export async function POST(req: NextRequest) {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = await req.json()
  const wantsPublic = Array.isArray(body.audience) && body.audience.includes('ouders')
  const wantsEvenement = !!body.is_evenement

  // Publiek publiceren of evenement aanmaken = enkel groepsleiding.
  let isGroepsleiding = false
  if (wantsPublic || wantsEvenement) {
    const gl = await requireGroepsleiding()
    if (!gl) return NextResponse.json({ error: 'Enkel groepsleiding kan publiceren naar de oudercalender of evenementen aanmaken.' }, { status: 403 })
    isGroepsleiding = true
  }

  const { audience, evenement } = sanitizeAudience(body.audience, wantsEvenement, isGroepsleiding)

  const werkjaar = await getActiveWerkjaar()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('calendar')
    .insert({
      title: body.title,
      date: body.date,
      time: body.time || '',
      location: body.location || '',
      description: body.description || '',
      audience,
      is_evenement: evenement,
      cover_image: evenement ? (body.cover_image || '') : '',
      document_url: evenement ? (body.document_url || '') : '',
      werkjaar,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag('calendar', 'max')
  return NextResponse.json(data)
}
