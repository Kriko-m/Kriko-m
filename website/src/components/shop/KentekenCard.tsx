'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCart } from './CartProvider'
import { Product } from '@/lib/types'

export default function KentekenCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: 'Standaard',
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1.5px solid #E2E8F0',
      borderRadius: 'var(--border-radius-md, 14px)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 12,
      boxShadow: 'var(--shadow-sm, 0 2px 6px rgba(0,0,0,0.04))',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    }} className="kenteken-card-hover">
      
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{
          width: 54,
          height: 54,
          borderRadius: 12,
          backgroundColor: 'var(--color-bg-linen, #F0ECE4)',
          position: 'relative',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #CBD5E1',
        }}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="60px"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '1.5rem' }}>🔰</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            margin: '0 0 4px',
            fontSize: '0.92rem',
            fontWeight: 800,
            color: 'var(--color-primary-dark, #3a0710)',
            lineHeight: 1.25,
          }}>
            {product.name}
          </h4>
          <span style={{
            fontSize: '0.9rem',
            fontWeight: 900,
            color: 'var(--color-secondary, #C9963A)',
          }}>
            €{product.price.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      {product.description && (
        <p style={{
          margin: 0,
          fontSize: '0.78rem',
          color: 'var(--color-text-muted, #666)',
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.description}
        </p>
      )}

      <button
        onClick={handleAdd}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          border: 'none',
          backgroundColor: added ? '#1A3D2A' : 'var(--color-primary, #650B19)',
          color: '#fff',
          fontWeight: 800,
          fontSize: '0.82rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'background-color 0.2s ease',
        }}
      >
        <span>{added ? '✓ Toegevoegd' : '+ In winkelmandje'}</span>
      </button>

    </div>
  )
}
