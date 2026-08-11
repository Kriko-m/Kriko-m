import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getSettings, getEchos } from '@/lib/db'
import type { Metadata } from 'next'
import CopyButton from '@/components/CopyButton'
import WhatsAppJoinButton from '@/components/WhatsAppJoinButton'
import { Echo, Leader } from '@/lib/types'

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

const TAK_TRADITIES: Record<string, { wetTitle: string; wet: string; extraTitle?: string; extra?: React.ReactNode }> = {
  kapoenen: {
    wetTitle: 'De Kapoenenwet',
    wet: 'Ik ben een kapoen en ik probeer mijn best te doen.',
    extraTitle: 'Het Kapoenenlied',
    extra: (
      <div style={{ fontStyle: 'italic', background: 'var(--color-bg-linen)', padding: 18, borderRadius: 'var(--border-radius-md)', fontSize: '0.95rem', borderLeft: '4px solid var(--color-kapoenen)', lineHeight: 1.6 }}>
        1, 2, 3, 4, kapoenen hebben veel plezier, 1, 2, 3, 4, kapoenenland is hier.<br />
        En zonder glimlach bij de hand gaat niemand naar kapoenenland.<br />
        1, 2, 3, 4, kapoenenland is hier.
      </div>
    ),
  },
  welpen: {
    wetTitle: 'De Welpenwet',
    wet: 'Ik zeg wat ik voel, gruwel van vals gezwets,\nIk bereik eerlijk mijn doel, zonder dat ik iemand kwets.\nIk respecteer alles wat leeft en de Kracht die leven geeft.\nIk voel me één, met de wereld om me heen.\nHou niet van nep en deel alles wat ik heb.\nWant niemand is alles, niemand is niets, iedereen is altijd iets.',
    extraTitle: 'Het Welpenlied',
    extra: (
      <div style={{ fontStyle: 'italic', background: 'var(--color-bg-linen)', padding: 18, borderRadius: 'var(--border-radius-md)', fontSize: '0.92rem', borderLeft: '4px solid var(--color-welpen)', lineHeight: 1.6 }}>
        Ja dat zijn wij welpen blij die zingen samen in de rij<br />
        wij spelen graag wij werken graag wij doen ons beste best, wij doen ons beste best.<br />
        Een welpenbroek een bordeaux das, twee groene kousjes voor de was<br />
        een bruine trui vergeet hem niet zo zingen wij graag ons lied.<br />
        Ja dat zijn wij welpen blij die zingen samen in de rij<br />
        wij spelen graag wij werken graag wij doen ons beste best, wij doen ons beste best.<br />
        En dat we van de kriko zijn daar zijn we trots op groot en klein<br />
        en komt ge ons tegen op een keer dan zijn we met eentje meer!<br />
        Ja dat zijn wij welpen blij die zingen samen in de rij<br />
        wij spelen graag wij werken graag wij doen ons beste best, wij doen ons beste best.<br />
        <strong style={{ fontStyle: 'normal' }}>De leiding doet de rest!</strong>
      </div>
    ),
  },
  jonggivers: {
    wetTitle: 'De Jonggiverwet',
    wet: 'Wij zijn jonggivers, wij wagen het avontuur.\nWij zijn eerlijk en delen onze vreugde.\nWij zijn goede kameraden voor elkaar.\nWij willen winnen maar kunnen verliezen.\nWij zijn tot luisteren bereid.\nOnze grootste vreugde is pleziertjes doen.\nWij leven graag in de natuur.\nDe leiding is onze gids.',
    extraTitle: 'Het (Jong)giverlied',
    extra: (
      <div style={{ fontStyle: 'italic', background: 'var(--color-bg-linen)', padding: 18, borderRadius: 'var(--border-radius-md)', fontSize: '0.92rem', borderLeft: '4px solid var(--color-jonggivers)', lineHeight: 1.6 }}>
        Een giver is een puber gezond en weltevree en weltevree.<br />
        Die zingt met volle longen, met alle and&apos;ren mee.<br />
        En onze leuze klinkt &ldquo;wees vaardig&rdquo;, want het leven is een strijd.<br />
        En we vinden het leven aardig, evenwel zijn wij bereid.<br />
        Natuur is onze woning, zo gaan wij hand in hand, in hand, in hand<br />
        ten strijde voor de koning, voor vorst en vaderland.
      </div>
    ),
  },
  givers: {
    wetTitle: 'De Giverwet',
    wet: 'Een giver is oprecht, op zijn of haar woord kan men vertrouwen.\nEen giver is trouw aan de naaste en zichzelf.\nEen giver is vriendelijk en voorkomend, een broeder of zuster voor elke andere giver.\nEen giver is hoffelijk en weet dat de anderen op hem kunnen rekenen.\nEen giver is hulpvaardig en doet geen half werk.\nEen giver is sober en draagt zorg voor het goed van de ander.\nEen giver leeft met open ogen in de natuur.',
    extraTitle: 'Het Giverlied & Buitenlands Kamp',
    extra: (
      <div style={{ fontStyle: 'italic', background: 'var(--color-bg-linen)', padding: 18, borderRadius: 'var(--border-radius-md)', fontSize: '0.92rem', borderLeft: '4px solid var(--color-givers)', lineHeight: 1.6 }}>
        Een giver is een puber gezond en weltevree en weltevree.<br />
        Die zingt met volle longen, met alle and&apos;ren mee.<br />
        En onze leuze klinkt &ldquo;wees vaardig&rdquo;, want het leven is een strijd.<br />
        En we vinden het leven aardig, evenwel zijn wij bereid.<br />
        Natuur is onze woning, zo gaan wij hand in hand, in hand, in hand<br />
        ten strijde voor de koning, voor vorst en vaderland.
      </div>
    ),
  },
}

