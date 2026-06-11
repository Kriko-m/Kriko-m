import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import WerkjaarRollover from './WerkjaarRollover'
import { Settings, WerkjaarConcept } from '@/lib/types'

export default async function WerkjaarPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portaal')
  // Rollover is groepsleiding-only.
  const role = user.app_metadata?.role
  if (role !== 'admin' && role !== 'groepsleiding') redirect('/portaal/dashboard')

  const admin = createAdminClient()
  const { data: settings } = await admin.from('settings').select('*').eq('id', 1).single()
  const s = (settings ?? {}) as Settings

  const c = s.concept as WerkjaarConcept | undefined
  const concept: WerkjaarConcept | null = c && c.werkjaar ? c : null

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <a href="/portaal/admin" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>← Beheer</a>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>🗓️ Nieuw werkjaar</h1>
      </div>
      <WerkjaarRollover
        actief={s.scouts_year ?? ''}
        takken={s.takken ?? {}}
        concept={concept}
      />
    </main>
  )
}
