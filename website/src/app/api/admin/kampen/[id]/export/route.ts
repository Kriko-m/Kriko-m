import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'

async function requireLeiding() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const role = user.app_metadata?.role
  if (role !== 'admin' && role !== 'groepsleiding' && role !== 'leiding') return null
  return user
}

function escapeCsvValue(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''
  let stringVal = String(val).trim()
  if (stringVal.includes('"') || stringVal.includes(';') || stringVal.includes('\n') || stringVal.includes('\r')) {
    stringVal = `"${stringVal.replace(/"/g, '""')}"`
  }
  return stringVal
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireLeiding()
  if (!user) {
    return new NextResponse('Geen toegang. Log in als leiding.', { status: 403 })
  }

  const { id: kampId } = await params
  const admin = createAdminClient()

  // Kamp info ophalen
  const { data: kamp } = await admin
    .from('kampen')
    .select('*')
    .eq('id', kampId)
    .single()

  if (!kamp) {
    return new NextResponse('Kamp niet gevonden.', { status: 404 })
  }

  // Inschrijvingen en gekoppelde kinderen ophalen
  const [inschrijvingenRes, childrenRes] = await Promise.all([
    admin.from('kampinschrijvingen').select('*').eq('kamp_id', kampId).order('ingeschreven_op', { ascending: true }),
    admin.from('parent_children').select('ga_id, voornaam, tak')
  ])

  const inschrijvingen = inschrijvingenRes.data ?? []
  const children = childrenRes.data ?? []

  // Map ga_id naar kindgegevens
  const childrenMap = new Map<string, { voornaam: string; tak: string }>()
  children.forEach(c => {
    childrenMap.set(c.ga_id, { voornaam: c.voornaam, tak: c.tak })
  })

  // CSV lines
  const lines: string[] = []

  // Metadata headers
  lines.push(['Ledenlijst — ' + kamp.naam + ' (' + (kamp.locatie || '') + ')'].map(escapeCsvValue).join(';'))
  const van = kamp.datum_van ? new Date(kamp.datum_van).toLocaleDateString('nl-BE') : ''
  const tot = kamp.datum_tot ? new Date(kamp.datum_tot).toLocaleDateString('nl-BE') : ''
  lines.push(['Periode', `${van} – ${tot}`].map(escapeCsvValue).join(';'))
  lines.push(['Geëxporteerd op', new Date().toLocaleString('nl-BE')].map(escapeCsvValue).join(';'))
  lines.push('')

  // Kolomkoppen
  lines.push([
    '#',
    'Voornaam',
    'Tak',
    'Opmerking ouder',
    'Lidnummer (ga_id)',
    'Registratiedatum'
  ].map(escapeCsvValue).join(';'))

  if (inschrijvingen.length === 0) {
    lines.push(['(nog geen inschrijvingen voor dit kamp)'].map(escapeCsvValue).join(';'))
  } else {
    inschrijvingen.forEach((ins, idx) => {
      const childInfo = childrenMap.get(ins.ga_id)
      const regDate = ins.ingeschreven_op
        ? new Date(ins.ingeschreven_op).toLocaleString('nl-BE')
        : ''

      lines.push([
        idx + 1,
        childInfo?.voornaam ?? 'Onbekend',
        childInfo?.tak ? childInfo.tak.charAt(0).toUpperCase() + childInfo.tak.slice(1) : 'Onbekend',
        ins.opmerking ?? '',
        ins.ga_id ?? '',
        regDate
      ].map(escapeCsvValue).join(';'))
    })
  }

  const csvContent = '\uFEFF' + lines.join('\r\n')
  const filename = `ledenlijst-${kamp.naam.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().slice(0,10)}.csv`

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store'
    }
  })
}
