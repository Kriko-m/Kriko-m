import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export async function PATCH(req: NextRequest) {
  const user = await requireLeiding()
  if (!user) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { tak, style, customUrl } = await req.json()
  if (!tak || !style) {
    return NextResponse.json({ error: 'tak en style zijn verplicht' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch current settings
  const { data: settings, error: fetchError } = await admin
    .from('settings')
    .select('portal_backgrounds')
    .eq('id', 1)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const backgrounds = settings?.portal_backgrounds || {}
  backgrounds[tak] = { style, custom_url: customUrl || null }

  // Update settings table with new backgrounds
  const { data: updated, error: updateError } = await admin
    .from('settings')
    .update({ portal_backgrounds: backgrounds })
    .eq('id', 1)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  revalidateTag('settings', 'max')
  return NextResponse.json(updated)
}
