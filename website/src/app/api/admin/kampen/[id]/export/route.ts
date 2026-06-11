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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireLeiding()
  if (!user) {
    return new NextResponse('Geen toegang. Log in als leiding.', { status: 403 })
  }

  const { id: kampId } = await params
  const admin = createAdminClient()

  const { data: kamp } = await admin
    .from('kampen')
    .select('naam, locatie, datum_van, datum_tot')
    .eq('id', kampId)
    .single()

  if (!kamp) {
    return new NextResponse('Kamp niet gevonden.', { status: 404 })
  }

  // Zelf-opgegeven antwoorden (de "aanwezige leden"-opgave).
  const { data: rsvps } = await admin
    .from('kamp_rsvp')
    .select('kind_naam, tak, status, opmerking, updated_at')
    .eq('kamp_id', kampId)
    .order('tak', { ascending: true })
    .order('kind_naam', { ascending: true })

  const rows = rsvps ?? []

  const lines: string[] = []
  lines.push([`Antwoorden — ${kamp.naam} (${kamp.locatie || ''})`].map(escapeCsvValue).join(';'))
  const van = kamp.datum_van ? new Date(kamp.datum_van).toLocaleDateString('nl-BE') : ''
  const tot = kamp.datum_tot ? new Date(kamp.datum_tot).toLocaleDateString('nl-BE') : ''
  lines.push(['Periode', `${van} – ${tot}`].map(escapeCsvValue).join(';'))
  lines.push(['Geëxporteerd op', new Date().toLocaleString('nl-BE')].map(escapeCsvValue).join(';'))
  lines.push(['LET OP', 'Zelf-opgegeven en niet geverifieerd — behandel als richtinggevend.'].map(escapeCsvValue).join(';'))
  lines.push('')

  lines.push(['#', 'Naam', 'Tak', 'Komt mee?', 'Opmerking', 'Laatst gewijzigd'].map(escapeCsvValue).join(';'))

  if (rows.length === 0) {
    lines.push(['(nog geen antwoorden voor dit kamp)'].map(escapeCsvValue).join(';'))
  } else {
    rows.forEach((r, idx) => {
      lines.push([
        idx + 1,
        r.kind_naam,
        r.tak ? r.tak.charAt(0).toUpperCase() + r.tak.slice(1) : '',
        r.status === 'ja' ? 'Ja' : 'Nee',
        r.opmerking ?? '',
        r.updated_at ? new Date(r.updated_at).toLocaleString('nl-BE') : '',
      ].map(escapeCsvValue).join(';'))
    })
  }

  const BOM = String.fromCharCode(0xFEFF) // UTF-8 BOM zodat Excel accenten correct toont
  const csvContent = BOM + lines.join('\r\n')
  const filename = `antwoorden-${kamp.naam.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
