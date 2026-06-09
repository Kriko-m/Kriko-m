import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { fetchMember } from '@/lib/groepsadmin'

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

  // Get leader session to extract OAuth provider token for Groepsadmin calls
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.provider_token ?? 'mock_token'

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

  // Map ga_id naar kindgegevens (local DB fallback)
  const childrenMap = new Map<string, { voornaam: string; tak: string }>()
  children.forEach(c => {
    childrenMap.set(c.ga_id, { voornaam: c.voornaam, tak: c.tak })
  })

  // Resolve member info from Groepsadmin API
  const records = await Promise.all(
    inschrijvingen.map(async (ins) => {
      try {
        const memberInfo = await fetchMember(token, ins.ga_id)
        return {
          ins,
          voornaam: memberInfo.voornaam || childrenMap.get(ins.ga_id)?.voornaam || 'Onbekend',
          achternaam: memberInfo.achternaam || '',
          geboortedatum: memberInfo.geboortedatum || '',
          tak: memberInfo.tak || childrenMap.get(ins.ga_id)?.tak || 'Onbekend',
          medisch: memberInfo.medisch
        }
      } catch (err) {
        console.error(`Failed to fetch Groepsadmin details for ${ins.ga_id}:`, err)
        const childInfo = childrenMap.get(ins.ga_id)
        return {
          ins,
          voornaam: childInfo?.voornaam ?? 'Onbekend',
          achternaam: 'Onbekend',
          geboortedatum: 'Onbekend',
          tak: childInfo?.tak ?? 'Onbekend',
          medisch: {
            allergieen: 'Fout bij ophalen',
            dieet: 'Fout bij ophalen',
            medicatie: 'Fout bij ophalen',
            opmerkingen: 'Fout bij ophalen'
          }
        }
      }
    })
  )

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
    'Achternaam',
    'Geboortedatum',
    'Tak',
    'Allergieën',
    'Dieet',
    'Medicatie',
    'Medische opmerkingen',
    'Opmerking ouder',
    'Lidnummer (ga_id)',
    'Registratiedatum'
  ].map(escapeCsvValue).join(';'))

  if (records.length === 0) {
    lines.push(['(nog geen inschrijvingen voor dit kamp)'].map(escapeCsvValue).join(';'))
  } else {
    records.forEach((record, idx) => {
      const regDate = record.ins.ingeschreven_op
        ? new Date(record.ins.ingeschreven_op).toLocaleString('nl-BE')
        : ''

      lines.push([
        idx + 1,
        record.voornaam,
        record.achternaam,
        record.geboortedatum,
        record.tak ? record.tak.charAt(0).toUpperCase() + record.tak.slice(1) : 'Onbekend',
        record.medisch.allergieen ?? '-',
        record.medisch.dieet ?? '-',
        record.medisch.medicatie ?? '-',
        record.medisch.opmerkingen ?? '-',
        record.ins.opmerking ?? '',
        record.ins.ga_id ?? '',
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
