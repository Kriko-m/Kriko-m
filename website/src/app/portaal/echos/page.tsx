import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import Link from 'next/link'
import { ParentChild, Echo } from '@/lib/types'

const MAANDEN = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
const TAK_KLEUREN: Record<string, string> = {
  kapoenen: '#F4C842', welpen: '#5D9E6C', jonggivers: '#4A7BBF', givers: '#C9963A',
}

export default async function EchosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (isLeiding) redirect('/portaal/dashboard')

  const naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker'
  const isAdmin = role === 'admin' || role === 'groepsleiding'

  const admin = createAdminClient()
  const [authRes, kinderenRes, echosRes] = await Promise.all([
    supabase.auth.getUser(),
    admin.from('parent_children').select('tak').eq('parent_id', user.id),
    admin.from('echos').select('*').eq('approved', true).order('year', { ascending: false }).order('month', { ascending: false }),
  ])

  if (authRes.error || !authRes.data.user) redirect('/portaal')

  const takken = [...new Set(((kinderenRes.data ?? []) as ParentChild[]).map((k: ParentChild) => k.tak))]
  const echos = (echosRes.data ?? []) as Echo[]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return (
    <>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <a href="/portaal/dashboard" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>← Dashboard</a>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>📰 Kriko Echo&apos;s</h1>
        </div>

        {takken.length === 0 && (
          <div style={{ background: '#fff8e1', border: '1.5px solid #f59e0b', borderRadius: 'var(--border-radius-md)', padding: '16px 20px', marginBottom: 24, fontSize: '.88rem', color: '#92400e', lineHeight: 1.6 }}>
            📋 Info: Voeg eerst je kinderen toe om relevante Echo&apos;s te zien.{' '}
            <Link href="/portaal/kinderen" style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>Leden beheren →</Link>
          </div>
        )}

        {takken.map(tak => {
          const takEchos = echos.filter((e: Echo) => e.tak === tak)
          const kleur = TAK_KLEUREN[tak] ?? '#888'
          return (
            <div key={tak} style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: kleur, textTransform: 'capitalize', letterSpacing: '.04em', marginBottom: 16, paddingBottom: 8, borderBottom: `3px solid ${kleur}33`, fontFamily: 'Outfit, sans-serif' }}>
                {tak}
              </h2>
              {takEchos.length === 0 ? (
                <p style={{ color: '#6A8A75', fontSize: '.88rem' }}>Nog geen Echo&apos;s beschikbaar voor deze tak.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {takEchos.map((echo: Echo) => {
                    const label = `${MAANDEN[echo.month] ?? ''} ${echo.year}`
                    const url = `${supabaseUrl}/storage/v1/object/public/echos/${echo.file_name}`
                    return (
                      <a key={echo.id} href={url} target="_blank" rel="noopener" className="portal-item-row"
                        style={{ '--kleur': kleur } as React.CSSProperties}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>📄</span>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.98rem' }}>Kriko Echo — {label}</span>
                        </span>
                        <span className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '.78rem', boxShadow: 'none' }}>Openen ↗</span>
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {takken.length > 0 && echos.filter((e: Echo) => takken.includes(e.tak)).length === 0 && (
          <p style={{ color: '#6A8A75', textAlign: 'center', padding: '40px 0' }}>Nog geen Echo&apos;s beschikbaar.</p>
        )}
      </main>
    </>
  )
}
