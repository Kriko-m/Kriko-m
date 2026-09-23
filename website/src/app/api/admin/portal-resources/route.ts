import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding, requireGroepsleiding } from '@/lib/auth'

import { PortalResource, DEFAULT_RESOURCES } from '@/lib/portal-resources'

export async function GET() {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const role = user.app_metadata?.role || ''
  const isGroepsleiding = role === 'admin' || role === 'groepsleiding'

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('portal_resources')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (!error && data && data.length > 0) {
      const filtered = isGroepsleiding
        ? (data as PortalResource[])
        : (data as PortalResource[]).filter(r => (r.category || '').toLowerCase() !== 'groeps')
      return NextResponse.json(filtered)
    }

    // Auto-seed default resources into DB if empty
    const seedItems = DEFAULT_RESOURCES.map(({ id: _id, ...rest }) => rest)
    const { data: seededData, error: seedError } = await admin
      .from('portal_resources')
      .insert(seedItems)
      .select()

    if (!seedError && seededData && seededData.length > 0) {
      const filtered = isGroepsleiding
        ? (seededData as PortalResource[])
        : (seededData as PortalResource[]).filter(r => (r.category || '').toLowerCase() !== 'groeps')
      return NextResponse.json(filtered)
    }

    const defaultFiltered = isGroepsleiding
      ? DEFAULT_RESOURCES
      : DEFAULT_RESOURCES.filter(r => (r.category || '').toLowerCase() !== 'groeps')
    return NextResponse.json(defaultFiltered)
  } catch (err) {
    console.error('Error fetching portal_resources:', err)
    const fallback = isGroepsleiding
      ? DEFAULT_RESOURCES
      : DEFAULT_RESOURCES.filter(r => (r.category || '').toLowerCase() !== 'groeps')
    return NextResponse.json(fallback)
  }
}

export async function POST(req: NextRequest) {
  const user = await requireGroepsleiding()
  if (!user) return NextResponse.json({ error: 'Enkel groepsleiding mag documenten en links beheren.' }, { status: 403 })

  try {
    const body = await req.json()
    const { type, category, label, description, url, icon, sort_order } = body

    const resourceType = type || 'document'
    if (!label) {
      return NextResponse.json({ error: 'Titel is verplicht' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('portal_resources')
      .insert({
        type: resourceType === 'quicklink' ? 'quicklink' : 'document',
        category: category?.trim() || (resourceType === 'quicklink' ? 'Snelkoppelingen' : 'Algemeen'),
        label: String(label).trim().slice(0, 200),
        description: String(description || '').trim().slice(0, 500),
        url: String(url || '').trim().slice(0, 1000),
        icon: String(icon || 'fa-solid fa-file').trim().slice(0, 100),
        sort_order: typeof sort_order === 'number' ? sort_order : 50,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting portal_resource:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error in POST portal-resources:', err)
    return NextResponse.json({ error: 'Interne fout bij aanmaken' }, { status: 500 })
  }
}
