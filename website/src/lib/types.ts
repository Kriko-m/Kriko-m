export interface WerkjaarLeiding {
  id: string
  werkjaar: string
  tak: 'kapoenen' | 'welpen' | 'jonggivers' | 'givers'
  naam: string
  rol: string
}

// Concept (draft) voor het volgende werkjaar — leeft in settings.concept.
export interface WerkjaarConcept {
  werkjaar: string
  // leiding→tak toewijzing als { tak: [{ naam, rol }] }
  leiding: Record<string, { naam: string; rol: string }[]>
}

export interface Settings {
  id: number
  scouts_year: string
  concept?: WerkjaarConcept | Record<string, never>
  bank_iban: string
  bank_bic: string
  bank_holder: string
  contact_email: string
  contact_phone: string
  contact_address: string
  alert_message: string
  alert_active: boolean
  reg_fee_first: number
  reg_fee_extra: number
  takken: Record<string, TakConfig>
}

export interface TakConfig {
  name: string
  age_range: string
  school_year: string
  email: string
  class: string
  description?: string
  uniform?: string
  leaders?: Leader[]
  whatsapp_url?: string
}

export interface Leader {
  name: string
  role: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  tak: 'groep' | 'kapoenen' | 'welpen' | 'jonggivers' | 'givers'
  werkjaar?: string
  created_at?: string
}

export interface Echo {
  id: string
  title: string
  month: number
  year: number
  tak: 'kapoenen' | 'welpen' | 'jonggivers' | 'givers'
  file_name: string
  approved: boolean
  werkjaar?: string
  uploaded_at?: string
}

export interface Product {
  id: string
  name: string
  price: number
  description: string
  sizes: string[]
  image: string
  category: string
  active: boolean
  sort_order: number
}

export interface Order {
  id: string
  order_number: number
  order_ref: string
  status: 'pending' | 'waiting_approval' | 'paid' | 'completed' | 'cancelled'
  customer_name: string
  child_name: string
  child_tak: string
  email: string
  items: OrderItem[]
  total: number
  communication: string
  parent_id?: string | null
  created_at?: string
  bank_iban?: string // Helper property for UI rendering
  bank_holder?: string // Helper property for UI rendering
}

export interface OrderItem {
  id: string
  name: string
  size: string
  price: number
  quantity: number
}

export interface Kamp {
  id: string
  slug: string
  naam: string
  tak: 'kapoenen' | 'welpen' | 'jonggivers' | 'givers' | 'alle'
  datum_van: string
  datum_tot: string
  locatie: string
  beschrijving: string
  open_voor_inschrijving: boolean
  prijs: number
  foto: string
  paklijst: any // JSON
  briefadres: string
  contact_info: string
  werkjaar?: string
  aangemaakt_op?: string
  aangemaakt_door?: string
  kamp_bestanden?: KampBestand[]
}

export interface KampBestand {
  id: string
  kamp_id: string
  type: 'paklijst_pdf' | 'uitnodiging' | 'infobrief' | 'overige'
  naam: string
  file_name: string
  uploaded_at?: string
}

export interface KampRsvp {
  id: string
  kamp_id: string
  kind_naam: string
  tak: 'kapoenen' | 'welpen' | 'jonggivers' | 'givers'
  status: 'ja' | 'nee'
  opmerking: string
  werkjaar?: string
  created_at?: string
  updated_at?: string
}



export interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  created_at?: string
}

export interface Verslag {
  id: string
  title: string
  tak: 'kapoenen' | 'welpen' | 'jonggivers' | 'givers' | 'alle'
  date: string
  content: string
  author: string
  published: boolean
  created_at?: string
}
