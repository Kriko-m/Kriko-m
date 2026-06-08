import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const DEMO_PASSWORD = 'KrikoDemo2026!'

const DEMO_ROLLEN: Record<string, { naam: string; role: string }> = {
  ouder:         { naam: 'Demo Ouder',         role: '' },
  leiding:       { naam: 'Demo Leiding',        role: 'leiding' },
  groepsleiding: { naam: 'Demo Groepsleiding',  role: 'groepsleiding' },
}

export async function POST(req: NextRequest) {
  const { rol } = await req.json()
  const config = DEMO_ROLLEN[rol]
  if (!config) return NextResponse.json({ error: 'Onbekende rol' }, { status: 400 })

  const email = `demo-${rol}@kriko-m.be`
  const admin = createAdminClient()

  // Probeer gebruiker aan te maken
  let userId = ''
  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { naam: config.naam },
    app_metadata: config.role ? { role: config.role } : {},
  })

  if (createError && !createError.message.includes('already been registered')) {
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  if (userData?.user) {
    userId = userData.user.id
  }

  // Als al bestaat: metadata updaten (voor het geval rol gewijzigd is)
  if (createError) {
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const bestaande = users.find(u => u.email === email)
    if (bestaande) {
      userId = bestaande.id
      await admin.auth.admin.updateUserById(bestaande.id, {
        password: DEMO_PASSWORD,
        user_metadata: { naam: config.naam },
        app_metadata: config.role ? { role: config.role } : {},
      })
    }
  }

  // Seed demo-kinderen als rol ouder is en er nog geen kinderen zijn
  if (rol === 'ouder' && userId) {
    const { data: bestaandeKinderen } = await admin
      .from('parent_children')
      .select('id')
      .eq('parent_id', userId)

    if (!bestaandeKinderen || bestaandeKinderen.length === 0) {
      const demoKids = [
        { parent_id: userId, ga_id: 'GA-1001', voornaam: 'Lotte', tak: 'kapoenen' },
        { parent_id: userId, ga_id: 'GA-1002', voornaam: 'Rune', tak: 'welpen' },
        { parent_id: userId, ga_id: 'GA-1003', voornaam: 'Milan', tak: 'jonggivers' },
        { parent_id: userId, ga_id: 'GA-1004', voornaam: 'Fien', tak: 'givers' },
      ]
      await admin.from('parent_children').insert(demoKids)
    }
  }

  // Credentials teruggeven zodat client kan inloggen
  return NextResponse.json({ email, password: DEMO_PASSWORD })
}
