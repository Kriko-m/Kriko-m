import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSettings, getEchos } from '@/lib/db'
import type { Metadata } from 'next'
import CopyButton from '@/components/CopyButton'

const TAK_DARK: Record<string, string> = {
  kapoenen:   '#d4780a',
  welpen:     '#1a5216',
  jonggivers: '#8a3200',
  givers:     '#153666',
}

const MONTHS_NL: Record<number, string> = {
  1:'januari',2:'februari',3:'maart',4:'april',5:'mei',6:'juni',
  7:'juli',8:'augustus',9:'september',10:'oktober',11:'november',12:'december',
}

const VALID_TAKKEN = ['kapoenen', 'welpen', 'jonggivers', 'givers']

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!VALID_TAKKEN.includes(slug)) return {}
  const settings = await getSettings()
  const tak = settings?.takken?.[slug]
  return { title: `${tak?.name ?? slug} | Scouts Kriko-M` }
}

export default async function TakPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!VALID_TAKKEN.includes(slug)) notFound()

  const [settings, allEchos] = await Promise.all([getSettings(), getEchos()])
  const tak = settings?.takken?.[slug]
  if (!tak) notFound()

  // 2 meest recente echos voor deze tak (huidige + volgende maand)
  const now = new Date()
  const curM = now.getMonth() + 1, curY = now.getFullYear()
  const nxtM = curM === 12 ? 1 : curM + 1, nxtY = curM === 12 ? curY + 1 : curY

  const recentEchos = allEchos
    .filter((e: any) => e.tak === slug && (
      (e.month === curM && e.year === curY) ||
      (e.month === nxtM && e.year === nxtY)
    ))
    .slice(0, 2)

  const dark = TAK_DARK[slug] ?? '#3a0a14'

  return (
    <>
      <style>{`:root { --tak-color: var(--color-${slug}); --tak-color-dark: ${dark}; }`}</style>

      <section className={`tak-hero ${slug}`}>
        <div className="container">
          <h2 className="tak-hero-title">{tak.name}</h2>
        </div>
      </section>

      <section className="section container">
        <div className="tak-layout">

          {/* Linker kolom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

            {/* Beschrijving */}
            <div style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', padding: 40, border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: 18, color: 'var(--color-primary-dark)' }}>Wie zijn we?</h3>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-dark)', marginBottom: 20 }}>{tak.description}</p>
              <h4 style={{ fontSize: '1.3rem', marginTop: 30, marginBottom: 12, color: 'var(--color-primary-dark)' }}>Programma &amp; Vergaderingen</h4>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Elke zondagochtend verzamelen we aan onze scoutslokalen op het VP-plein van <strong>9:45 tot 12:30</strong> stipt.
                Vergeet niet de maandelijkse planner (Kriko Echo) te downloaden om te zien of we een speciale activiteit hebben!
              </p>
            </div>

            {/* Leiding */}
            <div className="leaders-section">
              <h3 style={{ fontSize: '1.6rem', borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 12, color: 'var(--color-primary-dark)' }}>De Leiding</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: 8 }}>
                Dit team staat elke zondag klaar. Heb je een vraag? Spreek ons gerust aan of stuur een mailtje.
              </p>
              <div className="leaders-grid">
                {(tak.leaders ?? []).map((leader: any) => {
                  const parts = leader.name.split(' ')
                  const initials = parts.length >= 2
                    ? parts[0][0] + parts[parts.length - 1][0]
                    : leader.name.slice(0, 2)
                  return (
                    <div key={leader.name} className="leader-card">
                      <div className="leader-avatar">{initials.toUpperCase()}</div>
                      <h4>{leader.name}</h4>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
                        {leader.role}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Rechter kolom */}
          <div>
            {/* Echo kaart */}
            <div className="side-card" style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--tak-color) 80%, ${dark}), color-mix(in srgb, var(--tak-color) 45%, ${dark}))`,
              color: 'var(--color-bg-white)', border: 'none',
            }}>
              <Link href="/echos" style={{ textDecoration: 'none' }}>
                <h3 style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Kriko Echo <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.7em', opacity: 0.6, marginLeft: 4 }}></i>
                </h3>
              </Link>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', margin: '-4px 0 14px', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: 14 }}>
                Onze maandelijkse planning
              </p>
              <div className="echo-card-pdfs">
                {recentEchos.length === 0 ? (
                  <p className="echo-card-empty" style={{ color: 'rgba(255,255,255,0.7)' }}>Momenteel geen editie beschikbaar.</p>
                ) : (
                  recentEchos.map((echo: any) => (
                    <a key={echo.id} href={`/echos/download/${echo.file_name}`} target="_blank" rel="noopener" className="echo-card-pdf-btn">
                      <span className="echo-pdf-left">
                        <i className="fa-solid fa-file-pdf"></i>
                        <span className="echo-pdf-maand">{MONTHS_NL[echo.month]} {echo.year}</span>
                      </span>
                      <span className="echo-pdf-open">Openen <i className="fa-solid fa-arrow-up-right-from-square"></i></span>
                    </a>
                  ))
                )}
              </div>
            </div>

            {/* Contact kaart */}
            <div className="side-card">
              <h3>Contact</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Vragen aan de leiding?</p>
              <CopyButton
                text={tak.email}
                className="btn btn-outline"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}
              >
                <i className="fas fa-copy"></i> {tak.email}
              </CopyButton>
              {tak.whatsapp_url && (
                <a href={tak.whatsapp_url} target="_blank" rel="noopener"
                   className="btn" style={{ marginTop: 4, width: '100%', background: 'transparent', color: '#25D366', border: '1.5px solid #25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <i className="fab fa-whatsapp" style={{ fontSize: '1.1rem' }}></i> Doe mee op WhatsApp
                </a>
              )}
            </div>

            {/* Uniform kaart */}
            <div className="side-card">
              <h3>Uniform regels</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-text-dark)' }}>{tak.uniform}</p>
              <Link href="/shop" className="tak-card-link" style={{ marginTop: 14, display: 'inline-flex' }}>
                Bestel onze groepsdas &raquo;
              </Link>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
