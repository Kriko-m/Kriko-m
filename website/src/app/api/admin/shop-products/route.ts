import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('Error fetching shop products:', err)
    return NextResponse.json({ error: 'Serverfout' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireLeiding()
    if (!user) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const body = await req.json()
    const { name, price, description, category, sizes, image } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Naam en prijs zijn verplicht' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const id = `item_${Date.now()}`
    const sort_order = category === 'kentekens' ? 50 : 10

    const { data, error } = await supabase
      .from('shop_products')
      .insert({
        id,
        name,
        price: Number(price),
        description: description || '',
        category: category || 'kledij',
        sizes: Array.isArray(sizes) ? sizes : sizes ? [sizes] : ['Standaard'],
        image: image || '',
        active: true,
        sort_order,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidateTag('shop-products', 'max')

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error creating shop product:', err)
    return NextResponse.json({ error: 'Serverfout bij toevoegen product' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireLeiding()
    if (!user) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const body = await req.json()

    // Support batch update (e.g. for reordering products or saving stock)
    if (Array.isArray(body)) {
      const supabase = createAdminClient()
      for (const item of body) {
        if (item.id) {
          const updateData: Record<string, unknown> = {}
          if (item.sort_order !== undefined) updateData.sort_order = Number(item.sort_order)
          if (item.stock !== undefined) updateData.stock = item.stock
          if (Object.keys(updateData).length > 0) {
            await supabase
              .from('shop_products')
              .update(updateData)
              .eq('id', item.id)
          }
        }
      }
      revalidateTag('shop-products', 'max')
      return NextResponse.json({ success: true, count: body.length })
    }

    const { id, name, price, description, image, category, sizes, active, sort_order, stock } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID is verplicht' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (price !== undefined) updateData.price = Number(price)
    if (description !== undefined) updateData.description = description
    if (image !== undefined) updateData.image = image
    if (category !== undefined) updateData.category = category
    if (sizes !== undefined) updateData.sizes = Array.isArray(sizes) ? sizes : [sizes]
    if (active !== undefined) updateData.active = Boolean(active)
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order)
    if (stock !== undefined) updateData.stock = stock

    let { data, error } = await supabase
      .from('shop_products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    // Fallback if stock column doesn't exist yet in Supabase
    if (error && error.message?.includes('stock') && updateData.stock !== undefined) {
      const fallbackData = { ...updateData }
      delete fallbackData.stock
      const retry = await supabase
        .from('shop_products')
        .update(fallbackData)
        .eq('id', id)
        .select()
        .single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidateTag('shop-products', 'max')

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error updating shop product:', err)
    return NextResponse.json({ error: 'Serverfout bij bijwerken product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireLeiding()
    if (!user) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID is verplicht' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('shop_products').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidateTag('shop-products', 'max')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting shop product:', err)
    return NextResponse.json({ error: 'Serverfout bij verwijderen product' }, { status: 500 })
  }
}
