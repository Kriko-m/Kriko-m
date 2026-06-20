import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartProvider from '@/components/shop/CartProvider'
import ScrollRestorer from '@/components/ScrollRestorer'
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
      <button className="scroll-top-btn" id="scroll-top-btn" aria-label="Scroll naar boven">
        <i className="fa-solid fa-angles-up"></i>
      </button>
      <ScrollScript />
    </CartProvider>
  )
}

function ScrollScript() {
  return (
    <script dangerouslySetInnerHTML={{ __html: `
      (function() {
        // Scroll-naar-boven knop
        var scrollBtn = document.getElementById('scroll-top-btn');
        if (scrollBtn) {
          window.addEventListener('scroll', function() {
            scrollBtn.classList.toggle('visible', window.scrollY > 400);
          }, { passive: true });
          scrollBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        }
      })();
    ` }} />
  )
}
