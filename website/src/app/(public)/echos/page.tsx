import { getEchos, getSettings } from '@/lib/db'
import type { Metadata } from 'next'
import { Echo } from '@/lib/types'

export const metadata: Metadata = { title: "Kriko Echo | Scouts Kriko-M" }

const MONTHS_NL: Record<number, string> = {
  1:'januari',2:'februari',3:'maart',4:'april',5:'mei',6:'juni',
  7:'juli',8:'augustus',9:'september',10:'oktober',11:'november',12:'december',
}

const TAK_AGES: Record<string, string> = {
  kapoenen: '6 – 8 jaar', welpen: '8 – 11 jaar',
  jonggivers: '11 – 14 jaar', givers: '14 – 17 jaar',
}

const TAKKEN_KEYS = ['kapoenen', 'welpen', 'jonggivers', 'givers']

export default async function EchosPage() {
  const [allEchos, settings] = await Promise.all([getEchos(), getSettings()])
  const takkenData = settings?.takken ?? {}

  const now = new Date()
  const curM = now.getMonth() + 1, curY = now.getFullYear()
  const nxtM = curM === 12 ? 1 : curM + 1, nxtY = curM === 12 ? curY + 1 : curY

  const isVisible = (e: Echo) =>
    (e.month === curM && e.year === curY) || (e.month === nxtM && e.year === nxtY)

  const echosByTak: Record<string, Echo[]> = Object.fromEntries(
    TAKKEN_KEYS.map(k => [k, (allEchos as Echo[]).filter((e: Echo) => e.tak === k && isVisible(e))])
  )

  return (
    <>
      <section className="tak-hero primair hero-echos">
        <div className="container">
          <h1 className="tak-hero-title">Kriko Echo</h1>
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
                    <span className="echo-card-naam">{naam}</span>
                    <span className="echo-card-leeftijd">{TAK_AGES[takKey]}</span>
                    <div className="echo-card-pdfs">
                      {pdfs.length === 0 ? (
                        <p className="echo-card-empty">Momenteel geen editie beschikbaar.</p>
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
