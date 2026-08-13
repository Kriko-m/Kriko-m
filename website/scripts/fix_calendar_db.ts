import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcvrjpbbybkasppgjiyh.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function fixCalendar() {
  console.log('Fixing calendar events in Supabase...')

  // 1. Delete August events as requested by user
  const augustIds = ['cal_zomerbar_2026', 'cal_opfrisdag_2026', 'cal_zomerslot_2026']
  await admin.from('calendar').delete().in('id', augustIds)
  console.log('Deleted 3 August events.')

  // 2. Delete duplicate created events
  const duplicateIds = [
    'cal_bbq_2026', 'cal_souphe_2027', 'cal_bidong_2027', 'cal_districtsdag_2027',
    'cal_groepsuitstap_2027', 'cal_kampvoorstelling_2027', 'cal_familiedag_2026',
    'cal_halloween_2026', 'cal_sint_2026', 'cal_ouders_2027'
  ]
  await admin.from('calendar').delete().in('id', duplicateIds)
  console.log('Deleted duplicate created event IDs.')

  // 3. Update ACTUAL existing DB events with full rich data, banners, links, flyers
  const updates = [
    {
      id: 'cal_f9827fef-e398-49e3-bb5c-cf8697e9f72d', // Overgang (2026-09-05)
      title: 'Overgang & Feestelijke Start',
      banner_image: 'https://www.kriko-m.be/wp-content/uploads/2025/06/GROEPSUITSTAP-2025-724x1024.png',
      description: 'De traditionele overgang naar de nieuwe takken om het werkjaar feestelijk te starten! We verwelkomen alle leden in hun nieuwe tak met een spectaculair overgangsspel en een gezellig samenzijn.',
      time: '14:00 - 17:30',
      location: 'Scoutslokalen Kriko-M, VP-Plein',
      facebook_event_url: 'https://www.facebook.com/ScoutsKrikoM',
    },
    {
      id: 'cal_fdc37fda-9fb8-4077-8e66-fb5831151b3d', // Groeps BBQ (2026-09-18)
      title: 'Groeps BBQ & KUBB-Toernooi',
      banner_image: 'https://www.kriko-m.be/wp-content/uploads/2025/08/528193945_1109483500529325_5681295269648299945_n-1024x403.jpg',
      description: 'Kriko-M organiseert weer zijn jaarlijkse BBQ en we hebben jou daar heel graag bij! Om 16u start het KUBB-toernooi (spelplezier voor jong en oud) en het speeldorp van de givers. Om 18u start de BBQ met aansluitend een gezellig kampvuur, leidingsactjes en feest met DJ Benny!',
      time: '16:00 - 23:30',
      location: 'Scoutslokalen Kriko-M, VP-Plein',
      facebook_event_url: 'https://www.facebook.com/events/1109483500529325',
      facebook_post_url: 'https://www.facebook.com/ScoutsKrikoM/posts/1109483500529325',
      document_url: 'https://www.kriko-m.be/wp-content/uploads/2025/08/528193945_1109483500529325_5681295269648299945_n.jpg',
      external_link_url: 'https://www.kriko-m.be/',
    },
    {
      id: 'cal_b04cf3e2-37b3-4077-a6ad-699285ad6c3b', // Takweekendjes (2026-10-23)
      title: 'Takweekendjes (Herfst)',
      banner_image: 'https://www.kriko-m.be/wp-content/uploads/2025/11/Scherm%C2%ADafbeelding-2025-11-06-om-19.48.19-793x1024.png',
      description: 'Het allereerste weekendje van het scoutsjaar met je eigen tak! Drie dagen vol avontuur, spellen in het bos en samen slapen in de lokalen.',
      time: 'Vrijdag 19:00 - Zondag 14:00',
      location: 'Diverse kamplocaties per tak',
      facebook_event_url: 'https://www.facebook.com/ScoutsKrikoM',
    },
    {
      id: 'cal_b91910c5-a91a-426e-9950-9c12867166a1', // Sintvergadering (2026-12-06)
      title: 'Sintvergadering & Snoepfeest',
      description: 'Hij komt, hij komt! Sinterklaas en zijn Zwarte Pieten brengen een bezoek aan onze lokalen. Breng je mooiste tekening mee en geniet van heerlijke speculaas en mandarines.',
      time: '14:00 - 17:00',
      location: 'Scoutslokalen Kriko-M',
      facebook_event_url: 'https://www.facebook.com/ScoutsKrikoM',
    },
    {
      id: 'cal_19409e88-e6da-41a1-a180-6c98d387f692', // Souphé (2027-02-13)
      title: 'Souphé 2027 (Nieuwjaarsdrink)',
      banner_image: 'https://www.kriko-m.be/wp-content/uploads/2026/01/611180469_886620700982324_567087133102833330_n-1-819x1024.png',
      description: 'Naar goede gewoonte zetten we het nieuwe jaar gezellig in met onze Souphé, olé! Heerlijke soep à volonté bereid door ouders en oud-leiding. Giverbar met drankjes en kleine versnaperingen. We verzamelen om 12u voor een halfuurtje pleinspelletjes en klinken vanaf 12u30 bij een knapperend vuurtje met een warm kopje soep (€2 à volonté, breng je eigen tas mee!).',
      time: '12:00 - 16:30',
      location: 'VP-Plein & Scoutslokalen',
      facebook_event_url: 'https://www.facebook.com/ScoutsKrikoM',
      document_url: 'https://www.kriko-m.be/wp-content/uploads/2026/01/WIJ-ZOEKEN-NOG-SOEPMAKERS-819x1024.png',
    },
    {
      id: 'cal_afe413ea-5650-4a0c-a48f-fdd1ca13d65b', // Bidong! (2027-03-12)
      title: 'Bidongfeesten 2027 (Ratatouille)',
      banner_image: 'https://www.kriko-m.be/wp-content/uploads/2025/02/BIDONG-2025-1024x529.png',
      description: 'De leiding en groepsleiding staan klaar met ons gezellig Ratatouille Eetfestijn! Van 18u tot 20u kan je genieten van Stoofvlees, Vol-au-vent of Vegetarisch stoofpotje met frietjes (€19 volw. / €15 kids). Om 20u volgt het dessertenbuffet & givers-bingo. Vanaf 21u sfeervolle buitenbar met streekbieren, en om 23u draaien de DJ\'s feestmuziek!',
      time: '18:00 - 03:00',
      location: 'Feestzaal & Scoutslokalen Kriko-M',
      external_link_url: 'https://forms.gle/Tbqk2BAku4zFQbrM9',
      facebook_event_url: 'https://www.facebook.com/ScoutsKrikoM',
    },
    {
      id: 'cal_0830f951-53d5-4164-a38e-15ff4b273b37', // Districtsdag (2027-03-20)
      title: 'Districtsdag 2027',
      banner_image: 'https://www.kriko-m.be/wp-content/uploads/2025/03/484537943_1191050235944560_5854147708910294240_n-875x1024.png',
      description: 'Een supertoffe dag met alle scoutsgroepen uit het district! We bundelen onze krachten voor een massale bosgame en uitdagende opdrachten.',
      time: '13:00 - 18:00',
      location: 'Stropersbos & Scoutsterrein',
    },
  ]

  for (const item of updates) {
    const { id, ...data } = item
    const { error } = await admin.from('calendar').update(data).eq('id', id)
    if (error) {
      console.error(`Error updating event ${id}:`, error)
    } else {
      console.log(`Updated event ${id} (${item.title}) with rich details & banner!`)
    }
  }

  console.log('Finished updating existing events.')
}

fixCalendar()
