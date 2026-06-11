import { unstable_cache } from 'next/cache'
import { createAdminClient } from './supabase'

export const getSettings = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const { data } = await supabase.from('settings').select('*').single()
    return data
  },
  ['settings-cache'],
  { revalidate: 300, tags: ['settings'] }
)

// Actief werkjaar = settings.scouts_year. Direct (ongecachet) gelezen omdat dit
// bij schrijfacties gebruikt wordt om nieuwe records te taggen.
export async function getActiveWerkjaar(): Promise<string> {
  const supabase = createAdminClient()
  const { data } = await supabase.from('settings').select('scouts_year').eq('id', 1).single()
  return data?.scouts_year ?? ''
}

export const getCalendarEvents = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('calendar')
      .select('*')
      .order('date', { ascending: true })
    return data ?? []
  },
  ['calendar-cache'],
  { revalidate: 300, tags: ['calendar'] }
)

export const getEchos = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('echos')
      .select('*')
      .eq('approved', true)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
    return data ?? []
  },
  ['echos-cache'],
  { revalidate: 300, tags: ['echos'] }
)

export const getShopProducts = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('shop_products')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    return data ?? []
  },
  ['shop-products-cache'],
  { revalidate: 300, tags: ['shop-products'] }
)

export const getKampen = (tak?: string) => {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient()
      let query = supabase.from('kampen').select('*, kamp_bestanden(*)').order('datum_van', { ascending: true })
      if (tak) query = query.eq('tak', tak)
      const { data } = await query
      return data ?? []
    },
    ['kampen-cache', tak ?? 'all'],
    { revalidate: 300, tags: ['kampen', tak ? `kampen-${tak}` : 'kampen-all'] }
  )()
}

export async function getOrders() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getMessages() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export const getVerslagen = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('verslagen')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false })
    return data ?? []
  },
  ['verslagen-cache'],
  { revalidate: 300, tags: ['verslagen'] }
)
