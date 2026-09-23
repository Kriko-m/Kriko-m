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

export type AddItemTrigger = React.MouseEvent | HTMLElement | { x: number; y: number }

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, trigger?: AddItemTrigger) => void
  removeItem: (id: string, size: string) => void
  updateQty: (id: string, size: string, delta: number) => void
  clearCart: () => void
  totalQty: number
  totalPrice: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart moet binnen CartProvider gebruikt worden')
  return ctx
}

// Vliegend animatie-effect van geklikte knop naar de winkelmandjeknop
function animateFlyToCart(startPos: { x: number; y: number }, image?: string) {
  if (typeof document === 'undefined') return

  const targetEl = document.querySelector('.cart-floating-trigger') as HTMLElement | null
  if (!targetEl) return

  const targetRect = targetEl.getBoundingClientRect()
  const targetX = targetRect.left + targetRect.width / 2
  const targetY = targetRect.top + targetRect.height / 2

  const flyEl = document.createElement('div')
  flyEl.className = 'cart-flying-particle'

  if (image) {
    const img = document.createElement('img')
    img.src = image
    img.alt = ''
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.objectFit = 'cover'
    flyEl.appendChild(img)
  } else {
    const icon = document.createElement('i')
    icon.className = 'fa-solid fa-bag-shopping'
    flyEl.appendChild(icon)
  }

  const size = 52
  Object.assign(flyEl.style, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(101, 11, 25, 0.4), 0 2px 6px rgba(0,0,0,0.18)',
    border: '2.5px solid #ffffff',
    backgroundColor: '#650B19',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    zIndex: '99999',
    pointerEvents: 'none',
    transform: `translate(${startPos.x - size / 2}px, ${startPos.y - size / 2}px) scale(0.6)`,
  })

  document.body.appendChild(flyEl)

  // Arcing curve upwards and towards the cart trigger
  const midX = startPos.x + (targetX - startPos.x) * 0.45
  const midY = Math.min(startPos.y, targetY) - 50

  const flyDuration = 720

  const animation = flyEl.animate(
    [
      {
        transform: `translate(${startPos.x - size / 2}px, ${startPos.y - size / 2}px) scale(0.6)`,
        opacity: 0.9,
      },
      {
        transform: `translate(${startPos.x - size / 2}px, ${startPos.y - size / 2 - 25}px) scale(1.15)`,
        opacity: 1,
        offset: 0.2,
      },
      {
        transform: `translate(${midX - size / 2}px, ${midY}px) scale(1)`,
        opacity: 1,
        offset: 0.55,
      },
      {
        transform: `translate(${targetX - size / 2}px, ${targetY - size / 2}px) scale(0.25)`,
        opacity: 0.6,
        offset: 0.9,
      },
      {
        transform: `translate(${targetX - size / 2}px, ${targetY - size / 2}px) scale(0)`,
        opacity: 0,
      },
    ],
    {
      duration: flyDuration,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    }
  )

  // Start de subtiele pulse exact wanneer het item de knop raakt (op ~80% van de vlucht)
  setTimeout(() => {
    targetEl.classList.remove('pulse')
    void targetEl.offsetWidth
    targetEl.classList.add('pulse')
  }, flyDuration * 0.8)

  animation.onfinish = () => {
    flyEl.remove()
    setTimeout(() => {
      targetEl.classList.remove('pulse')
    }, 350)
  }
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kriko_cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('kriko_cart', JSON.stringify(items))
  }, [items])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), [])

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>, trigger?: AddItemTrigger) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === newItem.id && i.size === newItem.size)
      if (idx > -1) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
        return next
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })

    // Start het vliegend effect naar het mandje
    if (typeof window !== 'undefined') {
      let startX = window.innerWidth / 2
      let startY = window.innerHeight / 2

      if (trigger) {
        if ('clientX' in trigger && typeof trigger.clientX === 'number') {
          startX = trigger.clientX
          startY = trigger.clientY
        } else if ('getBoundingClientRect' in trigger && typeof trigger.getBoundingClientRect === 'function') {
          const r = (trigger as HTMLElement).getBoundingClientRect()
          startX = r.left + r.width / 2
          startY = r.top + r.height / 2
        } else if ('x' in trigger && typeof trigger.x === 'number') {
          startX = trigger.x
          startY = trigger.y
        }
      }

      animateFlyToCart({ x: startX, y: startY }, newItem.image)
    }
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
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      totalQty,
      totalPrice,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}
