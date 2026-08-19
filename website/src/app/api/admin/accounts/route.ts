import { NextResponse } from 'next/server'
import { requireGroepsleiding } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'

export async function GET() {
  const user = await requireGroepsleiding()
  if (!user) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  try {
    const admin = createAdminClient()
    const { data: usersData, error } = await admin.auth.admin.listUsers()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const users = usersData?.users || []

    const leiding = users.find(u => u.app_metadata?.role === 'leiding' || u.email === 'leiding@kriko-m.be')
    const groepsleiding = users.find(u => u.app_metadata?.role === 'groepsleiding' || u.app_metadata?.role === 'admin' || u.email === 'groepsleiding@kriko-m.be')
    const webshop = users.find(u => u.app_metadata?.role === 'webshop' || u.email === 'webshop@kriko-m.be')

    return NextResponse.json({
      accounts: [
        {
          id: leiding?.id || null,
          role: 'leiding',
          email: leiding?.email || 'leiding@kriko-m.be',
          naam: leiding?.user_metadata?.naam || 'Leiding',
        },
        {
          id: groepsleiding?.id || null,
          role: 'groepsleiding',
          email: groepsleiding?.email || 'groepsleiding@kriko-m.be',
          naam: groepsleiding?.user_metadata?.naam || 'Groepsleiding',
        },
        {
          id: webshop?.id || null,
          role: 'webshop',
          email: webshop?.email || 'webshop@kriko-m.be',
          naam: webshop?.user_metadata?.naam || 'Webshop & uniformen',
        },
      ]
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error)?.message || 'Server fout' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const currentUser = await requireGroepsleiding()
  if (!currentUser) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { role, newName, newPassword } = body

    if (!role || (role !== 'leiding' && role !== 'groepsleiding' && role !== 'webshop')) {
      return NextResponse.json({ error: 'Ongeldige rol gespecificeerd.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: usersData } = await admin.auth.admin.listUsers()
    const users = usersData?.users || []

    const targetUser = users.find(u =>
      role === 'leiding'
        ? (u.app_metadata?.role === 'leiding' || u.email === 'leiding@kriko-m.be')
        : role === 'groepsleiding'
        ? (u.app_metadata?.role === 'groepsleiding' || u.app_metadata?.role === 'admin' || u.email === 'groepsleiding@kriko-m.be')
        : (u.app_metadata?.role === 'webshop' || u.email === 'webshop@kriko-m.be')
    )

    const updatePayload: Record<string, unknown> = {}

    if (newName && newName.trim()) {
      updatePayload.user_metadata = {
        ...(targetUser?.user_metadata || {}),
        naam: newName.trim(),
      }
    }

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json({ error: 'Wachtwoord moet minstens 6 tekens lang zijn.' }, { status: 400 })
      }
      updatePayload.password = newPassword.trim()
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ message: 'Geen wijzigingen opgegeven.' })
    }

    if (!targetUser) {
      // Create user if not existing yet
      const email = role === 'leiding' ? 'leiding@kriko-m.be' : role === 'groepsleiding' ? 'groepsleiding@kriko-m.be' : 'webshop@kriko-m.be'
      const defaultNaam = role === 'leiding' ? 'Leiding' : role === 'groepsleiding' ? 'Groepsleiding' : 'Webshop & uniformen'
      const { error: createError } = await admin.auth.admin.createUser({
        email,
        password: newPassword?.trim() || 'test123',
        email_confirm: true,
        app_metadata: { role },
        user_metadata: { naam: newName?.trim() || defaultNaam },
      })
      if (createError) throw createError
      return NextResponse.json({ success: true, message: 'Account succesvol aangemaakt en bijgewerkt.' })
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(targetUser.id, updatePayload)
    if (updateError) throw updateError

    return NextResponse.json({ success: true, message: 'Account succesvol bijgewerkt!' })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error)?.message || 'Server fout bij bijwerken van account' }, { status: 500 })
  }
}
