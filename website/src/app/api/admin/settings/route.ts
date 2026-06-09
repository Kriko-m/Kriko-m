import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { revalidateTag } from 'next/cache'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const role = user.app_metadata?.role
  if (role !== 'admin' && role !== 'groepsleiding') return null
  return user
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = await req.json()
  const allowed = ['scouts_year', 'bank_iban', 'bank_bic', 'bank_holder', 'contact_email', 'contact_phone', 'contact_address', 'alert_message', 'alert_active']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      update[key] = key === 'alert_active' ? body[key] === 'true' || body[key] === true : String(body[key]).slice(0, 500)
    }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.from('settings').update(update).eq('id', 1).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  revalidateTag('settings', 'max')
  return NextResponse.json(data)
}
