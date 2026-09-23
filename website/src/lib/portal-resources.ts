export interface PortalResource {
  id: string
  type: 'quicklink' | 'document'
  category: string
  label: string
  description: string
  url: string
  icon: string
  sort_order: number
  created_at?: string
  updated_at?: string
}

export const DEFAULT_RESOURCES: PortalResource[] = [
  { id: 'res_q1', type: 'quicklink', category: 'Snelkoppelingen', label: 'Groepsadmin', description: 'Leden & leiding administratie', url: 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/', icon: 'fa-solid fa-users-gear', sort_order: 1 },
  { id: 'res_q2', type: 'quicklink', category: 'Snelkoppelingen', label: 'Google Drive', description: 'Gedeelde mappen & bestanden', url: 'https://drive.google.com', icon: 'fa-brands fa-google-drive', sort_order: 2 },
  { id: 'res_q3', type: 'quicklink', category: 'Snelkoppelingen', label: 'Facebook', description: 'Officiële Kriko-M pagina', url: 'https://www.facebook.com/ScoutsKrikoM', icon: 'fa-brands fa-facebook', sort_order: 3 },
  { id: 'res_q4', type: 'quicklink', category: 'Snelkoppelingen', label: 'Scouts & Gidsen VL', description: 'Spelaanbod & richtlijnen', url: 'https://www.scoutsengidsenvlaanderen.be', icon: 'scouts-gidsen-vl', sort_order: 4 },

  { id: 'res_d1', type: 'document', category: '🏕️ Kamp', label: 'Kampgids & Draaiboek', description: 'Handleiding & stappenplan om een vlekkeloos kamp te organiseren.', url: 'https://drive.google.com', icon: 'fa-solid fa-tent', sort_order: 10 },
  { id: 'res_d2', type: 'document', category: '🏕️ Kamp', label: 'Checklist Kamp', description: 'Overzicht van materialen, veiligheid, EHBO en transport.', url: 'https://drive.google.com', icon: 'fa-solid fa-clipboard-check', sort_order: 11 },
  { id: 'res_d3', type: 'document', category: '💶 Financieel', label: 'Financieel Sjabloon', description: 'Excel/Google Sheet sjabloon voor kasboeken en takbudgetten.', url: 'https://drive.google.com', icon: 'fa-solid fa-calculator', sort_order: 20 },
  { id: 'res_d4', type: 'document', category: '💶 Financieel', label: 'Afrekeningsfiche', description: 'Sjabloon voor het indienen van onkostennota\'s en bewijsstukken.', url: 'https://drive.google.com', icon: 'fa-solid fa-receipt', sort_order: 21 },
  { id: 'res_d5', type: 'document', category: '🎲 Spel & Activiteiten', label: 'Spel Sjabloon', description: 'Standaard format voor het uitwerken van een spelvoorbereiding.', url: 'https://drive.google.com', icon: 'fa-solid fa-file-pen', sort_order: 30 },
  { id: 'res_d6', type: 'document', category: '🎲 Spel & Activiteiten', label: 'Checklist Spel', description: 'Checklist voor materiaal, regels, veiligheid en tijdsduur.', url: 'https://drive.google.com', icon: 'fa-solid fa-list-check', sort_order: 31 },
  { id: 'res_d7', type: 'document', category: '🎲 Spel & Activiteiten', label: 'Spelideeën Lijst', description: 'Lijst met originele spelideeën en bosspelen per leeftijd.', url: 'https://drive.google.com', icon: 'fa-solid fa-lightbulb', sort_order: 32 },
  { id: 'res_d8', type: 'document', category: '📑 Veiligheid & Formulieren', label: 'Medische Fiches', description: 'Standaard medische steunfiche van Scouts & Gidsen Vlaanderen.', url: 'https://www.scoutsengidsenvlaanderen.be', icon: 'fa-solid fa-notes-medical', sort_order: 40 },
  { id: 'res_d9', type: 'document', category: '📑 Veiligheid & Formulieren', label: 'Noodnummers & Reglement', description: 'Lijst met belangrijke contactpersonen en groepsafspraken.', url: 'https://drive.google.com', icon: 'fa-solid fa-phone-volume', sort_order: 41 },
]