const TAK_LEADERS: Record<string, Leader[]> = {
  kapoenen: [
    { name: 'Marthe Isik', totem: 'Dageraad rode doortastende Drongo', phone: '+32 470 34 37 20' },
    { name: 'Lies Osselaer' },
    { name: 'Pieter Room', totem: 'Lapis Lazuli Blauw Goud Levenslustige Lori', phone: '+32 479 26 38 48' },
  ],
  welpen: [
    { name: 'Vic Verhaegen', totem: 'Wasabigroene Vindingrijke Mus', phone: '+32 477 21 36 53' },
    { name: 'Lotte Waeckens', totem: 'Asterlila Aimabele Antilope', phone: '+32 479 36 93 14' },
    { name: 'Lotte Cerpentier', totem: 'Ringoogparelmoer Gele Ruimhartige Rayador', phone: '+32 495 99 29 57' },
    { name: 'Yenthe Scholiers', totem: 'Diepspinel Roze Dromerige Dolfijn', phone: '+32 493 96 76 90' },
  ],
  jonggivers: [
    { name: 'Jelle Scholiers', totem: 'Blijmoedige Beo', phone: '+32 491 91 99 90' },
    { name: 'Sara Meyten', totem: 'Wavellietgroene Wilskrachtige Waterwolf', phone: '+32 468 58 09 01' },
    { name: 'Marie Vanesbroek', totem: 'Karmozijn rode karaktervolle Kavka', phone: '+32 468 53 49 81' },
  ],
  givers: [
    { name: 'Thomas Meyten', totem: 'Attente Agoeti', phone: '+32 468 25 88 92' },
    { name: 'Eve Bonza', totem: 'Vulkaanpyriet goud Vurige Vlinder', phone: '+32 465 31 18 81' },
    { name: 'Lucas Van Cleemput', totem: 'Kiene Kia', phone: '+32 468 41 95 02' },
  ],
}

