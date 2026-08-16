'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import CopyButton from '@/components/CopyButton'
import WhatsAppJoinButton from '@/components/WhatsAppJoinButton'
import EditableBlock from '@/components/editing/EditableBlock'
import EditLeidingModal from '@/components/editing/EditLeidingModal'
import { Echo, Leader } from '@/lib/types'

const MONTHS_NL: Record<number, string> = {
  1:'januari',2:'februari',3:'maart',4:'april',5:'mei',6:'juni',
  7:'juli',8:'augustus',9:'september',10:'oktober',11:'november',12:'december',
}

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

const FULL_TAK_DETAILS_TEXT: Record<string, { title: string; defaultContent: string }> = {
  kapoenen: {
    title: 'Wat is een kapoen?',
    defaultContent: `Kapoenen zijn onze jongste leden van 6 tot 8 jaar. Ze ontdekken al spelend wat het is om scout of gids te zijn.

Het leven van een kapoen is vol spel en fantasie. De leiding bedenkt spelen op maat van kapoenen. Wat vinden ze leuk en wat kunnen ze al op die leeftijd?

Samen met hun leeftijdsgenootjes leren ze al spelenderwijs omgaan met elkaar, leren ze winnen en verliezen. Maar we zetten hen ook aan om buiten te spelen en te genieten van de natuur in al zijn aspecten.

Op het einde van het jaar gaan ze begin augustus gedurende vijf dagen samen op kamp. Hier leven de kinderen samen in hun groep en leren met zichzelf en anderen omgaan.`,
  },
  welpen: {
    title: 'Wat is een welp?',
    defaultContent: `Een welp:
• is tussen 8 en 11 jaar,
• zit meestal in 3e, 4e of 5e leerjaar,
• groeit een millimeter per week,
• krijgt er op een jaar drie tanden bij,
• wordt elke week 5 gram zwaarder.

Welpen hebben veel energie. Hun enthousiasme kent soms geen grenzen. Ze bouwen graag kampen, verzinnen een geheime taal en halen kattenkwaad uit. Hun vrienden staan centraal.

Samen met hun vrienden ontdekken ze al ravottend hun eigen kunnen en ontwikkelen ze hun vaardigheden. De vaste gewoontes en gebruiken van onze groep versterken het gevoel van verbondenheid met elkaar.

Op het einde van het jaar gaan ze begin augustus gedurende zeven dagen samen op kamp. Hier leven de kinderen samen in hun groep en leren met zichzelf en anderen omgaan.`,
  },
  jonggivers: {
    title: 'Wat is een jonggiver?',
    defaultContent: `Jonggivers zijn tussen 11 en 13 jaar oud.

Jonggivers houden van avontuur en steken graag de handen uit de mouwen. Ze vinden het leuk om inspraak te hebben en gaan graag nieuwe uitdagingen aan: vlottentocht, koken op houtvuur, slapen in patrouilletenten. Jonggivers leren samenwerken, engagement tonen en zich inzetten voor anderen. Zo ontdekken ze stilaan wat scouting echt inhoudt en leggen hun belofte met trots af.

Jonggivers zitten op de wip tussen kind en puber. Hun leefwereld verandert razendsnel en wordt plots veel complexer. Al die veranderingen zijn soms overweldigend.

Op geen enkele leeftijd verschillen kinderen zo fel van elkaar als bij de jonggivers. Bovendien hebben ze vaak schrik om anders te zijn. Vrienden, hun plaats in de groep en de ontwikkeling van hun eigen identiteit en stijl zijn voor jonggivers belangrijk.

Op het einde van het jaar gaan ze begin augustus gedurende elf dagen samen op kamp. Hier leven de jongeren samen in hun groep, slapen in tenten en leren stilaan de vaardigheden en technieken van een echte scout.`,
  },
  givers: {
    title: 'Wat is een giver?',
    defaultContent: `De givers zijn de oudste leden van onze scouts en zijn 14 tot 17 jaar oud. Zelf vinden ze hun eigen leefwereld vaak nogal verwarrend, verrassend, moeilijk te vatten… en dat is meteen ook één van de kenmerken van deze jongeren.

Als leiding proberen we toegang te krijgen tot hun leefwereld. En hen zo bij te staan tijdens deze soms moeilijke maar belangrijke periode in hun ontwikkeling tot volwassene.

Giver zijn houdt meer in dan enkel activiteiten op zondag, we gaan 1 keer in de drie jaar op buitenlands kamp, organiseren activiteiten om onze kas te spijzen, enz. maar zijn ook al mee verantwoordelijk voor de werking van onze scouts. Giverhulp wordt bijvoorbeeld verwacht op onze eetfestijnen. Maar giver zijn is vooral ook plezier maken met je vrienden, samen leuke ervaringen delen en groeien in de scouts.`,
  },
}

