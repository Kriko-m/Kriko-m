import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartProvider from '@/components/shop/CartProvider'
import ScrollRestorer from '@/components/ScrollRestorer'
import ScrollTopButton from '@/components/ScrollTopButton'
import { getSettings } from '@/lib/db'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <CartProvider>
      <ScrollRestorer />
      <Header
        alertActive={settings?.alert_active ?? false}
        alertMessage={settings?.alert_message ?? ''}
      />
      <div className="public-layout-content">
        {children}
      </div>
      <Footer
        contactEmail={settings?.contact_email}
        contactPhone={settings?.contact_phone}
        contactAddress={settings?.contact_address}
      />
      <ScrollTopButton />
    </CartProvider>
  )
}
