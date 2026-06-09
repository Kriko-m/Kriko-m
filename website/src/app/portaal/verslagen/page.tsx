import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getVerslagen } from '@/lib/db'
import VerslagenClient from './VerslagenClient'
import { Verslag } from '@/lib/types'

export default async function VerslagenPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal/dashboard')

  const naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker'
  const isAdmin = role === 'admin' || role === 'groepsleiding'

  const [authRes, verslagen] = await Promise.all([
    supabase.auth.getUser(),
    getVerslagen()
  ])

  if (authRes.error || !authRes.data.user) redirect('/portaal')

  return (
    <>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <a href="/portaal/dashboard" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>← Dashboard</a>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>📋 Verslagen &amp; Notulen</h1>
        </div>

        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: '.85rem', color: '#166534', lineHeight: 1.5 }}>
          <strong>ℹ️ Info:</strong> Notulen van leidingsvergaderingen en groepsbijeenkomsten. Enkel zichtbaar voor leiding.
        </div>

        <VerslagenClient verslagen={verslagen} />
      </main>
    </>
  )
}
