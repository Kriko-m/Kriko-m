import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartProvider from '@/components/shop/CartProvider'
import ScrollRestorer from '@/components/ScrollRestorer'
import ScrollTopButton from '@/components/ScrollTopButton'
import EditModeBar from '@/components/editing/EditModeBar'
import { getSettings } from '@/lib/db'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <CartProvider>
      <ScrollRestorer />
      <Suspense fallback={null}>
        <EditModeBar />
      </Suspense>
      <Header />
      <div className="public-layout-content">
        {children}
      </div>
      <Footer
        contactEmail={settings?.contact_email}
        contactAddress={settings?.contact_address}
      />
      <ScrollTopButton />
    </CartProvider>
  )
}

