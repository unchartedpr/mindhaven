export interface CrisisResource {
  name: string
  contact: string
  description: string
  /** Set for web directories, so the contact can be rendered as a link. */
  href?: string
}

export interface CountryResources {
  country: string
  /** ISO 3166-1 alpha-2 region code, used to preselect a country from the browser's locale. */
  code: string
  emergency: string
  resources: CrisisResource[]
}

/**
 * Curated crisis-line directory. Numbers/names can change — this is a starting
 * point, not an exhaustive or guaranteed-current directory. Always verify
 * locally if possible (e.g. search "[your country] crisis helpline").
 */
export const CRISIS_DIRECTORY: CountryResources[] = [
  {
    country: 'United States',
    code: 'US',
    emergency: '911',
    resources: [
      { name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988', description: '24/7, free and confidential support.' },
      { name: 'Crisis Text Line', contact: 'Text HOME to 741741', description: '24/7 text-based crisis support.' },
      { name: 'The Trevor Project', contact: '1-866-488-7386', description: 'Crisis support for LGBTQ+ young people.' },
    ],
  },
  {
    country: 'Canada',
    code: 'CA',
    emergency: '911',
    resources: [
      { name: 'Talk Suicide Canada', contact: '1-833-456-4566 or text 45645', description: '24/7 bilingual support.' },
      { name: 'Kids Help Phone', contact: '1-800-668-6868 or text CONNECT to 686868', description: 'Support for young people, 24/7.' },
    ],
  },
  {
    country: 'United Kingdom',
    code: 'GB',
    emergency: '999',
    resources: [
      { name: 'Samaritans', contact: '116 123', description: 'Free, 24/7, confidential emotional support.' },
      { name: 'Shout', contact: 'Text SHOUT to 85258', description: '24/7 free text support.' },
    ],
  },
  {
    country: 'Ireland',
    code: 'IE',
    emergency: '112 or 999',
    resources: [
      { name: 'Samaritans Ireland', contact: '116 123', description: 'Free, 24/7, confidential emotional support.' },
      { name: 'Pieta', contact: '1800 247 247 or text HELP to 51444', description: 'Support for suicide and self-harm.' },
    ],
  },
  {
    country: 'Australia',
    code: 'AU',
    emergency: '000',
    resources: [
      { name: 'Lifeline Australia', contact: '13 11 14', description: '24/7 crisis support and suicide prevention.' },
      { name: 'Beyond Blue', contact: '1300 22 4636', description: 'Support for anxiety, depression, and suicide prevention.' },
    ],
  },
  {
    country: 'New Zealand',
    code: 'NZ',
    emergency: '111',
    resources: [
      { name: 'Need to Talk?', contact: 'Call or text 1737', description: '24/7 free call or text with a trained counsellor.' },
      { name: 'Lifeline Aotearoa', contact: '0800 543 354', description: '24/7 crisis support.' },
    ],
  },
  {
    country: 'India',
    code: 'IN',
    emergency: '112',
    resources: [
      { name: 'iCall (TISS)', contact: '9152987821', description: 'Psychosocial helpline, Mon–Sat.' },
      { name: 'Vandrevala Foundation', contact: '1860-2662-345 / 1800-2333-330', description: '24/7 mental health helpline.' },
    ],
  },
  {
    country: 'South Africa',
    code: 'ZA',
    emergency: '10111 / 112 (mobile)',
    resources: [
      { name: 'SADAG Mental Health Line', contact: '0800 21 22 23', description: '24/7 crisis line run by the SA Depression and Anxiety Group.' },
      { name: 'Suicide Crisis Line', contact: '0800 567 567', description: '24/7 suicide crisis support.' },
    ],
  },
  {
    country: 'Germany',
    code: 'DE',
    emergency: '112',
    resources: [
      { name: 'Telefonseelsorge', contact: '0800 111 0 111 or 0800 111 0 222', description: 'Free, 24/7, anonymous emotional support (also available as 116 123).' },
    ],
  },
  {
    country: 'France',
    code: 'FR',
    emergency: '112',
    resources: [
      { name: 'Numéro national de prévention du suicide', contact: '3114', description: 'Free, 24/7 national suicide-prevention line.' },
    ],
  },
  {
    country: 'Spain',
    code: 'ES',
    emergency: '112',
    resources: [
      { name: 'Línea 024', contact: '024', description: 'Free, 24/7 national line for suicidal crisis, run by the Ministry of Health.' },
    ],
  },
  {
    country: 'Italy',
    code: 'IT',
    emergency: '112',
    resources: [
      { name: 'Telefono Amico Italia', contact: '02 2327 2327', description: 'Daily emotional-support helpline (10am–midnight).' },
    ],
  },
  {
    country: 'Netherlands',
    code: 'NL',
    emergency: '112',
    resources: [
      { name: '113 Zelfmoordpreventie', contact: 'Call 113 or 0800-0113', description: 'Free, 24/7 suicide-prevention line and chat.' },
    ],
  },
  {
    country: 'Belgium',
    code: 'BE',
    emergency: '112',
    resources: [
      { name: 'Zelfmoordlijn 1813 (Flanders)', contact: '1813', description: '24/7 suicide-prevention line, call or chat.' },
      { name: 'Centre de Prévention du Suicide (Wallonia)', contact: '0800 32 123', description: 'Free, 24/7 French-language support.' },
    ],
  },
  {
    country: 'Switzerland',
    code: 'CH',
    emergency: '112 / 144 (ambulance)',
    resources: [
      { name: 'Die Dargebotene Hand', contact: '143', description: '24/7 emotional-support helpline, also by chat.' },
    ],
  },
  {
    country: 'Austria',
    code: 'AT',
    emergency: '112',
    resources: [
      { name: 'Telefonseelsorge Österreich', contact: '142', description: 'Free, 24/7, anonymous emotional support.' },
    ],
  },
  {
    country: 'Sweden',
    code: 'SE',
    emergency: '112',
    resources: [
      { name: 'Mind Självmordslinjen', contact: '90101', description: '24/7 suicide-prevention line, call or chat.' },
    ],
  },
  {
    country: 'Norway',
    code: 'NO',
    emergency: '112 (police) / 113 (ambulance)',
    resources: [
      { name: 'Mental Helse Hjelpetelefonen', contact: '116 123', description: 'Free, 24/7 mental health support line.' },
    ],
  },
  {
    country: 'Denmark',
    code: 'DK',
    emergency: '112',
    resources: [
      { name: 'Livslinien', contact: '70 201 201', description: 'Daily suicide-prevention helpline (11am–4am).' },
    ],
  },
  {
    country: 'Finland',
    code: 'FI',
    emergency: '112',
    resources: [
      { name: 'MIELI Valtakunnallinen kriisipuhelin', contact: '09 2525 0111', description: 'National crisis helpline (Finnish/Swedish).' },
    ],
  },
  {
    country: 'Poland',
    code: 'PL',
    emergency: '112',
    resources: [
      { name: 'Telefon Zaufania dla Dorosłych', contact: '116 123', description: 'Free emotional-support line for adults in crisis.' },
    ],
  },
  {
    country: 'Portugal',
    code: 'PT',
    emergency: '112',
    resources: [
      { name: 'SOS Voz Amiga', contact: '213 544 545 / 912 802 669 / 963 524 660', description: 'Daily emotional-support helpline, evenings.' },
    ],
  },
  {
    country: 'Japan',
    code: 'JP',
    emergency: '110 (police) / 119 (fire/ambulance)',
    resources: [
      { name: 'TELL Lifeline', contact: '03-5774-0992', description: 'English-language support line for Japan residents.' },
      { name: 'Yorisoi Hotline', contact: '0120-279-338', description: 'Free, 24/7 Japanese-language support line.' },
    ],
  },
  {
    country: 'South Korea',
    code: 'KR',
    emergency: '112 (police) / 119 (fire/ambulance)',
    resources: [
      { name: 'Suicide Prevention Hotline', contact: '1393', description: '24/7 national crisis line.' },
    ],
  },
  {
    country: 'Philippines',
    code: 'PH',
    emergency: '911',
    resources: [
      { name: 'National Center for Mental Health Crisis Hotline', contact: '1553 (landline), 0966-351-4518 / 0917-899-8727 (mobile)', description: '24/7 national crisis line.' },
    ],
  },
  {
    country: 'Singapore',
    code: 'SG',
    emergency: '999 (police) / 995 (ambulance)',
    resources: [
      { name: 'Samaritans of Singapore (SOS)', contact: '1-767, or text 9151-1767', description: '24/7 confidential emotional support.' },
    ],
  },
  {
    country: 'Malaysia',
    code: 'MY',
    emergency: '999',
    resources: [
      { name: 'Befrienders KL', contact: '03-76272929', description: '24/7 confidential emotional support.' },
    ],
  },
  {
    country: 'Brazil',
    code: 'BR',
    emergency: '192 (SAMU) / 190 (police)',
    resources: [
      { name: 'CVV — Centro de Valorização da Vida', contact: '188', description: 'Free, 24/7 confidential emotional support.' },
    ],
  },
  {
    country: 'Mexico',
    code: 'MX',
    emergency: '911',
    resources: [
      { name: 'SAPTEL', contact: '55 5259 8121', description: '24/7 crisis and emotional-support line.' },
      { name: 'Línea de la Vida', contact: '800 911 2000', description: 'Free, 24/7 national support line.' },
    ],
  },
  {
    country: 'Argentina',
    code: 'AR',
    emergency: '911',
    resources: [
      { name: 'Centro de Asistencia al Suicida', contact: '135 (from Buenos Aires) or 011 5275-1135', description: '24/7 crisis line.' },
    ],
  },
  {
    country: 'Chile',
    code: 'CL',
    emergency: '133 (police) / 131 (ambulance)',
    resources: [
      { name: 'Salud Responde', contact: '600 360 7777', description: '24/7 health orientation line with mental-health support.' },
    ],
  },
  {
    country: 'Colombia',
    code: 'CO',
    emergency: '123',
    resources: [
      { name: 'Línea 106', contact: '106', description: 'Free national mental-health and emotional-support line.' },
    ],
  },
  {
    country: 'Israel',
    code: 'IL',
    emergency: '100 (police) / 101 (ambulance)',
    resources: [
      { name: 'ERAN', contact: '1201', description: '24/7 emotional first-aid helpline, also by chat.' },
    ],
  },
  {
    country: 'Kenya',
    code: 'KE',
    emergency: '999 / 112',
    resources: [
      { name: 'Befrienders Kenya', contact: '0722 178 177', description: 'Confidential emotional-support helpline.' },
    ],
  },
  {
    country: 'Hong Kong',
    code: 'HK',
    emergency: '999',
    resources: [
      { name: 'The Samaritans Hong Kong', contact: '2896 0000', description: '24/7 multilingual emotional support.' },
      { name: 'Suicide Prevention Services', contact: '2382 0000', description: '24/7 Cantonese/Mandarin crisis line.' },
    ],
  },
].sort((a, b) => a.country.localeCompare(b.country))

export const INTERNATIONAL_RESOURCES: CrisisResource[] = [
  {
    name: 'Find A Helpline',
    contact: 'findahelpline.com',
    href: 'https://findahelpline.com',
    description: 'A directory of crisis lines across 130+ countries — use if your country isn’t listed above.',
  },
  {
    name: 'Befrienders Worldwide',
    contact: 'befrienders.org',
    href: 'https://befrienders.org',
    description: 'International network of emotional support helplines.',
  },
  {
    name: 'International Association for Suicide Prevention',
    contact: 'iasp.info',
    href: 'https://www.iasp.info',
    description: 'Lists crisis centres worldwide — look for the crisis centres section.',
  },
]

/**
 * The first explicit region in a list of BCP-47 language tags, e.g. ['en-GB', 'en'] → 'GB'.
 * A bare language ('en') says nothing reliable about where someone is, so it yields no guess.
 */
export function regionFromLanguages(languages: readonly string[]): string | null {
  for (const tag of languages) {
    try {
      const region = new Intl.Locale(tag).region
      if (region) return region.toUpperCase()
    } catch {
      // Malformed tag — ignore and try the next one.
    }
  }
  return null
}

export function countryForRegion(region: string | null): CountryResources | null {
  if (!region) return null
  return CRISIS_DIRECTORY.find((c) => c.code === region) ?? null
}
