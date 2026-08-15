import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isGroepsleiding: false })
    }

    const role = user.app_metadata?.role || ''
    const isGroepsleiding = role === 'admin' || role === 'groepsleiding'

    return NextResponse.json({ isGroepsleiding })
  } catch {
    return NextResponse.json({ isGroepsleiding: false })
  }
}
