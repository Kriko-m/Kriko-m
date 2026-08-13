import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcvrjpbbybkasppgjiyh.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function listEvents() {
  const { data, error } = await admin.from('calendar').select('*').order('date', { ascending: true })
  if (error) {
    console.error('Error fetching calendar:', error)
  } else {
    console.log('Total calendar events in DB:', data?.length)
    data?.forEach(ev => {
      console.log(`- [${ev.id}] "${ev.title}" | date: ${ev.date} | is_evenement: ${ev.is_evenement} | banner: ${ev.banner_image || 'NONE'} | audience: ${JSON.stringify(ev.audience)}`)
    })
  }
}

listEvents()
