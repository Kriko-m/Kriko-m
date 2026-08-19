'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import ExcelJS from 'exceljs'
import { Settings } from '@/lib/types'
import CopyButton from '@/components/CopyButton'

interface Props {
  initialSettings: Settings
  role?: string
}

type PageKey = 'home' | 'echos' | 'docs' | 'agenda' | 'beheer'

const PAGE_NAMES: Record<PageKey, { label: string }> = {
  home: { label: 'Startpagina' },
  echos: { label: 'Kriko Echo' },
  docs: { label: 'Documenten & Links' },
  agenda: { label: 'Kalender' },
  beheer: { label: 'Website Beheer' },
}

export default function WebsiteBeheerClient({ initialSettings, role }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const currentShopTab: 'bestellingen' | 'beheer' = role === 'webshop'
    ? (tabParam === 'artikelen' ? 'beheer' : 'bestellingen')
    : 'bestellingen'

  const [saving, setSaving] = useState(false)
  const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [modalFlash, setModalFlash] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Modal display state
  const [showPortalModal, setShowPortalModal] = useState(false)
  const [showShopModal, setShowShopModal] = useState(false)
  const [activeShopTab, setActiveShopTab] = useState<'bestellingen' | 'beheer'>('bestellingen')

  useEffect(() => {
    if (role === 'webshop') {
      fetchOrders()
      fetchShopProducts()
    }
  }, [role])

  // Orders State
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  // Shop Products State
  const [shopProducts, setShopProducts] = useState<any[]>([])
  const [loadingShopProducts, setLoadingShopProducts] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('item_tshirt')
  const [uploadingProductPhoto, setUploadingProductPhoto] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)

  // Titels & Subtitels per rol op de startpagina
  const [homeTitleLeiding, setHomeTitleLeiding] = useState<string>(
    initialSettings?.home_title_leiding || (initialSettings?.home_title && initialSettings.home_title !== 'Leidingportaal' ? initialSettings.home_title : 'Welkom leiding')
  )
  const [homeSubtitleLeiding, setHomeSubtitleLeiding] = useState<string>(
    initialSettings?.home_subtitle_leiding || initialSettings?.home_subtitle || ''
  )
  const [homeTitleGroepsleiding, setHomeTitleGroepsleiding] = useState<string>(
    initialSettings?.home_title_groepsleiding || (initialSettings?.home_title && initialSettings.home_title !== 'Leidingportaal' ? initialSettings.home_title : 'Welkom groepsleiding')
  )
  const [homeSubtitleGroepsleiding, setHomeSubtitleGroepsleiding] = useState<string>(
    initialSettings?.home_subtitle_groepsleiding || initialSettings?.home_subtitle || ''
  )
  const [webshopEmail, setWebshopEmail] = useState<string>(
    initialSettings?.webshop_email || 'vicverhaegen4@gmail.com'
  )

  // Achtergronden per pagina
  const [pageBgs, setPageBgs] = useState<Record<PageKey, { type: 'photo' | 'color'; value: string }>>({
    home: { type: initialSettings?.home_bg_type || 'photo', value: initialSettings?.home_bg_value || '/images/hero-nieuw.webp' },
    echos: { type: initialSettings?.echos_bg_type || 'color', value: initialSettings?.echos_bg_value || '#2A5A40' },
    docs: { type: initialSettings?.docs_bg_type || 'color', value: initialSettings?.docs_bg_value || '#2A5A40' },
    agenda: { type: initialSettings?.agenda_bg_type || 'color', value: initialSettings?.agenda_bg_value || '#2A5A40' },
    beheer: { type: initialSettings?.beheer_bg_type || 'color', value: initialSettings?.beheer_bg_value || '#2A5A40' },
  })

  const [activeBgTab, setActiveBgTab] = useState<PageKey>('home')
  const [activeTitleRoleTab, setActiveTitleRoleTab] = useState<'leiding' | 'groepsleiding'>('leiding')
  const [uploadingBg, setUploadingBg] = useState(false)

  function showNotification(type: 'success' | 'error', text: string) {
    setFlashMessage({ type, text })
    setTimeout(() => setFlashMessage(null), 4000)
  }

  function showModalNotification(type: 'success' | 'error', text: string) {
    setModalFlash({ type, text })
    setTimeout(() => setModalFlash(null), 4000)
  }

  async function exportOrdersToExcel() {
    if (!orders || orders.length === 0) return

    try {
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'Scouts Kriko-M'
      workbook.lastModifiedBy = 'Scouts Kriko-M Portaal'
      workbook.created = new Date()

      const worksheet = workbook.addWorksheet('Webshop Bestellingen', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
        views: [{ showGridLines: true }]
      })

      // Title Banner
      const titleRow = worksheet.addRow(['WEBSHOP BESTELLINGEN — SCOUTS KRIKO-M'])
      titleRow.height = 36
      titleRow.getCell(1).font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF800020' } }
      titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' }

      const metaRow = worksheet.addRow([`Exportdatum: ${new Date().toLocaleString('nl-BE')}  |  Totaal aantal bestellingen: ${orders.length}`])
      metaRow.height = 20
      metaRow.getCell(1).font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF555555' } }
      metaRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' }

      worksheet.addRow([]) // Spacer

      // Table Headers
      const headerRowValues = ['Bestelnummer', 'Datum & Tijd', 'Koper', 'E-mailadres', 'Bestelde Artikelen', 'Totaal (€)']
      const headerRow = worksheet.addRow(headerRowValues)
      headerRow.height = 34

      // Bordeaux styling header
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF800020' }, // Deep Bordeaux top
        }
        cell.font = {
          name: 'Segoe UI',
          size: 11,
          bold: true,
          color: { argb: 'FFFFFFFF' },
        }
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF5C0017' } },
          bottom: { style: 'medium', color: { argb: 'FF5C0017' } },
          left: { style: 'thin', color: { argb: 'FF9E2A4B' } },
          right: { style: 'thin', color: { argb: 'FF9E2A4B' } },
        }
      })

      // Column widths
      worksheet.getColumn(1).width = 18 // Bestelnummer
      worksheet.getColumn(2).width = 22 // Datum
      worksheet.getColumn(3).width = 26 // Koper
      worksheet.getColumn(4).width = 34 // Email
      worksheet.getColumn(5).width = 55 // Bestelde Artikelen
      worksheet.getColumn(6).width = 18 // Totaal

      let grandTotal = 0

      // Data Rows
      orders.forEach((ord, index) => {
        const formattedDate = ord.created_at
          ? new Date(ord.created_at).toLocaleString('nl-BE', { dateStyle: 'medium', timeStyle: 'short' })
          : ''

        let itemsText = ''
        let itemCount = 1
        if (Array.isArray(ord.items) && ord.items.length > 0) {
          itemCount = ord.items.length
          itemsText = ord.items
            .map((i: any) => `• ${i.quantity}x ${i.name}${i.size ? ` (${i.size})` : ''}  —  €${(i.price * i.quantity).toFixed(2).replace('.', ',')}`)
            .join('\n')
        }

        const totalAmount = Number(ord.total) || 0
        grandTotal += totalAmount

        const row = worksheet.addRow([
          ord.order_ref || `KM-${ord.id.slice(0, 6)}`,
          formattedDate,
          ord.customer_name || '',
          ord.email || '',
          itemsText,
          totalAmount,
        ])

        row.height = Math.max(30, itemCount * 22)

        const isEven = index % 2 === 1
        const bgArgb = isEven ? 'FFF9F5F6' : 'FFFFFFFF'

        row.eachCell((cell, colNumber) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bgArgb },
          }
          cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1A1A1A' } }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          }

          if (colNumber === 1 || colNumber === 2) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
            if (colNumber === 1) cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1A3D2A' } }
          } else if (colNumber === 5) {
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
          } else if (colNumber === 6) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' }
            cell.numFmt = '"€ "#,##0.00'
            cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF800020' } }
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left' }
          }
        })
      })

      // Summary Row
      worksheet.addRow([])
      const summaryRow = worksheet.addRow(['', '', '', '', 'TOTAAL ONTVANGEN:', grandTotal])
      summaryRow.height = 32
      summaryRow.getCell(5).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF800020' } }
      summaryRow.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' }
      summaryRow.getCell(6).font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FF800020' } }
      summaryRow.getCell(6).alignment = { vertical: 'middle', horizontal: 'right' }
      summaryRow.getCell(6).numFmt = '"€ "#,##0.00'
      summaryRow.getCell(6).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3E8EA' },
      }
      summaryRow.getCell(6).border = {
        top: { style: 'double', color: { argb: 'FF800020' } },
        bottom: { style: 'double', color: { argb: 'FF800020' } },
      }

      // Buffer & Download
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Webshop_Bestellingen_Kriko-M_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Fout bij exporteren naar Excel:', err)
      showModalNotification('error', 'Kon het Excel-bestand niet genereren.')
    }
  }

  async function handleUploadBackgroundPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBg(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'portal-background')
      formData.append('tak', activeBgTab)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Uploaden mislukt')
      }

      const data = await res.json()
      if (data.url) {
        updateActivePageBg('value', data.url)
        showModalNotification('success', `Nieuwe foto geüpload voor ${PAGE_NAMES[activeBgTab].label}! Klik op 'Wijzigingen Opslaan' om te bevestigen.`)
      }
    } catch (err: unknown) {
      showModalNotification('error', err instanceof Error ? err.message : 'Fout bij uploaden foto')
    } finally {
      setUploadingBg(false)
      e.target.value = ''
    }
  }

  function updateActivePageBg(field: 'type' | 'value', val: string) {
    setPageBgs(prev => ({
      ...prev,
      [activeBgTab]: {
        ...prev[activeBgTab],
        [field]: val,
      },
    }))
  }

  async function handleSavePortalSettings() {
    setSaving(true)
    setModalFlash(null)
    try {
      const payload = {
        home_title_leiding: homeTitleLeiding,
        home_subtitle_leiding: homeSubtitleLeiding,
        home_title_groepsleiding: homeTitleGroepsleiding,
        home_subtitle_groepsleiding: homeSubtitleGroepsleiding,
        webshop_email: webshopEmail,
        home_bg_type: pageBgs.home.type,
        home_bg_value: pageBgs.home.value,
        echos_bg_type: pageBgs.echos.type,
        echos_bg_value: pageBgs.echos.value,
        docs_bg_type: pageBgs.docs.type,
        docs_bg_value: pageBgs.docs.value,
        agenda_bg_type: pageBgs.agenda.type,
        agenda_bg_value: pageBgs.agenda.value,
        beheer_bg_type: pageBgs.beheer.type,
        beheer_bg_value: pageBgs.beheer.value,
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Opslaan mislukt')
      }

      const successText = 'Instellingen succesvol opgeslagen!'
      showNotification('success', successText)
      showModalNotification('success', successText)
      router.refresh()
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Fout bij opslaan'
      showModalNotification('error', errorText)
      showNotification('error', errorText)
    } finally {
      setSaving(false)
    }
  }

  async function handleOpenShopModal() {
    setModalFlash(null)
    setShowShopModal(true)
    setActiveShopTab('bestellingen')
    fetchOrders()
    fetchShopProducts()
  }

  async function fetchOrders() {
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
  }

  async function fetchShopProducts() {
    setLoadingShopProducts(true)
    try {
      const res = await fetch('/api/admin/shop-products')
      if (res.ok) {
        const data = await res.json()
        setShopProducts(data)
        if (data.length > 0) setSelectedProductId(data[0].id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingShopProducts(false)
    }
  }

  async function handleOrderDelete(orderId: string, orderRef: string) {
    if (!confirm(`Weet je zeker dat je bestelling ${orderRef} wilt verwijderen?`)) return
    setUpdatingOrderId(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Verwijderen mislukt')
      setOrders(prev => prev.filter(o => o.id !== orderId))
      showModalNotification('success', `Bestelling ${orderRef} verwijderd!`)
    } catch (err: unknown) {
      showModalNotification('error', err instanceof Error ? err.message : 'Fout bij verwijderen bestelling')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function handleProductSave(productToSave: any) {
    setSavingProduct(true)
    try {
      const res = await fetch('/api/admin/shop-products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productToSave.id,
          name: productToSave.name,
          price: productToSave.price,
          category: productToSave.category,
          sizes: productToSave.sizes,
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
      showModalNotification('success', `Artikel "${productToSave.name}" opgeslagen!`)
      router.refresh()
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Fout bij opslaan'
      showModalNotification('error', errorText)
    } finally {
      setSavingProduct(false)
    }
  }

  async function handleProductPhotoUpload(e: React.ChangeEvent<HTMLInputElement>, product: any) {
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
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Uploaden foto mislukt')
      }
      const data = await res.json()
      if (data.url) {
        await handleProductSave({ ...product, image: data.url })
      }
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Fout bij uploaden foto'
      showModalNotification('error', errorText)
    } finally {
      setUploadingProductPhoto(false)
      e.target.value = ''
    }
  }

  async function handleRemoveProductPhoto(product: any) {
    await handleProductSave({ ...product, image: '' })
  }

  async function handleProductAdd() {
    setSavingProduct(true)
    try {
      const res = await fetch('/api/admin/shop-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nieuw Artikel',
          price: 1.00,
          category: 'kledij',
          description: '',
          sizes: ['Standaard'],
          image: '',
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Toevoegen mislukt')
      }
      const newProduct = await res.json()
      setShopProducts(prev => [...prev, newProduct])
      setSelectedProductId(newProduct.id)
      showModalNotification('success', `Nieuw artikel "${newProduct.name}" toegevoegd!`)
      router.refresh()
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Fout bij toevoegen'
      showModalNotification('error', errorText)
    } finally {
      setSavingProduct(false)
    }
  }

  async function handleProductDelete(id: string) {
    if (!confirm('Weet je zeker dat je dit artikel wilt verwijderen uit de webshop?')) return
    setSavingProduct(true)
    try {
      const res = await fetch(`/api/admin/shop-products?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Verwijderen mislukt')
      }
      setShopProducts(prev => {
        const next = prev.filter(p => p.id !== id)
        if (next.length > 0) setSelectedProductId(next[0].id)
        return next
      })
      showModalNotification('success', 'Artikel succesvol verwijderd uit de webshop!')
      router.refresh()
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Fout bij verwijderen'
      showModalNotification('error', errorText)
    } finally {
      setSavingProduct(false)
    }
  }

  function renderShopTabBody(activeTabToUse: 'bestellingen' | 'beheer') {
    return (
      <>
        {/* TAB 1: ALLE BESTELLINGEN */}
        {activeTabToUse === 'bestellingen' && (
          <div>
            {loadingOrders ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6A8A75' }}>Bestellingen laden…</div>
            ) : orders.length === 0 ? (
              <div style={{ backgroundColor: '#F8FAF8', border: '1.5px dashed #CBD5E1', borderRadius: 14, padding: 36, textAlign: 'center', color: '#6A8A75' }}>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#1A3D2A', marginBottom: 4 }}>Er zijn nog geen bestellingen geplaatst.</strong>
                <span style={{ fontSize: '0.86rem' }}>Wanneer een koper een bestelling plaatst via de webshop, verschijnt deze hier direct in de lijst.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Top Action Bar with Export to Excel */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAF8', padding: '12px 18px', borderRadius: 12, border: '1.5px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1A3D2A' }}>
                    Totaal {orders.length} bestelling{orders.length === 1 ? '' : 'en'}
                  </span>
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

                    {/* Customer Info Box with Clickable Copy Button */}
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
                          {Array.isArray(ord.items) && ord.items.map((item: any, idx: number) => (
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

                    {/* Total & Footer Actions */}
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

        {/* TAB 2: ARTIKELEN & INSTELLINGEN */}
        {activeTabToUse === 'beheer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Webshop Notificatie E-mailadres Instelling */}
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
                  onClick={handleSavePortalSettings}
                  disabled={saving}
                  style={{ padding: '8px 18px', borderRadius: 8, backgroundColor: '#1A3D2A', color: '#fff', fontWeight: 800, fontSize: '0.86rem', border: 'none', cursor: 'pointer' }}
                >
                  {saving ? 'Opslaan…' : 'E-mail Opslaan'}
                </button>
              </div>
            </div>

            {loadingShopProducts ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6A8A75' }}>Producten laden…</div>
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

                      {/* Foto Preview & Upload */}
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

                      {/* Naam, Categorie & Prijs */}
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
                            step="0.01"
                            value={product.price}
                            onChange={e => setShopProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: e.target.value } : p))}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, color: '#1A3D2A' }}
                          />
                        </div>
                      </div>

                      {/* Beschrijving */}
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

                      {/* Maten */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                          Beschikbare Maten (Gescheiden door komma)
                        </label>
                        <input
                          type="text"
                          value={Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || ''}
                          onChange={e => {
                            const newSizes = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            setShopProducts(prev => prev.map(p => p.id === product.id ? { ...p, sizes: newSizes } : p))
                          }}
                          placeholder="Bijv. S, M, L, XL of 6j, 8j, 10j"
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.88rem', fontWeight: 700, color: '#1A3D2A' }}
                        />
                      </div>

                      {/* Opslaan Knop */}
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
      </>
    )
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', width: '100%', minHeight: 'calc(100vh - 76px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box', fontFamily: 'var(--font-body, Outfit, sans-serif)', padding: '24px 0' }} className="portaal-page-container">

      {/* Notification Toast Outside Modal */}
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

      {role === 'webshop' ? (
        /* DEDICATED INLINE WEBSHOP VIEW */
        <div style={{ backgroundColor: '#ffffff', borderRadius: 24, border: '1.5px solid #C2D9C9', padding: '28px 32px', color: '#1A3D2A', boxShadow: '0 12px 32px rgba(0, 0, 0, 0.05)', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 900, color: '#1A3D2A' }}>
                {currentShopTab === 'bestellingen' ? '📦 Alle Bestellingen' : '👕 Artikelen & Assortiment'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#6A8A75' }}>
                {currentShopTab === 'bestellingen'
                  ? 'Overzicht van alle ingekomen bestellingen in de webshop. Exporteer eenvoudig naar Excel.'
                  : 'Beheer artikelen, prijzen, maten en foto\'s van de webshop en uniformen.'}
              </p>
            </div>
            {currentShopTab === 'bestellingen' && (
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

          {renderShopTabBody(currentShopTab)}
        </div>
      ) : (
        /* THREE SEPARATE SECTION CARDS GRID FOR GROEPSLEIDING / ADMIN */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          
          {/* CARD 1: PUBLIEKE WEBSITE */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            border: '1.5px solid #C2D9C9',
            padding: '32px 26px',
            color: '#1A3D2A',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            justifyContent: 'space-between',
            gap: 22,
            transition: 'all 0.2s ease',
          }}>
            <div>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                backgroundColor: '#FEF8EC',
                border: '1.5px solid #F6D796',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C9963A',
                marginBottom: 18,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 900, color: '#1A3D2A', letterSpacing: '-0.01em' }}>
                Publieke Website
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#6A8A75', lineHeight: 1.5 }}>
                Bewerk live teksten, kalenderactiviteiten en foto's rechtstreeks op de openbare website.
              </p>
            </div>

            <Link
              href="/?edit=true"
              style={{
                width: '100%',
                padding: '15px 22px',
                backgroundColor: '#C9963A',
                color: '#1A3D2A',
                borderRadius: 14,
                fontWeight: 900,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(201, 150, 58, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.2s ease',
              }}
              className="action-card-hover"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Website Live Bewerken</span>
            </Link>
          </div>

          {/* CARD 2: LEIDINGSPORTAAL */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            border: '1.5px solid #C2D9C9',
            padding: '32px 26px',
            color: '#1A3D2A',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            justifyContent: 'space-between',
            gap: 22,
            transition: 'all 0.2s ease',
          }}>
            <div>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                backgroundColor: '#EEF5F1',
                border: '1.5px solid #C2D9C9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1A3D2A',
                marginBottom: 18,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 900, color: '#1A3D2A', letterSpacing: '-0.01em' }}>
                Leidingsportaal
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#6A8A75', lineHeight: 1.5 }}>
                Pas de welkomsttitels voor leiding vs. groepsleiding en de achtergronden van het portaal aan.
              </p>
            </div>

            <button
              onClick={() => { setModalFlash(null); setShowPortalModal(true) }}
              type="button"
              style={{
                width: '100%',
                padding: '15px 22px',
                backgroundColor: '#1A3D2A',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(26, 61, 42, 0.22)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.2s ease',
              }}
              className="action-card-hover"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              <span>Portaal Instellingen</span>
            </button>
          </div>

          {/* CARD 3: WEBSHOP */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            border: '1.5px solid #C2D9C9',
            padding: '32px 26px',
            color: '#1A3D2A',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            justifyContent: 'space-between',
            gap: 22,
            transition: 'all 0.2s ease',
          }}>
            <div>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                backgroundColor: '#FDF0F2',
                border: '1.5px solid #E0C0C4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#800020',
                marginBottom: 18,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 900, color: '#1A3D2A', letterSpacing: '-0.01em' }}>
                Webshop Beheer
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#6A8A75', lineHeight: 1.5 }}>
                Bekijk bestellingen, beheer artikelen &amp; prijzen en exporteer bestellingen als Excel.
              </p>
            </div>

            <Link
              href="/portaal/webshop/bestellingen"
              style={{
                width: '100%',
                padding: '15px 22px',
                backgroundColor: '#1A3D2A',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontWeight: 900,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(26, 61, 42, 0.22)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.2s ease',
              }}
              className="action-card-hover"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Naar Webshop Beheer &rarr;</span>
            </Link>
          </div>

        </div>
      )}

      {/* MODAL FOR LEIDINGPORTAAL INSTELLINGEN */}
      {showPortalModal && (
        <div className="portaal-modal-overlay">
          <div className="portaal-modal-card" style={{ width: '94%', maxWidth: 940, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div className="portaal-modal-header" style={{ padding: '20px 28px' }}>
              <h3 className="portaal-modal-title" style={{ fontSize: '1.25rem' }}>Instellingen Leidingsportaal</h3>
              <button className="portaal-modal-close" onClick={() => setShowPortalModal(false)}>&times;</button>
            </div>
            
            <div className="portaal-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
              
              {/* Flash Message inside Modal */}
              {modalFlash && (
                <div style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: modalFlash.type === 'success' ? '#EEF5F1' : '#FDF0F2',
                  color: modalFlash.type === 'success' ? '#1A3D2A' : '#B23A4D',
                  border: `1.5px solid ${modalFlash.type === 'success' ? '#C2D9C9' : '#E0C0C4'}`,
                }}>
                  <span>{modalFlash.text}</span>
                </div>
              )}

              {/* SECTIE 1: STARTPAGINA TITELS PER ROL */}
              <div style={{ backgroundColor: '#F8FAF8', padding: 20, borderRadius: 16, border: '1.5px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 900, color: '#1A3D2A' }}>
                  Welkomsttitel Op Startpagina
                </h4>
                <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: '#6A8A75' }}>
                  Stel een unieke hoofdtitel en subtitel in voor gewone Leiding vs. Groepsleiding.
                </p>

                {/* Role Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTitleRoleTab('leiding')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: activeTitleRoleTab === 'leiding' ? '2px solid #1A3D2A' : '1.5px solid #CBD5E1',
                      backgroundColor: activeTitleRoleTab === 'leiding' ? '#1A3D2A' : '#fff',
                      color: activeTitleRoleTab === 'leiding' ? '#fff' : '#1A3D2A',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Voor Leiding
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTitleRoleTab('groepsleiding')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: activeTitleRoleTab === 'groepsleiding' ? '2px solid #1A3D2A' : '1.5px solid #CBD5E1',
                      backgroundColor: activeTitleRoleTab === 'groepsleiding' ? '#1A3D2A' : '#fff',
                      color: activeTitleRoleTab === 'groepsleiding' ? '#fff' : '#1A3D2A',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Voor Groepsleiding
                  </button>
                </div>

                {activeTitleRoleTab === 'leiding' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                        Hoofdtitel voor Leiding
                      </label>
                      <input
                        type="text"
                        value={homeTitleLeiding}
                        onChange={e => setHomeTitleLeiding(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', background: '#fff', fontWeight: 700, color: '#1A3D2A' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                        Subtitel voor Leiding (Optioneel)
                      </label>
                      <textarea
                        value={homeSubtitleLeiding}
                        onChange={e => setHomeSubtitleLeiding(e.target.value)}
                        rows={2}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', background: '#fff', color: '#1A3D2A' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                        Hoofdtitel voor Groepsleiding
                      </label>
                      <input
                        type="text"
                        value={homeTitleGroepsleiding}
                        onChange={e => setHomeTitleGroepsleiding(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', background: '#fff', fontWeight: 700, color: '#1A3D2A' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                        Subtitel voor Groepsleiding (Optioneel)
                      </label>
                      <textarea
                        value={homeSubtitleGroepsleiding}
                        onChange={e => setHomeSubtitleGroepsleiding(e.target.value)}
                        rows={2}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', background: '#fff', color: '#1A3D2A' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTIE 2: ACHTERGROND PER PAGINA */}
              <div style={{ backgroundColor: '#FAFCFA', padding: 20, borderRadius: 16, border: '1.5px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 900, color: '#1A3D2A' }}>
                  Achtergrond Per Pagina
                </h4>
                <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: '#6A8A75' }}>
                  Kies een foto of een effen kleur als achtergrond voor elke specifieke pagina in het portaal.
                </p>

                {/* Page Selector Tabs */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
                  {(Object.keys(PAGE_NAMES) as PageKey[]).map((pageKey) => {
                    const active = activeBgTab === pageKey
                    const info = PAGE_NAMES[pageKey]
                    return (
                      <button
                        key={pageKey}
                        type="button"
                        onClick={() => setActiveBgTab(pageKey)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 10,
                          border: active ? '2px solid #1A3D2A' : '1.5px solid #CBD5E1',
                          backgroundColor: active ? '#1A3D2A' : '#fff',
                          color: active ? '#fff' : '#1A3D2A',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {info.label}
                      </button>
                    )
                  })}
                </div>

                {/* Type Selection (Foto vs Kleur) */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#1A3D2A' }}>
                    <input
                      type="radio"
                      name="bgType"
                      checked={pageBgs[activeBgTab].type === 'photo'}
                      onChange={() => updateActivePageBg('type', 'photo')}
                    />
                    Afbeelding / Foto
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#1A3D2A' }}>
                    <input
                      type="radio"
                      name="bgType"
                      checked={pageBgs[activeBgTab].type === 'color'}
                      onChange={() => updateActivePageBg('type', 'color')}
                    />
                    Effen Kleur
                  </label>
                </div>

                {/* Controls per Type */}
                {pageBgs[activeBgTab].type === 'photo' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                        Afbeelding URL voor {PAGE_NAMES[activeBgTab].label}
                      </label>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input
                          type="text"
                          value={pageBgs[activeBgTab].value}
                          onChange={e => updateActivePageBg('value', e.target.value)}
                          placeholder="/images/hero-nieuw.webp of https://..."
                          style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.88rem', background: '#fff', color: '#1A3D2A' }}
                        />
                        <label style={{
                          padding: '10px 16px',
                          borderRadius: 8,
                          backgroundColor: '#1A3D2A',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: uploadingBg ? 'wait' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          whiteSpace: 'nowrap',
                        }}>
                          <span>{uploadingBg ? 'Uploaden…' : 'Foto Uploaden'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingBg}
                            onChange={handleUploadBackgroundPhoto}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1A3D2A', textTransform: 'uppercase', marginBottom: 4 }}>
                      Achtergrondkleur (Hex code)
                    </label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="color"
                        value={pageBgs[activeBgTab].value.startsWith('#') ? pageBgs[activeBgTab].value : '#2A5A40'}
                        onChange={e => updateActivePageBg('value', e.target.value)}
                        style={{ width: 44, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={pageBgs[activeBgTab].value}
                        onChange={e => updateActivePageBg('value', e.target.value)}
                        placeholder="#2A5A40"
                        style={{ width: 140, padding: '10px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, background: '#fff', color: '#1A3D2A' }}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="portaal-modal-footer" style={{ padding: '16px 28px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSavePortalSettings}
                disabled={saving}
                style={{ padding: '10px 22px', fontSize: '0.92rem' }}
              >
                {saving ? 'Opslaan…' : 'Wijzigingen Opslaan'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL FOR WEBSHOP (BESTELLINGEN + ARTIKELEN & INSTELLINGEN) */}
      {showShopModal && (
        <div className="portaal-modal-overlay">
          <div className="portaal-modal-card" style={{ width: '94%', maxWidth: 1020, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header with Title & Close */}
            <div className="portaal-modal-header" style={{ padding: '18px 28px', borderBottom: '1px solid #E2E8F0' }}>
              <h3 className="portaal-modal-title" style={{ fontSize: '1.25rem' }}>Webshop Beheer</h3>
              <button className="portaal-modal-close" onClick={() => setShowShopModal(false)}>&times;</button>
            </div>

            {/* Subheader Tabs Bar */}
            <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', padding: '0 28px', backgroundColor: '#FAFCFA' }}>
              <button
                type="button"
                onClick={() => setActiveShopTab('bestellingen')}
                style={{
                  padding: '13px 22px',
                  fontWeight: 900,
                  fontSize: '0.94rem',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: activeShopTab === 'bestellingen' ? '3px solid #1A3D2A' : '3px solid transparent',
                  color: activeShopTab === 'bestellingen' ? '#1A3D2A' : '#6A8A75',
                  marginBottom: -2,
                }}
              >
                Alle Bestellingen ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveShopTab('beheer')}
                style={{
                  padding: '13px 22px',
                  fontWeight: 900,
                  fontSize: '0.94rem',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: activeShopTab === 'beheer' ? '3px solid #1A3D2A' : '3px solid transparent',
                  color: activeShopTab === 'beheer' ? '#1A3D2A' : '#6A8A75',
                  marginBottom: -2,
                }}
              >
                Artikelen &amp; Assortiment
              </button>
            </div>

            {/* Body Content */}
            <div className="portaal-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {renderShopTabBody(activeShopTab)}

            </div>

            <div className="portaal-modal-footer" style={{ padding: '16px 28px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowShopModal(false)}
                style={{ padding: '9px 18px', fontSize: '0.9rem' }}
              >
                Sluiten
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
