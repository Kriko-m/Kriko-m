import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'

export async function GET() {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.from('site_content').select('*')
    if (error) throw error

    const contentMap: Record<string, { title?: string; content?: string; image_url?: string }> = {}
    if (data) {
      for (const row of data) {
        contentMap[row.key] = {
          title: row.title || '',
          content: row.content || '',
          image_url: row.image_url || '',
        }
      }
    }
    return NextResponse.json({ success: true, content: contentMap })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fout bij ophalen site content'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { data: { user: verified }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !verified) {
      return NextResponse.json({ error: 'Sessie verlopen' }, { status: 401 })
    }

    const role = verified.app_metadata?.role || ''
    if (role !== 'admin' && role !== 'groepsleiding') {
      return NextResponse.json({ error: 'Geen rechten (enkel groepsleiding)' }, { status: 403 })
    }

    const body = await req.json()
    const { key, page, section, title, content, image_url } = body

    if (!key || !page) {
      return NextResponse.json({ error: 'Sleutel en pagina zijn verplicht' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error: upsertErr } = await admin
      .from('site_content')
      .upsert({
        key,
        page,
        section: section || 'general',
        title: title ?? null,
        content: content ?? null,
        image_url: image_url ?? null,
        updated_at: new Date().toISOString(),
        updated_by: verified.email || verified.id,
      })

    if (upsertErr) throw upsertErr

    // Cache revalidatie voor instant live updates op de publieke site
    revalidateTag('site-content', 'max')
    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true, key })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fout bij opslaan site content'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
