import Link from 'next/link'

interface FooterProps {
  contactEmail?: string
  contactAddress?: string
}

export default function Footer({
  contactEmail: _contactEmail = 'groepsleiding@kriko-m.be',
  contactAddress = 'Industriepark-Noord 33, 9100 Sint-Niklaas',
}: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">

        {/* Kolom 1: Merk */}
        <div className="footer-col footer-col-brand">
          <span className="footer-brand-name">Kriko-M</span>
          <span className="footer-brand-sub">Scouts &mdash; Sint-Niklaas</span>
          <div className="footer-brand-divider"></div>
          <span className="footer-brand-desc">Elke zondag paraat op het VP-plein!</span>
          <span className="footer-social-label">Volg ons</span>
          <div className="footer-social">
            <a href="https://www.facebook.com/ScoutsKrikoM/" target="_blank" rel="noopener" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com/scouts_kriko_m/" target="_blank" rel="noopener" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Kolom 2: Quick links */}
        <div className="footer-col">
          <span className="footer-col-title">Quick links</span>
          <ul className="footer-links">
            <li><Link href="/">Homepage</Link></li>
            <li><Link href="/kalender">Kalender</Link></li>
            <li><Link href="/echos">Kriko Echo</Link></li>
            <li><Link href="/verhuur">Verhuur lokaal</Link></li>
            <li><Link href="/shop">Webshop</Link></li>
            <li><Link href="/inschrijven">Inschrijven</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Takken */}
        <div className="footer-col">
          <span className="footer-col-title">Takken</span>
          <ul className="footer-links">
            <li><Link href="/takken/kapoenen">Kapoenen</Link></li>
            <li><Link href="/takken/welpen">Welpen</Link></li>
            <li><Link href="/takken/jonggivers">Jonggivers</Link></li>
            <li><Link href="/takken/givers">Givers</Link></li>
          </ul>
        </div>

        {/* Kolom 4: Contact */}
        <div className="footer-col">
          <span className="footer-col-title">Contact</span>
          <Link href="/contact" className="footer-contact-btn">
            <i className="fas fa-envelope"></i> Contacteer ons
          </Link>
          <ul className="footer-links">
            <li style={{ color: '#bbb', fontSize: '0.85rem' }}>{contactAddress}</li>
          </ul>
        </div>

      </div>

      <div className="site-footer-bottom">
        <span>&copy; {year} Scouts Kriko-M Sint-Niklaas</span>
        <span className="footer-legal-links">
          <Link href="/portaal">Login</Link>
          <span aria-hidden="true">&middot;</span>
          <Link href="/privacy">Privacyverklaring</Link>
          <span aria-hidden="true">&middot;</span>
          <Link href="/voorwaarden">Verkoopsvoorwaarden</Link>
        </span>
      </div>
    </footer>
  )
}
