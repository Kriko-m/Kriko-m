import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase'
import { requireWebshop } from '@/lib/auth'

const VALID_STATUSES = new Set(['niet_betaald', 'betaald', 'afgehaald', 'pending', 'waiting_approval', 'paid', 'completed', 'cancelled'])

interface OrderItemRecord {
  id?: string
  name?: string
  product_id?: string
  size?: string
  quantity?: number
}

interface OrderRecord {
  stock_deducted?: boolean
  items?: OrderItemRecord[]
  [key: string]: unknown
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireWebshop()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  const { status } = await req.json()
  if (!VALID_STATUSES.has(status)) return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 })

  const admin = createAdminClient()

  // 1. Haal de huidige order op om te controleren of de status verandert
  let orderData: OrderRecord | null = null
  try {
    const { data } = await admin.from('orders').select('*').eq('id', id).single()
    orderData = (data as unknown as OrderRecord) || null
  } catch {}

  const { error } = await admin.from('orders').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const isCompleting = status === 'afgehaald' || status === 'completed'

  // A. Indien status naar 'afgehaald' gaat en stock nog niet is verminderd, trek stock af
  if (isCompleting && orderData && !orderData.stock_deducted && Array.isArray(orderData.items)) {
    try {
      const { data: allProducts } = await admin.from('shop_products').select('id, name, stock, sizes')
      if (allProducts) {
        for (const item of orderData.items) {
          const matchedProd = allProducts.find(
            p => (item.id && p.id === item.id) || (p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase())
          )
          if (matchedProd) {
            const currentStock: Record<string, number> = (typeof matchedProd.stock === 'object' && matchedProd.stock !== null)
              ? { ...matchedProd.stock }
              : {}

            const sizeKey = (item.size && item.size !== 'Standaard' && item.size !== '-') ? item.size : 'default'
            const currentQty = typeof currentStock[sizeKey] === 'number' ? currentStock[sizeKey] : (Number(currentStock[sizeKey]) || 0)
            const qtyToDeduct = Number(item.quantity) || 1

            currentStock[sizeKey] = Math.max(0, currentQty - qtyToDeduct)

            await admin.from('shop_products').update({ stock: currentStock }).eq('id', matchedProd.id)
          }
        }
      }

      // Markeer order als stock_deducted
      await admin.from('orders').update({ stock_deducted: true }).eq('id', id)
      revalidateTag('shop-products', 'max')
    } catch (stockErr) {
      console.error('Niet-fatale fout bij aftrekken stock:', stockErr)
    }
  }

  // B. Indien status teruggezet wordt vanaf 'afgehaald' en stock was reeds verminderd, herstel stock
  if (!isCompleting && orderData && orderData.stock_deducted && Array.isArray(orderData.items)) {
    try {
      const { data: allProducts } = await admin.from('shop_products').select('id, name, stock, sizes')
      if (allProducts) {
        for (const item of orderData.items) {
          const matchedProd = allProducts.find(
            p => (item.id && p.id === item.id) || (p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase())
          )
          if (matchedProd) {
            const currentStock: Record<string, number> = (typeof matchedProd.stock === 'object' && matchedProd.stock !== null)
              ? { ...matchedProd.stock }
              : {}

            const sizeKey = (item.size && item.size !== 'Standaard' && item.size !== '-') ? item.size : 'default'
            const currentQty = typeof currentStock[sizeKey] === 'number' ? currentStock[sizeKey] : (Number(currentStock[sizeKey]) || 0)
            const qtyToAdd = Number(item.quantity) || 1

            currentStock[sizeKey] = currentQty + qtyToAdd

            await admin.from('shop_products').update({ stock: currentStock }).eq('id', matchedProd.id)
          }
        }
      }

      // Zet stock_deducted weer op false
      await admin.from('orders').update({ stock_deducted: false }).eq('id', id)
      revalidateTag('shop-products', 'max')
    } catch (restoreErr) {
      console.error('Niet-fatale fout bij herstellen stock:', restoreErr)
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireWebshop()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  const admin = createAdminClient()

  // Optioneel: herstel voorraad als de verwijderde bestelling reeds was afgetrokken
  try {
    const { data: orderData } = await admin.from('orders').select('*').eq('id', id).single()
    if (orderData && orderData.stock_deducted && Array.isArray(orderData.items)) {
      const { data: allProducts } = await admin.from('shop_products').select('id, name, stock')
      if (allProducts) {
        for (const item of orderData.items) {
          const matchedProd = allProducts.find(
            p => (item.id && p.id === item.id) || (p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase())
          )
          if (matchedProd) {
            const currentStock: Record<string, number> = (typeof matchedProd.stock === 'object' && matchedProd.stock !== null)
              ? { ...matchedProd.stock }
              : {}
            const sizeKey = (item.size && item.size !== 'Standaard' && item.size !== '-') ? item.size : 'default'
            const currentQty = typeof currentStock[sizeKey] === 'number' ? currentStock[sizeKey] : (Number(currentStock[sizeKey]) || 0)
            const qtyToAdd = Number(item.quantity) || 1
            currentStock[sizeKey] = currentQty + qtyToAdd
            await admin.from('shop_products').update({ stock: currentStock }).eq('id', matchedProd.id)
          }
        }
      }
      revalidateTag('shop-products', 'max')
    }
  } catch (err) {
    console.warn('Fout bij herstellen voorraad na orderverwijdering:', err)
  }

  const { error } = await admin.from('orders').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
