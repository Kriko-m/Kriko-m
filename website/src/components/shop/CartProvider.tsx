'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  size: string
  image?: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string, size: string) => void
  updateQty: (id: string, size: string, delta: number) => void
  clearCart: () => void
  totalQty: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart moet binnen CartProvider gebruikt worden')
  return ctx
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kriko_cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('kriko_cart', JSON.stringify(items))
  }, [items])

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === newItem.id && i.size === newItem.size)
      if (idx > -1) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
        return next
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: string, size: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size)))
  }, [])

  const updateQty = useCallback((id: string, size: string, delta: number) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id && i.size === size)
      if (idx === -1) return prev
      const next = [...prev]
      const newQty = next[idx].quantity + delta
      if (newQty <= 0) return next.filter((_, i) => i !== idx)
      next[idx] = { ...next[idx], quantity: newQty }
      return next
    })
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalQty, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}
