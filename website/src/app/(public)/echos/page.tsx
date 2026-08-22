import { getEchos, getSettings, getSiteContent } from '@/lib/db'
import type { Metadata } from 'next'
import { Echo } from '@/lib/types'
import EditableText from '@/components/editing/EditableText'

export const metadata: Metadata = { title: "Kriko Echo" }

const MONTHS_NL: Record<number, string> = {
  1:'januari',2:'februari',3:'maart',4:'april',5:'mei',6:'juni',
  7:'juli',8:'augustus',9:'september',10:'oktober',11:'november',12:'december',
}

const TAKKEN_KEYS = ['kapoenen', 'welpen', 'jonggivers', 'givers']

export default async function EchosPage() {
  const [allEchos, settings, siteContent] = await Promise.all([
    getEchos(),
    getSettings(),
    getSiteContent(),
  ])

  const takkenData = settings?.takken ?? {}
  const heroBlock = siteContent['echos.hero'] || {}
  const heroTitle = heroBlock.title || 'Kriko Echo'

  const now = new Date()
  const curM = now.getMonth() + 1, curY = now.getFullYear()
  const nxtM = curM === 12 ? 1 : curM + 1, nxtY = curM === 12 ? curY + 1 : curY

  const isVisible = (e: Echo) =>
    (e.month === curM && e.year === curY) || (e.month === nxtM && e.year === nxtY)

  const echosByTak: Record<string, Echo[]> = Object.fromEntries(
    TAKKEN_KEYS.map(k => [
      k,
      (allEchos as Echo[])
        .filter((e: Echo) => e.tak === k && isVisible(e))
        .sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month))
    ])
  )

  return (
    <>
      <section className="tak-hero primair hero-echos">
        <div className="container">
          <EditableText
            blockKey="echos.hero"
            page="echos"
            section="hero"
            field="title"
            defaultValue={heroTitle}
            as="h1"
            className="tak-hero-title"
          />
        </div>
      </section>

      <div className="echo-page-wrap">
        <div className="echo-grid-wrap">
          <div className="echo-grid">
            {TAKKEN_KEYS.map(takKey => {
              const naam = takkenData[takKey]?.name ?? takKey
              const pdfs = echosByTak[takKey]
              return (
                <div key={takKey} className={`echo-card echo-card-${takKey}`}>
                  <div className="echo-card-inner">
                    <EditableText
                      blockKey={`echos.tak.${takKey}.naam`}
                      page="echos"
                      section="card"
                      defaultValue={naam}
                      as="span"
                      className="echo-card-naam"
                    />
                    <div className="echo-card-pdfs">
                      {pdfs.length === 0 ? (
                        <p className="echo-card-empty">
                          Momenteel geen editie beschikbaar.
                        </p>
                      ) : (
                        pdfs.map((echo: Echo) => (
                          <a
                            key={echo.id}
                            href={`/api/echos/download/${echo.file_name}`}
                            target="_blank"
                            rel="noopener"
                            className="echo-card-pdf-btn"
                          >
                            <span className="echo-pdf-left">
                              <i className="fa-solid fa-file-pdf"></i>
                              <span className="echo-pdf-maand">{MONTHS_NL[echo.month]} {echo.year}</span>
                            </span>
                            <span className="echo-pdf-open">
                              Openen <i className="fa-solid fa-arrow-up-right-from-square"></i>
                            </span>
                          </a>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