const TAK_DETAILS: Record<string, { title: string; content: React.ReactNode }> = {
  kapoenen: {
    title: 'Wat is een kapoen?',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-dark)' }}>
        <p>
          Kapoenen zijn onze jongste leden van 6 tot 8 jaar. Ze ontdekken al spelend wat het is om scout of gids te zijn.
        </p>
        <p>
          Het leven van een kapoen is vol spel en fantasie. De leiding bedenkt spelen op maat van kapoenen. Wat vinden ze leuk en wat kunnen ze al op die leeftijd?
        </p>
        <p>
          Samen met hun leeftijdsgenootjes leren ze al spelenderwijs omgaan met elkaar, leren ze winnen en verliezen. Maar we zetten hen ook aan om buiten te spelen en te genieten van de natuur in al zijn aspecten.
        </p>
        <p>
          Op het einde van het jaar gaan ze begin augustus gedurende vijf dagen samen op kamp. Hier leven de kinderen samen in hun groep en leren met zichzelf en anderen omgaan.
        </p>
      </div>
    ),
  },
  welpen: {
    title: 'Wat is een welp?',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-dark)' }}>
        <p style={{ margin: 0 }}>Een welp:</p>
        <ul style={{ paddingLeft: 24, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <li>is tussen 8 en 11 jaar,</li>
          <li>zit meestal in 3e, 4e of 5e leerjaar,</li>
          <li>groeit een millimeter per week,</li>
          <li>krijgt er op een jaar drie tanden bij,</li>
          <li>wordt elke week 5 gram zwaarder.</li>
        </ul>
        <p>
          Welpen hebben veel energie. Hun enthousiasme kent soms geen grenzen. Ze bouwen graag kampen, verzinnen een geheime taal en halen kattenkwaad uit. Hun vrienden staan centraal.
        </p>
        <p>
          Samen met hun vrienden ontdekken ze al ravottend hun eigen kunnen en ontwikkelen ze hun vaardigheden. De vaste gewoontes en gebruiken van onze groep versterken het gevoel van verbondenheid met elkaar.
        </p>
        <p>
          Op het einde van het jaar gaan ze begin augustus gedurende zeven dagen samen op kamp. Hier leven de kinderen samen in hun groep en leren met zichzelf en anderen omgaan.
        </p>
      </div>
    ),
  },
  jonggivers: {
    title: 'Wat is een jonggiver?',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-dark)' }}>
        <p>
          Jonggivers zijn tussen 11 en 13 jaar oud.
        </p>
        <p>
          Jonggivers houden van avontuur en steken graag de handen uit de mouwen. Ze vinden het leuk om inspraak te hebben en gaan graag nieuwe uitdagingen aan: vlottentocht, koken op houtvuur, slapen in patrouilletenten. Jonggivers leren samenwerken, engagement tonen en zich inzetten voor anderen. Zo ontdekken ze stilaan wat scouting echt inhoudt en leggen hun belofte met trots af.
        </p>
        <p>
          Jonggivers zitten op de wip tussen kind en puber. Hun leefwereld verandert razendsnel en wordt plots veel complexer. Al die veranderingen zijn soms overweldigend.
        </p>
        <p>
          Op geen enkele leeftijd verschillen kinderen zo fel van elkaar als bij de jonggivers. Bovendien hebben ze vaak schrik om anders te zijn. Vrienden, hun plaats in de groep en de ontwikkeling van hun eigen identiteit en stijl zijn voor jonggivers belangrijk.
        </p>
        <p>
          Op het einde van het jaar gaan ze begin augustus gedurende elf dagen samen op kamp. Hier leven de jongeren samen in hun groep, slapen in tenten en leren stilaan de vaardigheden en technieken van een echte scout.
        </p>
      </div>
    ),
  },
  givers: {
    title: 'Wat is een giver?',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-dark)' }}>
        <p>
          De givers zijn de oudste leden van onze scouts en zijn 14 tot 17 jaar oud. Zelf vinden ze hun eigen leefwereld vaak nogal verwarrend, verrassend, moeilijk te vatten… en dat is meteen ook één van de kenmerken van deze jongeren.
        </p>
        <p>
          Als leiding proberen we toegang te krijgen tot hun leefwereld. En hen zo bij te staan tijdens deze soms moeilijke maar belangrijke periode in hun ontwikkeling tot volwassene.
        </p>
        <p>
          Giver zijn houdt meer in dan enkel activiteiten op zondag, we gaan 1 keer in de drie jaar op buitenlands kamp, organiseren activiteiten om onze kas te spijzen, enz. maar zijn ook al mee verantwoordelijk voor de werking van onze scouts. Giverhulp wordt bijvoorbeeld verwacht op onze eetfestijnen. Maar giver zijn is vooral ook plezier maken met je vrienden, samen leuke ervaringen delen en groeien in de scouts.
        </p>
      </div>
    ),
  },
}

