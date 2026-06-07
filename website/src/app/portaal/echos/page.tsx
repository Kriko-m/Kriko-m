import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import PortaalNav from '../_components/PortaalNav'
import Link from 'next/link'

const MAANDEN = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
const TAK_KLEUREN: Record<string, string> = {
  kapoenen: '#F4C842', welpen: '#5D9E6C', jonggivers: '#4A7BBF', givers: '#C9963A',
}

export default async function EchosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portaal')

  const naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker'
  const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'groepsleiding'

  const admin = createAdminClient()
  const [kinderenRes, echosRes] = await Promise.all([
    admin.from('parent_children').select('tak').eq('parent_id', user.id),
    admin.from('echos').select('*').eq('approved', true).order('year', { ascending: false }).order('month', { ascending: false }),
  ])

  const takken = [...new Set((kinderenRes.data ?? []).map((k: any) => k.tak as string))]
  const echos = echosRes.data ?? []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return (
    <>
      <PortaalNav naam={naam} isAdmin={isAdmin} />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <a href="/portaal/dashboard" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>← Dashboard</a>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>📰 Kriko Echo&apos;s</h1>
        </div>

        {takken.length === 0 && (
          <div style={{ background: '#fff8e1', border: '1.5px solid #f59e0b', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: '.88rem', color: '#92400e' }}>
            Voeg eerst je kinderen toe om relevante Echo&apos;s te zien.{' '}
            <Link href="/portaal/kinderen" style={{ fontWeight: 700, color: '#92400e' }}>Leden beheren →</Link>
          </div>
        )}

        {takken.map(tak => {
          const takEchos = echos.filter((e: any) => e.tak === tak)
          const kleur = TAK_KLEUREN[tak] ?? '#888'
          return (
            <div key={tak} style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: kleur, textTransform: 'capitalize', letterSpacing: '.04em', marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${kleur}44` }}>
                {tak}
              </h2>
              {takEchos.length === 0 ? (
                <p style={{ color: '#6A8A75', fontSize: '.88rem' }}>Nog geen Echo&apos;s beschikbaar voor deze tak.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {takEchos.map((echo: any) => {
                    const label = `${MAANDEN[echo.month] ?? ''} ${echo.year}`
                    const url = `${supabaseUrl}/storage/v1/object/public/echos/${echo.file_name}`
                    return (
                      <a key={echo.id} href={url} target="_blank" rel="noopener"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: '#fff', border: '1px solid #C2D9C9', borderRadius: 10, textDecoration: 'none', color: '#1A3D2A', transition: 'background .15s' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '1.3rem' }}>📄</span>
                          <span style={{ fontWeight: 700 }}>Kriko Echo — {label}</span>
                        </span>
                        <span style={{ fontSize: '.8rem', color: '#6A8A75', fontWeight: 600 }}>Openen ↗</span>
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {takken.length > 0 && echos.filter((e: any) => takken.includes(e.tak)).length === 0 && (
          <p style={{ color: '#6A8A75', textAlign: 'center', padding: '40px 0' }}>Nog geen Echo&apos;s beschikbaar.</p>
        )}
      </main>
    </>
  )
}
