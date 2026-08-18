import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding, requireGroepsleiding } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireLeiding()
    if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

    const { id } = await params
    const admin = createAdminClient()

    // Eerst bestandsnaam ophalen voor opslagverwijdering
    const { data: echo } = await admin
      .from('echos')
      .select('file_name')
      .eq('id', id)
      .single()

    if (echo?.file_name) {
      await admin.storage.from('echos').remove([echo.file_name])
    }

    const { error } = await admin.from('echos').delete().eq('id', id)
    if (error) throw error

    revalidateTag('echos', 'max')
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Delete Echo error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Serverfout bij verwijderen' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireGroepsleiding()
    if (!user) return NextResponse.json({ error: 'Enkel groepsleiding mag echo\'s goedkeuren' }, { status: 403 })

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const approved = typeof body.approved === 'boolean' ? body.approved : true

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('echos')
      .update({ approved })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidateTag('echos', 'max')
    return NextResponse.json(data)
  } catch (err) {
    console.error('Approve Echo error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Serverfout bij goedkeuren' }, { status: 500 })
  }
}