const TAK_UNIFORM: Record<string, string> = {
  kapoenen: 'Voor de kapoenen bestaat het uniform enkel uit een groepsdas (bordeaux-beige). Een T-shirt of trui van onze scouts is ook altijd leuk om te dragen!',
  welpen: 'Bij de welpen bestaat het uniform uit een groepsdas (bordeaux-beige). Een T-shirt of trui van Kriko-M is zeker een fijne extra!',
  jonggivers: 'Vanaf de jonggivers dragen we het echte scoutsuniform: een groepsdas (bordeaux-beige), een scoutshemd en een groene scoutsbroek of -rok.',
  givers: 'Bij de givers dragen we het volledige scoutsuniform: de groepsdas (bordeaux-beige), een scoutshemd en een groene scoutsbroek of -rok.',
}

interface Props {
  slug: string
  takName: string
  takDescription: string
  takEmail: string
  takWhatsapp: string
  takPhotoSrc: string | null
  leadersToDisplay: Leader[]
  recentEchos: Echo[]
  dark: string
  siteContent?: Record<string, { title?: string; content?: string; image_url?: string }>
}

function TakPageClientContent({
  slug,
  takName,
  takDescription: _takDescription,
  takEmail,
  takWhatsapp,
  takPhotoSrc,
  leadersToDisplay,
  recentEchos,
  dark,
  siteContent = {},
}: Props) {

  const router = useRouter()
  const searchParams = useSearchParams()

  const [isGroepsleiding, setIsGroepsleiding] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLeidingModalOpen, setIsLeidingModalOpen] = useState(false)

  useEffect(() => {
    const editQuery = searchParams.get('edit') === 'true'
    const storedEdit = Boolean(
      typeof window !== 'undefined' &&
      (sessionStorage.getItem('kriko_edit_mode') === 'true' || localStorage.getItem('kriko_edit_mode') === 'true')
    )
    setIsEditMode(editQuery || storedEdit)

    fetch('/api/admin/check-groepsleiding')
      .then(res => res.json())
      .then(data => setIsGroepsleiding(Boolean(data.isGroepsleiding)))
      .catch(() => setIsGroepsleiding(false))
  }, [searchParams])

  const canEdit = isGroepsleiding && isEditMode

  // Dynamic overrides from siteContent with FULL DEFAULT TEXT fallback
  const descBlock = siteContent[`takken.${slug}.description`]
  const fallbackInfo = FULL_TAK_DETAILS_TEXT[slug] || { title: `Wat is een ${takName}?`, defaultContent: '' }
  const customTitle = descBlock?.title || fallbackInfo.title
  const customContent = descBlock?.content || fallbackInfo.defaultContent

  const tradBlock = siteContent[`takken.${slug}.traditie`]
  const wetTitle = tradBlock?.title || TAK_TRADITIES[slug]?.wetTitle || 'De Scoutswet'
  const wetText = tradBlock?.content || TAK_TRADITIES[slug]?.wet || ''

  const uniBlock = siteContent[`takken.${slug}.uniform`]
  const uniformText = uniBlock?.content || TAK_UNIFORM[slug] || ''

  return (
    <>
      <style>{`:root { --tak-color: var(--color-${slug}); --tak-color-dark: ${dark}; }`}</style>

      {/* Hero Header */}
      <section className={`tak-hero ${slug}`} style={{ position: 'relative', overflow: 'hidden' }}>
        <Image
          src={`/images/banner_${slug}.webp`}
          alt={takName}
          className="tak-hero-img"
          fill
          priority
          sizes="100vw"
          quality={85}
          style={{ objectFit: 'cover', zIndex: 1 }}
        />
        <div className="tak-hero-overlay" />
        <div className="container">
          <h2 className="tak-hero-title">{takName}</h2>
        </div>
      </section>

      <section className="section container section--no-top" style={{ paddingTop: 40 }}>
        <div className="tak-layout">

          {/* Linker kolom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

            {/* 1. Beschrijving Block (FULL EDITABLE TEXT) */}
            <EditableBlock
              blockKey={`takken.${slug}.description`}
              page="takken"
              section={slug}
              blockType="text_only"
              initialTitle={customTitle}
              initialContent={customContent}
            >
              <div style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', padding: 40, border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: 18, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
                  {customTitle}
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-dark)', marginBottom: 0, whiteSpace: 'pre-line' }}>
                  {customContent}
                </p>
              </div>
            </EditableBlock>

            {/* 2. Traditie & Belofte Block */}
            {TAK_TRADITIES[slug] && (
              <EditableBlock
                blockKey={`takken.${slug}.traditie`}
                page="takken"
                section={slug}
                blockType="text_only"
                initialTitle={wetTitle}
                initialContent={wetText}
              >
                <div style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', padding: 40, border: '1px solid var(--color-border)' }}>
                  <h3 style={{ fontSize: '1.6rem', marginBottom: 14, color: 'var(--color-primary-dark)' }}>
                    <i className="fa-solid fa-scroll" style={{ color: 'var(--color-secondary)', marginRight: 10 }}></i>
                    {wetTitle}
                  </h3>
                  <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--color-text-dark)', marginBottom: 24, fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                    &ldquo;{wetText}&rdquo;
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
              </EditableBlock>
            )}

            {/* 3. Leiding Section & Foto (Met specifieke Leiding Beheer Knop) */}
            <div className="leaders-section" style={{ position: 'relative', overflow: 'visible' }}>
              
              {/* Groepsleiding EDIT Button voor Leidingsploeg & Foto */}
              {canEdit && (
                <button
                  onClick={() => setIsLeidingModalOpen(true)}
                  type="button"
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: takPhotoSrc ? 230 : 10,
                    zIndex: 999,
                    backgroundColor: '#1A3D2A',
                    color: '#C9963A',
                    border: '1.5px solid #C9963A',
                    borderRadius: 20,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                  }}
                >
                  ✏️ Leidingsploeg &amp; Foto Bewerken
                </button>
              )}

              {/* Schuine Foto aan de RECHTER BOVENHOEK van de Leidingkaart */}
              {takPhotoSrc && (
                <div style={{
                  position: 'absolute',
                  top: 10,
                  right: -130,
                  zIndex: 10,
                  transform: 'rotate(7deg)',
                  width: 220,
                  transition: 'transform 0.3s ease',
                }}>
                  {/* Tape Effect */}
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
                        src={takPhotoSrc}
                        alt={`Leidingsploeg ${takName}`}
                        fill
                        unoptimized
                        style={{ objectFit: 'cover' }}
                        sizes="220px"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Titel en Introductie */}
              <div style={{ paddingRight: takPhotoSrc ? 120 : 0 }}>
                <h3 style={{ fontSize: '1.6rem', borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 12, color: 'var(--color-primary-dark)' }}>
                  De Leiding
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: 8, marginBottom: 24 }}>
                  Dit team staat elke zondag klaar om de tak de tijd van hun leven te bezorgen. Heb je een vraag? Spreek ons gerust aan of bel de leiding!
                </p>
              </div>

              {/* Lijst van Leiding */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
                {leadersToDisplay.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0, padding: '12px 0' }}>
                    Er is momenteel geen leiding ingesteld voor deze tak.
                  </p>
                ) : (
                  leadersToDisplay.map((leader: Leader) => (
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
                  ))
                )}
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
                text={takEmail}
                variant="button"
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}
              >
                {takEmail} <i className="fa-regular fa-copy" style={{ fontSize: '0.85em', opacity: 0.7 }}></i>
              </CopyButton>
              <WhatsAppJoinButton
                takName={takName}
                whatsappUrl={takWhatsapp || `https://chat.whatsapp.com/placeholder-${slug}`}
              />
            </div>

            {/* Uniform & Webshop kaart */}
            <EditableBlock
              blockKey={`takken.${slug}.uniform`}
              page="takken"
              section={slug}
              blockType="text_only"
              initialTitle="Uniform & Webshop"
              initialContent={uniformText}
            >
              <div className="side-card">
                <h3>Uniform &amp; Webshop</h3>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--color-text-dark)', marginBottom: 16, whiteSpace: 'pre-line' }}>
                  {uniformText}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/shop" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    <i className="fa-solid fa-cart-shopping" style={{ marginRight: 6 }}></i> Kriko-M Webshop
                  </Link>
                  <a
                    href="https://www.hopper.be/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginRight: 6 }}></i> Naar Hopper Winkel
                  </a>
                </div>
              </div>
            </EditableBlock>

          </div>

        </div>
      </section>

      {/* Leiding Edit Modal */}
      {isLeidingModalOpen && (
        <EditLeidingModal
          slug={slug}
          takName={takName}
          initialPhoto={takPhotoSrc}
          initialLeaders={leadersToDisplay}
          onClose={() => setIsLeidingModalOpen(false)}
          onSaved={() => {
            router.refresh()
          }}
        />
      )}
    </>
  )
}

export default function TakPageClient(props: Props) {
  return (
    <Suspense fallback={null}>
      <TakPageClientContent {...props} />
    </Suspense>
  )
}
