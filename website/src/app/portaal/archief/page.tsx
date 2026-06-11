import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import ArchiefBrowser, { ArchiefJaar } from './ArchiefBrowser'

export default async function ArchiefPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portaal')
  const role = user.app_metadata?.role
  if (role !== 'admin' && role !== 'groepsleiding' && role !== 'leiding') redirect('/portaal')

  const admin = createAdminClient()
  const [kampenRes, echosRes, leidingRes, rsvpRes, settingsRes] = await Promise.all([
    admin.from('kampen').select('id, naam, tak, datum_van, datum_tot, werkjaar, kamp_bestanden(id, type, naam, file_name)').order('datum_van', { ascending: true }),
    admin.from('echos').select('id, title, tak, month, year, werkjaar, file_name').order('month', { ascending: true }),
    admin.from('werkjaar_leiding').select('werkjaar, tak, naam, rol'),
    admin.from('kamp_rsvp').select('kamp_id, status'),
    admin.from('settings').select('scouts_year').eq('id', 1).single(),
  ])

  const kampen = kampenRes.data ?? []
  const echos = echosRes.data ?? []
  const leiding = leidingRes.data ?? []
  const rsvps = rsvpRes.data ?? []
  const actief = settingsRes.data?.scouts_year ?? ''

  // RSVP-tally per kamp.
  const tally: Record<string, { ja: number; nee: number }> = {}
  for (const r of rsvps) {
    const t = (tally[r.kamp_id] ??= { ja: 0, nee: 0 })
    if (r.status === 'ja') t.ja++; else if (r.status === 'nee') t.nee++
  }

  // Groepeer per werkjaar.
  const jarenSet = new Set<string>()
  kampen.forEach(k => k.werkjaar && jarenSet.add(k.werkjaar))
  echos.forEach(e => e.werkjaar && jarenSet.add(e.werkjaar))
  leiding.forEach(l => jarenSet.add(l.werkjaar))
  const jaren = [...jarenSet].sort().reverse()

  const data: ArchiefJaar[] = jaren.map(jaar => ({
    werkjaar: jaar,
    actief: jaar === actief,
    kampen: kampen.filter(k => k.werkjaar === jaar).map(k => ({
      id: k.id, naam: k.naam, tak: k.tak, datum_van: k.datum_van, datum_tot: k.datum_tot,
      bestanden: k.kamp_bestanden ?? [],
      ja: tally[k.id]?.ja ?? 0, nee: tally[k.id]?.nee ?? 0,
    })),
    echos: echos.filter(e => e.werkjaar === jaar).map(e => ({ id: e.id, title: e.title, tak: e.tak, month: e.month, file_name: e.file_name })),
    leiding: leiding.filter(l => l.werkjaar === jaar).map(l => ({ tak: l.tak, naam: l.naam, rol: l.rol })),
  }))

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <a href="/portaal/dashboard" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>← Dashboard</a>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>📚 Archief per werkjaar</h1>
      </div>
      <ArchiefBrowser jaren={data} storageUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} />
    </main>
  )
}
