'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'

interface InfoTabbedContentProps {
  email: string
  address: string
}

type TabType = 'praktisch' | 'takken' | 'uniform' | 'op-maat' | 'faq'

export default function InfoTabbedContent({ email, address }: InfoTabbedContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('praktisch')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab') as TabType | null
      if (tabParam && ['praktisch', 'takken', 'uniform', 'op-maat', 'faq'].includes(tabParam)) {
        setActiveTab(tabParam)
      } else if (window.location.hash) {
        const hash = window.location.hash.replace('#', '') as TabType
        if (['praktisch', 'takken', 'uniform', 'op-maat', 'faq'].includes(hash)) {
          setActiveTab(hash)
        }
      }
    }
  }, [])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tab)
      window.history.replaceState({}, '', url.toString())
    }
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'praktisch', label: 'Praktisch & Werking', icon: 'fa-compass' },
    { id: 'takken', label: 'Onze Takken', icon: 'fa-users' },
    { id: 'uniform', label: 'Uniform & Webshop', icon: 'fa-shirt' },
    { id: 'op-maat', label: 'Scouting op Maat', icon: 'fa-hand-holding-heart' },
    { id: 'faq', label: 'Veelgestelde Vragen', icon: 'fa-circle-question' },
  ]

  const faqItems = [
    {
      q: 'Wanneer vallen de vergaderingen?',
      a: 'Elke zondagochtend van 9:45 tot 12:30 aan ons lokaal op het VP-plein in Sint-Niklaas.'
    },
    {
      q: 'Mag mijn kind eerst eens komen proberen?',
      a: 'Absoluut! Nieuwe leden mogen 3 keer gratis proberen voor ze definitief inschrijven.'
    },
    {
      q: 'Wat moet mijn kind meebrengen naar de vergadering?',
      a: 'Kledij die vuil mag worden, stevige schoenen (of laarzen bij regen) en speelkleren die passen bij het weer.'
    },
    {
      q: 'Waar vind ik het maandprogramma?',
      a: 'In de Kriko Echo (het maandelijkse programmaboekje)! Download de nieuwste editie op de Kriko Echo pagina.'
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Horizontal Navigation Tabs */}
      <div 
        style={{
          display: 'flex',
          gap: 8,
          backgroundColor: 'var(--color-bg-white)',
          padding: 8,
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 'var(--border-radius-md)',
                border: 'none',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--color-text-dark)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            >
              <i className={`fa-solid ${tab.icon}`} style={{ color: isActive ? '#ffffff' : 'var(--color-secondary)' }}></i>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content Cards */}
      <div style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 36, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', minHeight: 380 }}>
        
        {/* TAB 1: Praktisch & Werking */}
        {activeTab === 'praktisch' && (
          <div style={{ animation: 'fadeIn 0.25s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: 12 }}>
                Waarom Kriko-M?
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                Wij zijn <strong>Scouts Kriko-M</strong>, een kleine en gezellige scoutsgroep uit Sint-Niklaas. Onze super geëngageerde leidingsploeg staat elk weekend klaar om uw kleine of iets grotere schavuit de tijd van hun leven te bezorgen. Van een zoektocht naar een verloren piratenschat tot een grote kom soep koken, niets is te zot en iedereen is welkom!
              </p>
            </div>

            {/* 4 Praktische Kernpunten */}
            <div style={{ backgroundColor: 'var(--color-bg-linen)', borderRadius: 'var(--border-radius-md)', padding: 24, border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                  Wanneer?
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Elke zondagochtend van <strong>9:45 tot 12:30</strong> stipt.
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                  Waar?
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Op ons VP-plein (Industriepark-Noord 33, naast drankenhandel De Vidts).
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                  Weekends &amp; Kamp
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  2x per jaar op weekend (herfst- &amp; paasvakantie). Kamp in het eerste deel van augustus!
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                  Eens proberen?
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Nieuwe leden mogen <strong>3 keer gratis proberen</strong> voor definitieve inschrijving.
                </p>
              </div>
            </div>

            {/* Inschrijven vanaf & Leeftijdsvoorwaarde */}
            <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 24, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: 8 }}>
                Vanaf welke leeftijd kan mijn kind lid worden?
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                Iedereen die <strong>6 jaar wordt vóór 1 januari</strong> van het lopende scoutsjaar of reeds in het <strong>eerste leerjaar</strong> zit, kan lid worden van onze scouts. Alle eerstejaars kapoenen zijn dus geboren voor 31 december van dat geboortejaar en/of zitten in het eerste leerjaar.
              </p>
            </div>

            {/* Lidgeld & Financiële Steun */}
            <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 24, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: 8 }}>
                Lidgeld &amp; Verzekering
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                Één jaar scouts kost <strong>€45 per kind</strong>. Dit bedrag gaat rechtstreeks naar de verzekering van uw zoon/dochter en onze wekelijkse werkingskosten. We vinden dat geld voor niemand een reden mag zijn om thuis te blijven. Heb je het financieel wat moeilijker? Dan bieden we met ons <strong>Verminderd Lidgeld (€10 per jaar)</strong> of het <strong>Fonds op Maat</strong> graag steun. Bekijk de mogelijkheden onder het tabblad <em>Scouting op Maat</em>.
              </p>
            </div>

            {/* Hoe lang zit je bij een tak? */}
            <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 24, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: 8 }}>
                Hoe lang zit je in dezelfde tak?
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                Leden blijven in principe <strong>drie jaar bij elke tak</strong> (welpen, jonggivers en givers). Uitzondering op deze regel zijn de <strong>kapoenen</strong>: in deze allerjongste tak zit je <strong>twee jaar</strong> (1e &amp; 2e leerjaar).
              </p>
            </div>

            {/* Benieuwd / Sluit je aan */}
            <div style={{ backgroundColor: 'rgba(101,11,25,0.05)', padding: 24, borderRadius: 'var(--border-radius-md)', borderLeft: '5px solid var(--color-primary)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', margin: 0 }}>
                De smaak te pakken of benieuwd?
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--color-text-dark)', margin: 0 }}>
                Klinkt dit je als muziek in de oren? Sluit je gerust aan bij onze scouts! Stuur een mailtje met de naam en geboortedatum van je kind naar <CopyButton text={email}>{email}</CopyButton>. Wij laten je meteen weten wanneer de volgende vergadering is!
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                <Link href="/inschrijven" className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                  Inschrijven &raquo;
                </Link>
                <button type="button" onClick={() => handleTabChange('op-maat')} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
                  Lees meer over Scouting op Maat &raquo;
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Takken */}
        {activeTab === 'takken' && (
          <div style={{ animation: 'fadeIn 0.25s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: 12 }}>
                Takken, wat is dat?
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                Bij Scouts Kriko-M speel je niet in één grote groep, maar worden de leden opgedeeld volgens leeftijd. Dat noemen we <strong>takken</strong>. Zo sluiten de spelletjes, uitdagingen, technieken en kamplengte naadloos aan bij de leefwereld van elk kind.
              </p>
            </div>

            {/* Grid van 4 Takken Kaarten */}
            <div className="info-takken-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {[
                {
                  slug: 'kapoenen',
                  name: 'Kapoenen',
                  age: '6 tot 8 jaar (1e & 2e leerjaar)',
                  color: 'var(--color-kapoenen, #eab308)',
                  bgTint: 'rgba(234, 179, 8, 0.08)',
                  border: 'rgba(234, 179, 8, 0.4)',
                  img: '/images/tak_kapoenen.jpg',
                  kamp: '5 dagen kamp (in een gebouw)',
                  sfeer: 'Spel, fantasie & de allereerste scoutservaring.',
                  uitleg: 'Bij de kapoenen staat verbeelding en samen spelen centraal. Alles kan en niets moet! Van een zoektocht naar een verloren piratenschat tot knutselen of verkleden. Ze leren de eerste kneepjes van het scoutszijn in een veilige, warme omgeving.',
                },
                {
                  slug: 'welpen',
                  name: 'Welpen',
                  age: '8 tot 11 jaar (3e, 4e & 5e leerjaar)',
                  color: 'var(--color-welpen, #16a34a)',
                  bgTint: 'rgba(22, 163, 74, 0.08)',
                  border: 'rgba(22, 163, 74, 0.4)',
                  img: '/images/tak_welpen.jpg',
                  kamp: '7 dagen kamp (in een gebouw)',
                  sfeer: 'Ravotten in het bos, nesten & scoutstechnieken.',
                  uitleg: 'Welpen duiken vol avontuur het bos in. Ze spelen in kleine groepjes (nesten) en leren samenwerken, geheime geheimtalen ontcijferen, bosspelen spelen en eenvoudige scoutstechnieken op een speelse manier ontdekken.',
                },
                {
                  slug: 'jonggivers',
                  name: 'Jonggivers',
                  age: '11 tot 14 jaar (6e lj & 1e-2e middelbaar)',
                  color: 'var(--color-jonggivers, #ea580c)',
                  bgTint: 'rgba(234, 88, 12, 0.08)',
                  border: 'rgba(234, 88, 12, 0.4)',
                  img: '/images/tak_jonggivers.jpg',
                  kamp: '11 dagen tentenkamp',
                  sfeer: 'Sjorren, tenten opzetten & koken op houtvuur.',
                  uitleg: 'Bij de jonggivers begint het échte outdoor avontuur! Ze leren sjorren met palen en touw, koken maaltijden op hun eigen houtvuur, slapen in tenten op de kampplek en gaan op trektocht met kaart & kompas.',
                },
                {
                  slug: 'givers',
                  name: 'Givers',
                  age: '14 tot 17 jaar (3e, 4e & 5e middelbaar)',
                  color: 'var(--color-givers, #2563eb)',
                  bgTint: 'rgba(37, 99, 235, 0.08)',
                  border: 'rgba(37, 99, 235, 0.4)',
                  img: '/images/tak_givers.jpg',
                  kamp: '11 dagen tentenkamp (1x/3j buitenlands kamp)',
                  sfeer: 'Zelfstandigheid, avontuur & hechte vriendschappen.',
                  uitleg: 'Givers krijgen de vrijheid om hun eigen programma mede te bepalen. Ze gaan uitdagende hikes aan, organiseren grote projecten en vormen een vriendengroep voor het leven. Eens om de 3 jaar trekken ze op buitenlands kamp!',
                },
              ].map((tak) => (
                <div 
                  key={tak.slug}
                  style={{
                    backgroundColor: 'var(--color-bg-linen)',
                    borderRadius: 'var(--border-radius-lg)',
                    border: `2px solid ${tak.border}`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Tak Illustratie Afbeelding */}
                  <div style={{ height: 160, position: 'relative', overflow: 'hidden', borderBottom: `2px solid ${tak.border}` }}>
                    <img 
                      src={tak.img} 
                      alt={`Illustratie ${tak.name}`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        objectPosition: 'center',
                      }} 
                    />
                    <span 
                      style={{ 
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: tak.color, 
                        color: '#ffffff', 
                        fontSize: '0.8rem', 
                        fontWeight: 800, 
                        padding: '5px 12px', 
                        borderRadius: 20,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tak.age}
                    </span>
                  </div>

                  {/* Body met tekst en details */}
                  <div style={{ padding: 22, display: 'flex', flexDirection: 'column', flex: 1, gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: '1.45rem', color: tak.color, margin: '0 0 4px 0', fontWeight: 800 }}>
                        {tak.name}
                      </h3>
                      <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text-dark)', margin: 0 }}>
                        {tak.sfeer}
                      </p>
                    </div>

                    <p style={{ fontSize: '0.94rem', lineHeight: 1.6, color: 'var(--color-text-dark)', margin: 0 }}>
                      {tak.uitleg}
                    </p>

                    <div style={{ backgroundColor: tak.bgTint, padding: '10px 14px', borderRadius: 'var(--border-radius-md)', fontSize: '0.88rem', color: 'var(--color-primary-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                      <span><strong>Zomerkamp:</strong> {tak.kamp}</span>
                    </div>

                    <Link 
                      href={`/takken/${tak.slug}`}
                      className="btn btn-outline"
                      style={{ 
                        fontSize: '0.88rem', 
                        fontWeight: 700,
                        justifyContent: 'center', 
                        borderColor: tak.color, 
                        color: tak.color,
                        marginTop: 4,
                      }}
                    >
                      Meer over de {tak.name} &raquo;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Uniform & Webshop */}
        {activeTab === 'uniform' && (
          <div style={{ animation: 'fadeIn 0.25s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', margin: 0 }}>
              Uniform &amp; Aankoop
            </h2>
            
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
              Met het dragen van het uniform toon je dat je scout of gids bent. Het geeft leden en leiding de mogelijkheid om hun verbondenheid te tonen en laat toch ruimte voor een persoonlijke touch.
            </p>

            <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 24, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                Het uniform bestaat voor iedereen vanaf de jonggivers uit 3 basisstukken: <strong>een das, een scoutshemd en een groene broek of rok</strong>. Kapoenen en welpen hebben geen voorgeschreven uniform: speelkleren die vuil mogen worden zijn ideaal om wekelijks in te ravotten. Wel vragen we om <strong>een das van onze groep</strong> aan te kopen. Op deze manier zijn onze leden voor iedereen herkenbaar.
              </p>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                Verder hebben we een T-shirt en trui (maten vanaf de jonggivers) met ons eigen logo, deze zijn zeker geen verplicht uniformstuk. Alle kledingsstukken kan je kopen in een <a href="https://www.hopper.be/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--color-primary)', fontWeight: 600 }}>Hopper winkel</a>, tijdens de jaarlijkse BBQ of bij uniformouder <strong>Katrien Vanhandenhoven</strong> (0476/89.57.47 - <CopyButton text="kat_vh@hotmail.com">kat_vh@hotmail.com</CopyButton>).
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 22, borderRadius: 'var(--border-radius-md)', border: '2px solid var(--color-secondary)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginBottom: 8 }}>
                  Onze Webshop
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                  Bestel de officiële <strong>groepsdas (bordeaux-beige)</strong>, Kriko T-shirts/truien en tweedehands uniformstukken rechtstreeks via onze webshop!
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', marginBottom: 16 }}>
                  Contact Katrien: <CopyButton text="kat_vh@hotmail.com">kat_vh@hotmail.com</CopyButton><br />
                  0476/89.57.47
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <Link href="/shop" className="btn btn-secondary" style={{ fontSize: '0.9rem', width: '100%', justifyContent: 'center' }}>
                    Naar onze Webshop &raquo;
                  </Link>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 22, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginBottom: 8 }}>
                  Hopper Scoutswinkel
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                  Het beige scoutshemd, de groene broek/rok en de kentekens koop je in een officiële Hopper winkel of online.
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <a href="https://www.hopper.be" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}>
                    Bezoek Hopper.be &raquo;
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Scouting op Maat */}
        {activeTab === 'op-maat' && (
          <div style={{ animation: 'fadeIn 0.25s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', margin: 0 }}>
              Scouting op Maat
            </h2>
            
            <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 24, borderRadius: 'var(--border-radius-md)', borderLeft: '5px solid var(--color-secondary)' }}>
              <p style={{ fontSize: '1.08rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0, fontStyle: 'italic' }}>
                We weten dat de prijs van een jaar scouting voor uw kind(eren) een belangrijke hap uit uw gezinsbudget kan zijn. Maar we vinden ook dat dit voor niemand een reden mag zijn om thuis te blijven.
              </p>
            </div>

            {/* Large Content Box 1: Verminderd Lidgeld */}
            <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 28, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: 12 }}>
                Verminderd Lidgeld
              </h3>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                We vragen jaarlijks om voor elk kind lidgeld te betalen. Dankzij dit bedrag is uw zoon/dochter verzekerd tijdens onze scoutsactiviteiten. Een ander deel van dit bedrag gaat naar de algemene werkingskosten. We begrijpen dat dit lidgeld voor u misschien een groot bedrag is om te betalen. Wij hebben dan ook de mogelijkheid om hierop een korting te bieden, voor wie dit nodig heeft. Je betaalt dan <strong>€10 voor het gehele scoutsjaar</strong> (na 1 maart: <strong>€5</strong>). Spreek hiervoor simpelweg een (groeps)leid(st)er aan!
              </p>
            </div>

            {/* Large Content Box 2: Voordelen bij Ziekenfondsen */}
            <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 28, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: 12 }}>
                Voordelen bij Ziekenfondsen
              </h3>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--color-text-dark)', marginBottom: 16 }}>
                Mutualiteiten dragen vaak ook bij aan de kosten van vrijetijdsbesteding van uw kinderen. Welke voordelen dit precies zijn, hangt af van bij welk ziekenfonds u bent. Klik op het juiste ziekenfonds om meer informatie te verkrijgen omtrent terugbetalingen:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <a href="http://www.cm.be/diensten-en-voordelen/vakantie-en-vrije-tijd/vrije-tijd/jeugdvereniging.jsp" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                  CM &raquo;
                </a>
                <a href="https://www.oz.be/vakantie/voordelen/jeugdbewegingskampen" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                  Helan / OZ &raquo;
                </a>
                <a href="http://www.bondmoyson.be/ovl/voordelen-advies/terugbetalingen-ledenvoordelen/terugbetalingen-voordelen/vrije-tijd/jongerenvoordeel/Pages/Speelplein-en-vakanties.aspx" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                  Solidaris / Bond Moyson &raquo;
                </a>
                <a href="http://www.lm.be/Oost-Vlaanderen/Rubrieken/Voordelen-en-diensten/Kinderen-en-jongeren/jeugdbeweging/Pages/DefaultArticle.aspx" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                  Liberale Mutualiteit &raquo;
                </a>
              </div>
            </div>

            {/* Large Content Box 3: Belastingvoordelen */}
            <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 28, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: 12 }}>
                Belastingsvoordelen
              </h3>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                De kostprijs voor kampen en weekends van alle kinderen jonger dan 12 jaar kan door middel van een fiscaal attest afgetrokken worden van de belastingen. Hiervoor moet de groepsleiding het <em>‘Attest inzake uitgaven voor de opvang van kinderen’</em> invullen en aan u bezorgen. U moet dit formulier dan bij uw belastingaangifte voegen. Stuur een mailtje naar <CopyButton text={email}>{email}</CopyButton> indien u interesse heeft.
              </p>
            </div>

            {/* Large Content Box 4: Fonds op Maat (Updated System) */}
            <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 28, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: 12 }}>
                Fonds op Maat
              </h3>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--color-text-dark)', marginBottom: 12 }}>
                Voor activiteiten zoals uitstappen, weekends en kampen kan er gebruik gemaakt worden van <strong>Fonds op Maat</strong>. Het kostenplaatje wordt verdeeld volgens de derdenregel: <strong>1/3 door het gezin, 1/3 door Scouts Kriko-M en 1/3 door Scouts &amp; Gidsen Vlaanderen</strong>.
              </p>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                Ouders of leden hoeven hiervoor zelf geen formulieren in te vullen; je kan hiervoor gewoon een mailtje sturen naar de leiding of groepsleiding, of hen persoonlijk aanspreken. Zij regelen de administratieve aanvraag dan discreet voor jou!
              </p>
            </div>

            {/* Large Content Box 5: Uniform en Materiaal */}
            <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 28, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: 12 }}>
                Uniform en Materiaal
              </h3>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                Ook een uniform kan daarnaast ook een grote uitgave zijn. Wij verwachten dan ook niet dat iedereen het volledige scoutsuniform aankoopt. Bij de kapoenen en welpen, vragen we een das van onze scouts aan te kopen. Vanaf de jonggivers vragen we ook een T-shirt aan te kopen, daarnaast bieden we ook truien aan vanaf deze leeftijd. Deze kleren bieden we ook tweedehands aan. Als je meer wilt weten over de maten die we momenteel beschikbaar hebben, stuur gerust een mailtje naar <CopyButton text={email}>{email}</CopyButton>.
              </p>
            </div>

          </div>
        )}

        {/* TAB 5: Veelgestelde Vragen (Accordion) */}
        {activeTab === 'faq' && (
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: 16 }}>
              Veelgestelde Vragen
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {faqItems.map((item, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div 
                    key={idx}
                    style={{
                      backgroundColor: 'var(--color-bg-linen)',
                      borderRadius: 'var(--border-radius-md)',
                      border: '1px solid var(--color-border)',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      type="button"
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        outline: 'none',
                      }}
                    >
                      <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                        {item.q}
                      </span>
                      <i 
                        className={`fa-solid fa-chevron-down`}
                        style={{
                          color: 'var(--color-text-muted)',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s ease',
                        }}
                      ></i>
                    </button>

                    {isOpen && (
                      <div style={{ padding: '0 20px 18px 20px', borderTop: '1px solid var(--color-border)', marginTop: -4, paddingTop: 12 }}>
                        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-muted)', margin: 0 }}>
                          {item.a}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
