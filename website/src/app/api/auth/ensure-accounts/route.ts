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

    // 1. Clean up legacy/demo accounts
    const demoUsers = users.filter(u => u.email?.startsWith('demo-'))
    for (const demoUser of demoUsers) {
      await admin.auth.admin.deleteUser(demoUser.id)
    }

    // 2. Strictly match official accounts by exact email
    const leidingUser = users.find(u => u.email === 'leiding@kriko-m.be')
    const groepsleidingUser = users.find(u => u.email === 'groepsleiding@kriko-m.be')
    const webshopUser = users.find(u => u.email === 'webshop@kriko-m.be')

    if (!leidingUser) {
      await admin.auth.admin.createUser({
        email: 'leiding@kriko-m.be',
        password: `Kriko-${crypto.randomUUID()}`,
        email_confirm: true,
        app_metadata: { role: 'leiding' },
        user_metadata: { naam: 'Leiding' },
      })
    } else {
      await admin.auth.admin.updateUserById(leidingUser.id, {
        email_confirm: true,
        app_metadata: { ...leidingUser.app_metadata, role: 'leiding' }
      })
    }

    if (!groepsleidingUser) {
      await admin.auth.admin.createUser({
        email: 'groepsleiding@kriko-m.be',
        password: `Kriko-${crypto.randomUUID()}`,
        email_confirm: true,
        app_metadata: { role: 'groepsleiding' },
        user_metadata: { naam: 'Groepsleiding' },
      })
    } else {
      await admin.auth.admin.updateUserById(groepsleidingUser.id, {
        email_confirm: true,
        app_metadata: { ...groepsleidingUser.app_metadata, role: 'groepsleiding' }
      })
    }

    if (!webshopUser) {
      await admin.auth.admin.createUser({
        email: 'webshop@kriko-m.be',
        password: `Kriko-${crypto.randomUUID()}`,
        email_confirm: true,
        app_metadata: { role: 'webshop' },
        user_metadata: { naam: 'Webshop & uniformen' },
      })
    } else {
      await admin.auth.admin.updateUserById(webshopUser.id, {
        email_confirm: true,
        app_metadata: { ...webshopUser.app_metadata, role: 'webshop' }
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Failed to ensure accounts:', err)
    return NextResponse.json({ error: (err as Error)?.message || 'Server error' }, { status: 500 })
  }
}