export async function generateStaticParams() {
  return VALID_TAKKEN.map((slug) => ({ slug }))
}

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

  // Combineren van leidinggegevens met totems en telefoonnummers
  const staticLeaders = TAK_LEADERS[slug] ?? []
  const dbLeaders: Leader[] = tak.leaders ?? []
  const leadersToDisplay: Leader[] = staticLeaders.map(sl => {
    const dbMatch = dbLeaders.find((dbl: Leader) => dbl.name.toLowerCase() === sl.name.toLowerCase())
    return {
      name: sl.name,
      role: dbMatch?.role ?? sl.role ?? 'Leid(st)er',
      totem: sl.totem,
      phone: sl.phone,
    }
  })

  // 2 meest recente echos voor deze tak (huidige + volgende maand)
  const now = new Date()
  const curM = now.getMonth() + 1, curY = now.getFullYear()
  const nxtM = curM === 12 ? 1 : curM + 1, nxtY = curM === 12 ? curY + 1 : curY

  const recentEchos = (allEchos as Echo[])
    .filter((e: Echo) => e.tak === slug && (
      (e.month === curM && e.year === curY) ||
      (e.month === nxtM && e.year === nxtY)
    ))
    .slice(0, 2)

  const dark = TAK_DARK[slug] ?? '#3a0a14'

  return (
    <>
      <style>{`:root { --tak-color: var(--color-${slug}); --tak-color-dark: ${dark}; }`}</style>

      <section className={`tak-hero ${slug}`} style={{ position: 'relative', overflow: 'hidden' }}>
        <Image
          src={`/images/banner_${slug}.webp`}
          alt={tak.name}
          className="tak-hero-img"
          fill
          priority
          sizes="100vw"
          quality={85}
          style={{ objectFit: 'cover', zIndex: 1 }}
        />
        <div className="tak-hero-overlay" />
        <div className="container">
          <h2 className="tak-hero-title">{tak.name}</h2>
        </div>
      </section>

      <section className="section container section--no-top" style={{ paddingTop: 40 }}>
        <div className="tak-layout">

          {/* Linker kolom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

            {/* Beschrijving */}
            <div style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', padding: 40, border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: 18, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
                {TAK_DETAILS[slug]?.title ?? `Wat is een ${slug}?`}
              </h3>
              {TAK_DETAILS[slug]?.content ?? (
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-dark)', marginBottom: 0 }}>
                  {tak.description}
                </p>
              )}
            </div>

            {/* Traditie & Belofte */}
            {TAK_TRADITIES[slug] && (
              <div style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', padding: 40, border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: 14, color: 'var(--color-primary-dark)' }}>
                  <i className="fa-solid fa-scroll" style={{ color: 'var(--color-secondary)', marginRight: 10 }}></i>
                  {TAK_TRADITIES[slug].wetTitle}
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--color-text-dark)', marginBottom: 24, fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                  &ldquo;{TAK_TRADITIES[slug].wet}&rdquo;
                </p>

                {TAK_TRADITIES[slug].extraTitle && (
                  <>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: 12, color: 'var(--color-primary-dark)' }}>
                      {TAK_TRADITIES[slug].extraTitle}
                    </h4>
                    {TAK_TRADITIES[slug].extra}
                  </>
                )}
              </div>
            )}

            {/* Leiding */}
            <div className="leaders-section" style={{ position: 'relative', overflow: 'visible' }}>
              
              {/* Schuine Foto aan de RECHTER BOVENHOEK van de Leidingkaart */}
              <div style={{
                position: 'absolute',
                top: 10,
                right: -130,
                zIndex: 10,
                transform: 'rotate(7deg)',
                width: 220,
                transition: 'transform 0.3s ease',
              }}>
                {/* Plakband/Tape Effect */}
                <div style={{
                  position: 'absolute',
                  top: -10,
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-4deg)',
                  width: 70,
                  height: 22,
                  backgroundColor: 'rgba(240, 230, 210, 0.85)',
                  border: '1px solid rgba(200, 190, 170, 0.5)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  zIndex: 12,
                  backdropFilter: 'blur(2px)'
                }} />

                <div style={{
                  backgroundColor: '#fff',
                  padding: 6,
                  borderRadius: 8,
                  boxShadow: '0 12px 28px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderRadius: 5, overflow: 'hidden' }}>
                    <Image
                      src={`/images/leiding_${slug}.jpg`}
                      alt={`Leidingsploeg ${tak.name}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="220px"
                    />
                  </div>
                </div>
              </div>

              {/* Titel en Introductie met vette insprong rechts zodat tekst nooit achter de foto verdwijnt */}
              <div style={{ paddingRight: 120 }}>
                <h3 style={{ fontSize: '1.6rem', borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 12, color: 'var(--color-primary-dark)' }}>
                  De Leiding
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: 8, marginBottom: 24 }}>
                  Dit team staat elke zondag klaar om de tak de tijd van hun leven te bezorgen. Heb je een vraag? Spreek ons gerust aan of bel de leiding!
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
                {leadersToDisplay.map((leader: Leader) => (
                  <div
                    key={leader.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      backgroundColor: 'var(--color-bg-linen)',
                      borderRadius: 'var(--border-radius-md)',
                      border: '1px solid var(--color-border)',
                      gap: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', margin: 0, fontWeight: 700 }}>
                        {leader.name}
                      </h4>
                      {leader.totem && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)', fontStyle: 'italic', margin: '4px 0 0 0' }}>
                          {leader.totem}
                        </p>
                      )}
                    </div>

                    {leader.phone ? (
                      <a
                        href={`tel:${leader.phone.replace(/\s+/g, '')}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          backgroundColor: '#fff',
                          padding: '8px 16px',
                          borderRadius: 'var(--border-radius-md)',
                          border: '1px solid var(--color-border)',
                          textDecoration: 'none',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <i className="fa-solid fa-phone" style={{ color: 'var(--color-secondary)' }}></i>
                        {leader.phone}
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        -
                      </span>
                    )}
                  </div>
                ))}
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
                  recentEchos.map((echo: Echo) => (
                    <a key={echo.id} href={`/api/echos/download/${echo.file_name}`} target="_blank" rel="noopener" className="echo-card-pdf-btn">
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
              <WhatsAppJoinButton
                takName={tak.name}
                whatsappUrl={tak.whatsapp_url || `https://chat.whatsapp.com/placeholder-${slug}`}
              />
            </div>

            {/* Uniform & Webshop kaart */}
            <div className="side-card">
              <h3>Uniform &amp; Webshop</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-text-dark)' }}>
                {tak.uniform}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 10 }}>
                Onze officiële <strong>groepsdas</strong>, <strong>T-shirts</strong> en tweedehands kledij bestel je nu eenvoudig via Katrien in onze vernieuwde online webshop!
              </p>
              <Link href="/shop" className="btn btn-secondary" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>
                <i className="fa-solid fa-cart-shopping" style={{ marginRight: 6 }}></i> Naar de Webshop &raquo;
              </Link>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}

