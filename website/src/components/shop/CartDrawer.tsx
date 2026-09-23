'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from './CartProvider'
import { formatPrice } from '@/lib/utils'
import { useScrollLock } from '@/lib/useScrollLock'

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQty,
    totalQty,
    totalPrice,
    isOpen,
    closeCart,
    toggleCart,
  } = useCart()

  const panelRef = useRef<HTMLDivElement>(null)

  // Vergrendel achtergrondscrollen op mobiel wanneer het mandje open staat
  useScrollLock(isOpen)

  // Sluit het winkelmandje met Escape-toets
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeCart])

  return (
    <>
      {/* 1. Vlottende triggerknop (altijd zichtbaar) */}
      <button
        type="button"
        className={`cart-floating-trigger${totalQty > 0 ? ' has-items' : ''}${isOpen ? ' drawer-open' : ''}`}
        onClick={toggleCart}
        aria-expanded={isOpen}
        aria-label={totalQty > 0 ? `Winkelmandje bekijken (${totalQty} artikelen)` : 'Winkelmandje bekijken'}
      >
        <span className="cart-floating-icon-wrap">
          <i className="fa-solid fa-bag-shopping" />
        </span>
        <span className="cart-floating-label">Mandje</span>
        {totalQty > 0 && (
          <span className="cart-floating-pill">{totalQty}</span>
        )}
      </button>

      {/* 2. Donkere backdrop overlay */}
      <div
        className={`cart-backdrop${isOpen ? ' open' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* 3. Slide-over paneel */}
      <aside
        className={`cart-slide-panel${isOpen ? ' open' : ''}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Winkelmandje"
      >
        {/* Header */}
        <div className="cart-panel-header">
          <div className="cart-panel-title-wrap">
            <i className="fa-solid fa-bag-shopping cart-header-icon" />
            <h2 className="cart-panel-title">Winkelmandje</h2>
          </div>
          <button
            type="button"
            className="cart-panel-close-btn"
            onClick={closeCart}
            aria-label="Winkelmandje sluiten"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Inhoud / Artikelenlijst */}
        <div className="cart-panel-body">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon-circle">
                <i className="fa-solid fa-bag-shopping" />
              </div>
              <h3 className="cart-empty-title">Je winkelmandje is leeg</h3>
              <p className="cart-empty-desc">
                Voeg een trui, t-shirt, groepsdas of kentekens toe om een bestelling te plaatsen.
              </p>
              <button
                type="button"
                className="btn btn-outline cart-empty-action-btn"
                onClick={closeCart}
              >
                Bekijk assortiment
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map(item => {
                const hasSpecificSize = item.size && item.size !== 'Standaard'
                return (
                  <div key={`${item.id}-${item.size}`} className="cart-item-card">
                    {/* Thumbnail */}
                    <div className="cart-item-thumb">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="cart-item-thumb-placeholder">
                          <i className="fa-solid fa-shirt" />
                        </div>
                      )}
                    </div>

                    {/* Info & Prijs */}
                    <div className="cart-item-content">
                      <div className="cart-item-top">
                        <h4 className="cart-item-title">{item.name}</h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.size)}
                          className="cart-item-delete-btn"
                          title="Verwijder uit mandje"
                          aria-label={`Verwijder ${item.name} uit mandje`}
                        >
                          <i className="fa-regular fa-trash-can" />
                        </button>
                      </div>

                      {hasSpecificSize && (
                        <span className="cart-item-size-badge">
                          Maat {item.size}
                        </span>
                      )}

                      <div className="cart-item-bottom">
                        {/* Stepper (+ / -) */}
                        <div className="cart-stepper">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.size, -1)}
                            className="cart-stepper-btn"
                            aria-label={`Verminder aantal van ${item.name}`}
                          >
                            <i className="fa-solid fa-minus" />
                          </button>
                          <span className="cart-stepper-value">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.size, 1)}
                            className="cart-stepper-btn"
                            aria-label={`Vermeerder aantal van ${item.name}`}
                          >
                            <i className="fa-solid fa-plus" />
                          </button>
                        </div>

                        {/* Prijs */}
                        <div className="cart-item-pricing">
                          {item.quantity > 1 && (
                            <span className="cart-item-unit-price">
                              {item.quantity} × {formatPrice(item.price)}
                            </span>
                          )}
                          <span className="cart-item-total-price">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-panel-footer">
            <div className="cart-subtotal-row">
              <span className="cart-subtotal-label">Subtotaal:</span>
              <span className="cart-subtotal-amount">{formatPrice(totalPrice)}</span>
            </div>


            <Link
              href="/webwinkel/afrekenen"
              onClick={closeCart}
              className="btn btn-secondary cart-checkout-btn"
            >
              <span>Bestelling afronden</span>
              <i className="fa-solid fa-arrow-right" />
            </Link>

            <button
              type="button"
              onClick={closeCart}
              className="cart-continue-btn"
            >
              ← Verder winkelen
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
