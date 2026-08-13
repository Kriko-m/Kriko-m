import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireGroepsleiding } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireGroepsleiding()
  if (!user) return NextResponse.json({ error: 'Enkel groepsleiding mag documenten en links bewerken.' }, { status: 403 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'ID is verplicht' }, { status: 400 })

  try {
    const body = await req.json()
    const { type, category, label, description, url, icon, sort_order } = body

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (type) updateData.type = type === 'quicklink' ? 'quicklink' : 'document'
    if (category !== undefined) updateData.category = String(category).trim()
    if (label !== undefined) updateData.label = String(label).trim().slice(0, 200)
    if (description !== undefined) updateData.description = String(description).trim().slice(0, 500)
    if (url !== undefined) updateData.url = String(url).trim().slice(0, 1000)
    if (icon !== undefined) updateData.icon = String(icon).trim().slice(0, 100)
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order)

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('portal_resources')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating portal_resource:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error in PUT portal-resources/[id]:', err)
    return NextResponse.json({ error: 'Interne fout bij bijwerken' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireGroepsleiding()
  if (!user) return NextResponse.json({ error: 'Enkel groepsleiding mag documenten en links verwijderen.' }, { status: 403 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'ID is verplicht' }, { status: 400 })

  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from('portal_resources')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting portal_resource:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in DELETE portal-resources/[id]:', err)
    return NextResponse.json({ error: 'Interne fout bij verwijderen' }, { status: 500 })
  }
}
