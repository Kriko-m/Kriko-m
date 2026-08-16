import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST() {
  try {
    const admin = createAdminClient()
    const { data: usersData, error: listError } = await admin.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const users = usersData?.users || []

    const leidingUser = users.find(u => u.email === 'leiding@kriko-m.be' || u.email === 'demo-leiding@kriko-m.be' || u.app_metadata?.role === 'leiding')
    const groepsleidingUser = users.find(u => u.email === 'groepsleiding@kriko-m.be' || u.email === 'demo-groepsleiding@kriko-m.be' || u.app_metadata?.role === 'groepsleiding' || u.app_metadata?.role === 'admin')

    if (!leidingUser) {
      await admin.auth.admin.createUser({
        email: 'leiding@kriko-m.be',
        password: 'test123',
        email_confirm: true,
        app_metadata: { role: 'leiding' },
        user_metadata: { naam: 'Leiding' },
      })
    } else {
      // Ensure app_metadata role is leiding
      await admin.auth.admin.updateUserById(leidingUser.id, {
        email_confirm: true,
        app_metadata: { ...leidingUser.app_metadata, role: 'leiding' }
      })
    }

    if (!groepsleidingUser) {
      await admin.auth.admin.createUser({
        email: 'groepsleiding@kriko-m.be',
        password: 'test123',
        email_confirm: true,
        app_metadata: { role: 'groepsleiding' },
        user_metadata: { naam: 'Groepsleiding' },
      })
    } else {
      // Ensure app_metadata role is groepsleiding
      await admin.auth.admin.updateUserById(groepsleidingUser.id, {
        email_confirm: true,
        app_metadata: { ...groepsleidingUser.app_metadata, role: 'groepsleiding' }
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Failed to ensure accounts:', err)
    return NextResponse.json({ error: (err as Error)?.message || 'Server error' }, { status: 500 })
  }
}
