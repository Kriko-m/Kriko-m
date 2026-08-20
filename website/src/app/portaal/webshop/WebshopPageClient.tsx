'use client'

import { useState, useEffect, useCallback } from 'react'
import ExcelJS from 'exceljs'
import { Settings } from '@/lib/types'
import CopyButton from '@/components/CopyButton'
import ConfirmDialog from '../_components/ConfirmDialog'

interface OrderItem {
  name: string
  price: number
  quantity: number
  size?: string
}

interface AdminOrder {
  id: string
  order_ref?: string
  customer_name: string
  email: string
  items: OrderItem[]
  total: number
  created_at?: string
}

interface ShopProduct {
  id: string
  name: string
  price: number
  category: string
  sizes?: string[] | string
  description?: string
  image?: string
}

interface Props {
  initialSettings: Settings
  role?: string
  activeTab: 'bestellingen' | 'artikelen'
}

export default function WebshopPageClient({ initialSettings, role: _role, activeTab }: Props) {
  const [webshopEmail, setWebshopEmail] = useState(initialSettings.webshop_email || '')
  const [saving, setSaving] = useState(false)
  const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Orders State
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  // Shop Products State
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([])
  const [loadingShopProducts, setLoadingShopProducts] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [savingProduct, setSavingProduct] = useState(false)
  const [uploadingProductPhoto, setUploadingProductPhoto] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{ title?: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void } | null>(null)

  const showNotification = useCallback((type: 'success' | 'error', text: string) => {
    setFlashMessage({ type, text })
    setTimeout(() => setFlashMessage(null), 4000)
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true)
    try {
      const res = await fetch('/api/admin/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (err) {
      console.error('Fout bij ophalen bestellingen:', err)
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  const fetchShopProducts = useCallback(async () => {
    setLoadingShopProducts(true)
    try {
      const res = await fetch('/api/admin/shop-products')
      if (res.ok) {
        const data = await res.json()
        setShopProducts(data)
        if (data.length > 0) {
          setSelectedProductId(prev => prev ?? data[0].id)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingShopProducts(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchShopProducts()
  }, [fetchOrders, fetchShopProducts])

  function handleOrderDelete(orderId: string, orderRef: string) {
    setConfirmDialog({
      title: 'Bestelling verwijderen',
      message: `Weet je zeker dat je bestelling ${orderRef} wilt verwijderen?`,
      confirmLabel: 'Verwijderen',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null)
        setUpdatingOrderId(orderId)
        try {
          const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Verwijderen mislukt')
          setOrders(prev => prev.filter(o => o.id !== orderId))
          showNotification('success', `Bestelling ${orderRef} verwijderd!`)
        } catch (err: unknown) {
          showNotification('error', err instanceof Error ? err.message : 'Fout bij verwijderen bestelling')
        } finally {
          setUpdatingOrderId(null)
        }
      },
    })
  }

  async function handleSaveSettings() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webshop_email: webshopEmail }),
      })
      if (!res.ok) throw new Error('Opslaan mislukt')
      showNotification('success', 'E-mailadres voor bestellingen opgeslagen!')
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Fout bij opslaan')
    } finally {
      setSaving(false)
    }
  }

  async function handleProductSave(productToSave: ShopProduct) {
    setSavingProduct(true)
    try {
      const parsedSizes = typeof productToSave.sizes === 'string'
        ? productToSave.sizes.split(',').map(s => s.trim()).filter(Boolean)
        : productToSave.sizes

      const res = await fetch('/api/admin/shop-products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productToSave.id,
          name: productToSave.name,
          price: productToSave.price,
          category: productToSave.category,
          sizes: parsedSizes,
          description: productToSave.description,
          image: productToSave.image,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Opslaan mislukt')
      }
      const updatedProduct = await res.json()
      setShopProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)))
      showNotification('success', `Artikel "${productToSave.name}" opgeslagen!`)
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Fout bij opslaan')
    } finally {
      setSavingProduct(false)
    }
  }

  async function handleProductAdd() {
    setSavingProduct(true)
    try {
      const res = await fetch('/api/admin/shop-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nieuw Artikel',
          price: 15,
          category: 'kledij',
          sizes: ['S', 'M', 'L', 'XL'],
          description: '',
        }),
      })
      if (!res.ok) throw new Error('Artikel aanmaken mislukt')
      const newProduct = await res.json()
      setShopProducts(prev => [newProduct, ...prev])
      setSelectedProductId(newProduct.id)
      showNotification('success', 'Nieuw artikel toegevoegd!')
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Fout bij toevoegen')
    } finally {
      setSavingProduct(false)
    }
  }

  function handleProductDelete(id: string) {
    setConfirmDialog({
      title: 'Artikel verwijderen',
      message: 'Weet je zeker dat je dit artikel wilt verwijderen uit de webshop?',
      confirmLabel: 'Verwijderen',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null)
        setSavingProduct(true)
        try {
          const res = await fetch(`/api/admin/shop-products?id=${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Verwijderen mislukt')
          setShopProducts(prev => {
            const next = prev.filter(p => p.id !== id)
            if (next.length > 0) setSelectedProductId(next[0].id)
            return next
          })
          showNotification('success', 'Artikel succesvol verwijderd uit de webshop!')
        } catch (err: unknown) {
          showNotification('error', err instanceof Error ? err.message : 'Fout bij verwijderen')
        } finally {
          setSavingProduct(false)
        }
      },
    })
  }

  async function handleProductPhotoUpload(e: React.ChangeEvent<HTMLInputElement>, product: ShopProduct) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingProductPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'shop-product-foto')
      formData.append('productId', product.id)
      if (product.image) formData.append('oldUrl', product.image)

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Uploaden foto mislukt')
      const data = await res.json()
      if (data.url) {
        await handleProductSave({ ...product, image: data.url })
      }
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Fout bij uploaden foto')
    } finally {
      setUploadingProductPhoto(false)
    }
  }

  function handleRemoveProductPhoto(product: ShopProduct) {
    setConfirmDialog({
      title: 'Artikel foto verwijderen',
      message: 'Weet je zeker dat je deze artikel foto wilt verwijderen?',
      confirmLabel: 'Foto verwijderen',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null)
        await handleProductSave({ ...product, image: '' })
      },
    })
  }

  async function exportOrdersToExcel() {
    if (orders.length === 0) {
      showNotification('error', 'Er zijn geen bestellingen om te exporteren.')
      return
    }

    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Bestellingen Webshop')

      worksheet.columns = [
        { header: 'Bestelnr', key: 'ref', width: 16 },
        { header: 'Datum', key: 'date', width: 20 },
        { header: 'Koper', key: 'customer', width: 26 },
        { header: 'E-mailadres', key: 'email', width: 30 },
        { header: 'Bestelde Artikelen', key: 'items', width: 45 },
        { header: 'Totaalbedrag (€)', key: 'total', width: 16 },
      ]

      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1A3D2A' },
      }
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

      orders.forEach((ord) => {
        const itemsStr = Array.isArray(ord.items)
          ? ord.items.map((i: OrderItem) => `${i.quantity}x ${i.name} (${i.size})`).join(', ')
          : ''

        worksheet.addRow({
          ref: ord.order_ref || `KM-${ord.id.slice(0, 6)}`,
          date: ord.created_at ? new Date(ord.created_at).toLocaleString('nl-BE') : '',
          customer: ord.customer_name || '',
          email: ord.email || '',
          items: itemsStr,
          total: (ord.total || 0).toFixed(2).replace('.', ','),
        })
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kriko_m_bestellingen_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Fout bij exporteren Excel:', err)
      showNotification('error', 'Er is een fout opgetreden bij het genereren van het Excel-bestand.')
    }
  }

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%', padding: '24px 20px 48px' }} className="portaal-page-container">
      
      {/* Toast Flash Message */}
      {flashMessage && (
        <div style={{
          padding: '14px 22px',
          borderRadius: 14,
          marginBottom: 24,
          fontSize: '0.92rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: flashMessage.type === 'success' ? '#EEF5F1' : '#FDF0F2',
          color: flashMessage.type === 'success' ? '#1A3D2A' : '#B23A4D',
          border: `1.5px solid ${flashMessage.type === 'success' ? '#C2D9C9' : '#E0C0C4'}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <span>{flashMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 24, border: '1.5px solid #C2D9C9', padding: '28px 32px', color: '#1A3D2A', boxShadow: '0 12px 32px rgba(0, 0, 0, 0.05)', width: '100%' }}>
        
        {/* Header Title Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: 16, marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '1.65rem', fontWeight: 900, color: '#1A3D2A', fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>
              {activeTab === 'bestellingen' ? '📦 Alle Bestellingen' : '👕 Artikelen & Assortiment'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#6A8A75' }}>
              {activeTab === 'bestellingen'
                ? 'Overzicht van alle ingekomen bestellingen in de webshop. Exporteer eenvoudig naar Excel.'
                : 'Beheer artikelen, prijzen, maten en foto\'s van de webshop en uniformen.'}
            </p>
          </div>

          {activeTab === 'bestellingen' && (
            <button
              type="button"
              onClick={exportOrdersToExcel}
              style={{
                padding: '11px 22px',
                borderRadius: 10,
                backgroundColor: '#800020',
                color: '#fff',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 14px rgba(128, 0, 32, 0.28)',
                transition: 'all 0.2s ease',
              }}
              className="action-card-hover"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Exporteer naar Excel (.xlsx)</span>
            </button>
          )}
        </div>

        {/* TAB 1: ALLE BESTELLINGEN */}
        {activeTab === 'bestellingen' && (
          <div>
            {loadingOrders ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6A8A75', fontWeight: 600 }}>Bestellingen laden…</div>
            ) : orders.length === 0 ? (
              <div style={{ backgroundColor: '#F8FAF8', border: '1.5px dashed #CBD5E1', borderRadius: 14, padding: 36, textAlign: 'center', color: '#6A8A75' }}>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#1A3D2A', marginBottom: 4 }}>Er zijn nog geen bestellingen geplaatst.</strong>
                <span style={{ fontSize: '0.86rem' }}>Wanneer een koper een bestelling plaatst via de webshop, verschijnt deze hier direct in de lijst.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Top Count Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAF8', padding: '12px 18px', borderRadius: 12, border: '1.5px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1A3D2A' }}>
                    Totaal {orders.length} bestelling{orders.length === 1 ? '' : 'en'}
                  </span>
                </div>

                {orders.map((ord) => (
                  <div key={ord.id} style={{ backgroundColor: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    
                    {/* Order Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid #F0F4F1', paddingBottom: 12, marginBottom: 14 }}>
                      <div>
                        <strong style={{ fontSize: '1.15rem', color: '#1A3D2A', marginRight: 12 }}>
                          Bestelling {ord.order_ref || `KM-${ord.id.slice(0, 6)}`}
                        </strong>
                        <span style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600 }}>
                          {ord.created_at ? new Date(ord.created_at).toLocaleString('nl-BE', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info Box */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ backgroundColor: '#F8FAF8', padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6A8A75', textTransform: 'uppercase', marginBottom: 4 }}>Koper</div>
                        <div style={{ fontWeight: 800, color: '#1A3D2A', fontSize: '0.95rem' }}>{ord.customer_name}</div>
                        <div style={{ marginTop: 6 }}>
                          <CopyButton text={ord.email} variant="inline">
                            {ord.email}
                          </CopyButton>
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items Table */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 6 }}>Bestelde artikelen</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <tbody>
                          {Array.isArray(ord.items) && ord.items.map((item: OrderItem, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #F0F4F1' }}>
                              <td style={{ padding: '6px 0', color: '#1A3D2A', fontWeight: 700 }}>
                                {item.quantity}× {item.name} <span style={{ color: '#64748B', fontWeight: 600 }}>(Maat: {item.size})</span>
                              </td>
                              <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 800, color: '#1A3D2A' }}>
                                €{(item.price * item.quantity).toFixed(2).replace('.', ',')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Total & Delete Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1.5px solid #F0F4F1' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1A3D2A' }}>
                        Totaalbedrag: <span style={{ color: '#800020' }}>€{(ord.total || 0).toFixed(2).replace('.', ',')}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOrderDelete(ord.id, ord.order_ref || `KM-${ord.id.slice(0, 6)}`)}
                        disabled={updatingOrderId === ord.id}
                        style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#FDF0F2', color: '#B23A4D', border: '1.5px solid #E0C0C4', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {updatingOrderId === ord.id ? 'Verwijderen…' : 'Bestelling Verwijderen'}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ARTIKELEN & ASSORTIMENT */}
        {activeTab === 'artikelen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Notification Email Field */}
            <div style={{ backgroundColor: '#F8FAF8', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '14px 18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                E-mailadres voor Bestelnotificaties
              </label>
              <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#6A8A75' }}>
                Aan wie moeten de meldingen van nieuwe webshopbestellingen gestuurd worden?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="email"
                  value={webshopEmail}
                  onChange={e => setWebshopEmail(e.target.value)}
                  placeholder="bestellingen@kriko-m.be"
                  style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, color: '#1A3D2A' }}
                />
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  style={{ padding: '8px 18px', borderRadius: 8, backgroundColor: '#1A3D2A', color: '#fff', fontWeight: 800, fontSize: '0.86rem', border: 'none', cursor: 'pointer' }}
                >
                  {saving ? 'Opslaan…' : 'E-mail Opslaan'}
                </button>
              </div>
            </div>

            {loadingShopProducts ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6A8A75', fontWeight: 600 }}>Producten laden…</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
                
                {/* Left sidebar product list */}
                <div style={{ backgroundColor: '#F8FAF8', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    type="button"
                    onClick={handleProductAdd}
                    disabled={savingProduct}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      backgroundColor: '#C9963A',
                      color: '#1A3D2A',
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: 8,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    + Nieuw Artikel Toevoegen
                  </button>

                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', padding: '4px 8px' }}>
                    Kledij
                  </span>
                  {shopProducts.filter(p => p.category !== 'kentekens').map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProductId(p.id)}
                      style={{
                        textAlign: 'left',
                        padding: '9px 12px',
                        borderRadius: 8,
                        fontSize: '0.86rem',
                        fontWeight: selectedProductId === p.id ? 800 : 600,
                        backgroundColor: selectedProductId === p.id ? '#1A3D2A' : '#fff',
                        color: selectedProductId === p.id ? '#fff' : '#1A3D2A',
                        border: '1px solid #CBD5E1',
                        cursor: 'pointer',
                      }}
                    >
                      {p.name}
                    </button>
                  ))}

                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', padding: '12px 8px 4px' }}>
                    Kentekens
                  </span>
                  {shopProducts.filter(p => p.category === 'kentekens').map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProductId(p.id)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: 8,
                        fontSize: '0.82rem',
                        fontWeight: selectedProductId === p.id ? 800 : 600,
                        backgroundColor: selectedProductId === p.id ? '#1A3D2A' : '#fff',
                        color: selectedProductId === p.id ? '#fff' : '#1A3D2A',
                        border: '1px solid #CBD5E1',
                        cursor: 'pointer',
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Right side product editor */}
                {(() => {
                  const product = shopProducts.find(p => p.id === selectedProductId)
                  if (!product) return <div style={{ color: '#666' }}>Selecteer een artikel uit de lijst.</div>

                  return (
                    <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #E8F0EB', paddingBottom: 12 }}>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1A3D2A' }}>
                          {product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleProductDelete(product.id)}
                          style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#FDF0F2', color: '#B23A4D', border: '1.5px solid #E0C0C4', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Verwijderen
                        </button>
                      </div>

                      {/* Photo Preview & Upload */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 8 }}>
                          Artikel Foto
                        </label>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <div style={{
                            width: 90,
                            height: 90,
                            borderRadius: 12,
                            backgroundColor: '#E2E8F0',
                            border: '1.5px solid #CBD5E1',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}>
                            {product.image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textAlign: 'center', padding: 4 }}>
                                Geen foto
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{
                              padding: '8px 14px',
                              borderRadius: 8,
                              backgroundColor: '#1A3D2A',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '0.84rem',
                              cursor: uploadingProductPhoto ? 'wait' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}>
                              <span>{uploadingProductPhoto ? 'Foto verwerken…' : 'Nieuwe foto uploaden'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingProductPhoto}
                                onChange={e => handleProductPhotoUpload(e, product)}
                                style={{ display: 'none' }}
                              />
                            </label>
                            
                            {product.image && (
                              <button
                                type="button"
                                onClick={() => handleRemoveProductPhoto(product)}
                                style={{
                                  padding: '7px 12px',
                                  borderRadius: 8,
                                  backgroundColor: '#FDF0F2',
                                  color: '#B23A4D',
                                  border: '1.5px solid #E0C0C4',
                                  fontWeight: 700,
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Foto verwijderen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Name, Category & Price */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 110px', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                            Naam Artikel
                          </label>
                          <input
                            type="text"
                            value={product.name}
                            onChange={e => setShopProducts(prev => prev.map(p => p.id === product.id ? { ...p, name: e.target.value } : p))}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, color: '#1A3D2A' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                            Sectie / Categorie
                          </label>
                          <select
                            value={product.category || 'kledij'}
                            onChange={e => setShopProducts(prev => prev.map(p => p.id === product.id ? { ...p, category: e.target.value } : p))}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.88rem', fontWeight: 700, color: '#1A3D2A' }}
                          >
                            <option value="kledij">Kledij</option>
                            <option value="kentekens">Kentekens</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                            Prijs (€)
                          </label>
                          <input
                            type="number"
                            step="1"
                            value={product.price}
                            onChange={e => setShopProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: parseFloat(e.target.value) || 0 } : p))}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, color: '#1A3D2A' }}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                          Omschrijving
                        </label>
                        <textarea
                          rows={3}
                          value={product.description || ''}
                          onChange={e => setShopProducts(prev => prev.map(p => p.id === product.id ? { ...p, description: e.target.value } : p))}
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.88rem', fontFamily: 'inherit', color: '#1A3D2A' }}
                        />
                      </div>

                      {/* Sizes */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                          Beschikbare Maten (Gescheiden door komma)
                        </label>
                        <input
                          type="text"
                          value={typeof product.sizes === 'string' ? product.sizes : (Array.isArray(product.sizes) ? product.sizes.join(', ') : '')}
                          onChange={e => {
                            const val = e.target.value
                            setShopProducts(prev => prev.map(p => p.id === product.id ? { ...p, sizes: val } : p))
                          }}
                          placeholder="Bijv. S, M, L, XL of 6j, 8j, 10j"
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.88rem', fontWeight: 700, color: '#1A3D2A' }}
                        />
                      </div>

                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={() => handleProductSave(product)}
                        disabled={savingProduct}
                        style={{ padding: '12px 20px', borderRadius: 10, backgroundColor: '#1A3D2A', color: '#fff', fontWeight: 900, fontSize: '0.92rem', border: 'none', cursor: 'pointer', marginTop: 8 }}
                      >
                        {savingProduct ? 'Opslaan…' : `Artikel "${product.name}" Opslaan`}
                      </button>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

      </div>

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          danger={confirmDialog.danger}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}
