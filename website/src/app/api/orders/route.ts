import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase'
import { Product, OrderItem } from '@/lib/types'

// Belgische gestructureerde mededeling (Modulo 97), identiek aan de PHP-versie.
function generateCommunication(orderNumber: number): string {
  const first10 = String(orderNumber % 10_000_000_000).padStart(10, '0')
  const modulo = parseInt(first10, 10) % 97
  const check = modulo === 0 ? 97 : modulo
  const full12 = first10 + String(check).padStart(2, '0')
  return `+++${full12.slice(0, 3)}/${full12.slice(3, 7)}/${full12.slice(7)}+++`
}

const VALID_TAKKEN = new Set(['kapoenen', 'welpen', 'jonggivers', 'givers'])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer_name, child_name, child_tak, email, cart } = body

    // Basis-validatie
    if (!customer_name?.trim() || !child_name?.trim() || !child_tak || !email?.trim()) {
      return NextResponse.json({ error: 'Vul alle verplichte velden in.' }, { status: 400 })
    }
    if (!VALID_TAKKEN.has(child_tak)) {
      return NextResponse.json({ error: 'Ongeldige tak geselecteerd.' }, { status: 400 })
    }
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Je winkelmandje is leeg.' }, { status: 400 })
    }

    const clientSupabase = await createServerSupabaseClient()
    const { data: { user } } = await clientSupabase.auth.getUser()
    const parentId = user?.id || null

    const supabase = createAdminClient()

    // Bank- en instellingsgegevens ophalen
    const { data: settings } = await supabase
      .from('settings')
      .select('bank_iban, bank_holder')
      .single()
    const bankIban = settings?.bank_iban || 'BE76 1234 5678 9012'
    const bankHolder = settings?.bank_holder || 'Scouts Kriko-M vzw'

    // Catalogus ophalen voor server-side prijsvalidatie
    const { data: products } = await supabase
      .from('shop_products')
      .select('id, name, price, sizes, active')
      .eq('active', true)
    const catalogue = new Map<string, Product>((products as Product[] ?? []).map((p: Product) => [p.id, p]))

    // Mandje valideren — nooit prijzen uit de client vertrouwen
    const validatedCart: OrderItem[] = []
    let total = 0
    for (const item of cart) {
      const prod = catalogue.get(item.id)
      if (!prod || !item.quantity || item.quantity < 1) continue
      const sizes: string[] = prod.sizes ?? []
      const size = sizes.length === 0
        ? 'Standaard'
        : sizes.includes(item.size) ? item.size : sizes[0]
      const qty = Math.min(Number(item.quantity), 50)
      const price = Number(prod.price)
      validatedCart.push({ id: item.id, name: prod.name, size, price, quantity: qty })
      total += price * qty
    }

    if (validatedCart.length === 0) {
      return NextResponse.json({ error: 'Je winkelmandje bevat geen geldige artikelen.' }, { status: 400 })
    }

    // Bestelling aanmaken — order_number wordt via sequence toegewezen
    const { data: inserted, error: insertError } = await supabase
      .from('orders')
      .insert({
        status: 'pending',
        customer_name: customer_name.trim(),
        child_name: child_name.trim(),
        child_tak,
        email: email.trim(),
        items: validatedCart,
        total,
        communication: '', // wordt hieronder bijgewerkt
        parent_id: parentId,
      })
      .select('id, order_number, order_ref')
      .single()

    if (insertError || !inserted) throw insertError ?? new Error('Insert mislukt')

    // Gestructureerde mededeling berekenen op basis van het toegewezen bestelnummer
    const communication = generateCommunication(inserted.order_number)

    const { error: updateError } = await supabase
      .from('orders')
      .update({ communication })
      .eq('id', inserted.id)

    if (updateError) throw updateError

    return NextResponse.json({
      order_ref: inserted.order_ref,
      communication,
      total,
      items: validatedCart,
      bank_iban: bankIban,
      bank_holder: bankHolder,
    })
  } catch (err) {
    console.error('Orders API error:', err)
    return NextResponse.json({ error: 'Server error. Probeer het opnieuw.' }, { status: 500 })
  }
}
