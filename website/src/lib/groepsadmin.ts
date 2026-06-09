/**
 * Scouts & Gidsen Vlaanderen — Groepsadmin REST API Helper (Next.js / TypeScript)
 * Replicates the legacy PHP sgo_config.php / sgo_callback.php API client functions.
 */

const SGO_API_BASE = 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/rest-ga'
const SGO_GROEP_NUMMER = 'O3108G'

export interface GroepsadminMemberInfo {
  voornaam: string
  achternaam: string
  tak: string
  geboortedatum: string
  medisch: {
    allergieen: string
    dieet: string
    medicatie: string
    opmerkingen: string
  }
}

export interface GroepsadminChild {
  id: string
  voornaam: string
  achternaam: string
  tak: string
  geboortedatum: string
  ga_id: string
}

// Check if dev/mock mode is active (when client id is not configured yet)
export function isDevMode(): boolean {
  return !process.env.SGO_CLIENT_ID || process.env.SGO_CLIENT_ID === 'PLACEHOLDER_CLIENT_ID'
}

/** Mock-data for local testing without central S&G credentials */
const MOCK_CHILDREN: GroepsadminChild[] = [
  { id: 'GA-1001', voornaam: 'Lotte', achternaam: 'Peeters', tak: 'kapoenen', geboortedatum: '2019-03-12', ga_id: 'GA-1001' },
  { id: 'GA-1002', voornaam: 'Mil', achternaam: 'Peeters', tak: 'jonggivers', geboortedatum: '2013-08-04', ga_id: 'GA-1002' },
]

const MOCK_MEMBERS: Record<string, any> = {
  'GA-1001': {
    voornaam: 'Lotte', achternaam: 'Peeters', tak: 'kapoenen', geboortedatum: '2019-03-12',
    medisch: { allergieen: 'Noten', dieet: '-', medicatie: '-', opmerkingen: 'Mag niet in de volle zon zonder pet.' }
  },
  'GA-1002': {
    voornaam: 'Mil', achternaam: 'Peeters', tak: 'jonggivers', geboortedatum: '2013-08-04',
    medisch: { allergieen: '-', dieet: 'Vegetarisch', medicatie: 'Ventolin (astma)', opmerkingen: '-' }
  },
  // Extra members for branches
  'GA-2001': {
    voornaam: 'Emma', achternaam: 'Claes', tak: 'welpen', geboortedatum: '2015-03-14',
    medisch: { allergieen: 'Noten', dieet: '-', medicatie: '-', opmerkingen: '-' }
  },
  'GA-2002': {
    voornaam: 'Liam', achternaam: 'Bogaert', tak: 'welpen', geboortedatum: '2014-09-22',
    medisch: { allergieen: '-', dieet: 'Vegetarisch', medicatie: '-', opmerkingen: '-' }
  },
  'GA-2003': {
    voornaam: 'Noor', achternaam: 'Jacobs', tak: 'welpen', geboortedatum: '2015-07-01',
    medisch: { allergieen: '-', dieet: '-', medicatie: 'Ventolin', opmerkingen: 'Astma' }
  }
}

/** HTTP GET Helper */
async function sgoGet(url: string, token: string): Promise<any> {
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
    next: { revalidate: 60 } // Cache results for 60s
  })
  if (!res.ok) throw new Error(`Groepsadmin API error: ${res.statusText}`)
  return res.json()
}

/**
 * Fetch full profile and medical card of a single member live.
 */
export async function fetchMember(token: string, gaId: string): Promise<GroepsadminMemberInfo> {
  if (isDevMode()) {
    const mock = MOCK_MEMBERS[gaId]
    if (mock) return mock
    return {
      voornaam: 'Onbekend', achternaam: gaId, tak: '', geboortedatum: '',
      medisch: { allergieen: '', dieet: '', medicatie: '', opmerkingen: '' }
    }
  }

  try {
    const [lid, kaart] = await Promise.all([
      sgoGet(`${SGO_API_BASE}/lid/${encodeURIComponent(gaId)}`, token),
      sgoGet(`${SGO_API_BASE}/lid/${encodeURIComponent(gaId)}/steekkaart`, token)
    ])

    const med = kaart.medische_fiche ?? kaart
    return {
      voornaam: lid.voornaam ?? '',
      achternaam: lid.achternaam ?? '',
      tak: lid.afdeling ?? '',
      geboortedatum: lid.geboortedatum ?? '',
      medisch: {
        allergieen: med.allergieen ?? med.allergieën ?? '',
        dieet: med.dieet ?? '',
        medicatie: med.medicatie ?? '',
        opmerkingen: med.opmerkingen ?? '',
      }
    }
  } catch (error) {
    console.error('Error fetching member from Groepsadmin:', error)
    throw error
  }
}

/**
 * Check if the user has a leader role.
 */
export async function isLeiding(token: string): Promise<boolean> {
  if (isDevMode()) return true
  try {
    const profiel = await sgoGet(`${SGO_API_BASE}/lid/profiel`, token)
    const blob = JSON.stringify(profiel.functies ?? profiel).toLowerCase()
    return blob.includes('leiding') || blob.includes('begeleid')
  } catch {
    return false
  }
}

/**
 * Get portal role of user.
 * Returns: 'groepsleiding' | 'leiding' | 'ouder'
 */
export async function getPortalRole(token: string): Promise<'groepsleiding' | 'leiding' | 'ouder'> {
  if (isDevMode()) return 'leiding'
  try {
    const profiel = await sgoGet(`${SGO_API_BASE}/lid/profiel`, token)
    const blob = JSON.stringify(profiel.functies ?? profiel).toLowerCase()

    if (blob.includes('groepsleiding') || blob.includes('groepsverantwoordelijke')) {
      return 'groepsleiding'
    } else if (blob.includes('leiding') || blob.includes('begeleid')) {
      return 'leiding'
    }
    return 'ouder'
  } catch {
    return 'ouder'
  }
}

/**
 * Fetch list of linked children of a parent using their email address.
 */
export async function fetchChildren(token: string, email: string): Promise<GroepsadminChild[]> {
  if (isDevMode()) return MOCK_CHILDREN

  try {
    const [ledenRes, profiel] = await Promise.all([
      sgoGet(`${SGO_API_BASE}/groep/${SGO_GROEP_NUMMER}/leden`, token),
      sgoGet(`${SGO_API_BASE}/lid/profiel`, token)
    ])

    const parentEmail = email.toLowerCase().trim()
    const leden = ledenRes.leden ?? []

    if (!leden.length || !parentEmail) return []

    const children: GroepsadminChild[] = []
    for (const lid of leden) {
      const contacten = lid.contacten ?? []
      for (const contact of contacten) {
        if ((contact.email ?? '').toLowerCase().trim() === parentEmail) {
          children.push({
            id: lid.id ?? '',
            voornaam: lid.voornaam ?? '',
            achternaam: lid.achternaam ?? '',
            tak: lid.afdeling ?? '',
            geboortedatum: lid.geboortedatum ?? '',
            ga_id: lid.id ?? '',
          })
          break
        }
      }
    }
    return children
  } catch (error) {
    console.error('Error fetching children from Groepsadmin:', error)
    return []
  }
}
