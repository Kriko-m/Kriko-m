import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireWebshop } from '@/lib/auth'

export async function GET() {
  const user = await requireWebshop()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
