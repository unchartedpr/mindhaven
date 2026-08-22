export interface CrisisResource {
  name: string
  contact: string
  description: string
}

export interface CountryResources {
  country: string
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
    emergency: '911',
    resources: [
      { name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988', description: '24/7, free and confidential support.' },
      { name: 'Crisis Text Line', contact: 'Text HOME to 741741', description: '24/7 text-based crisis support.' },
      { name: 'The Trevor Project', contact: '1-866-488-7386', description: 'Crisis support for LGBTQ+ young people.' },
    ],
  },
  {
    country: 'Canada',
    emergency: '911',
    resources: [
      { name: 'Talk Suicide Canada', contact: '1-833-456-4566 or text 45645', description: '24/7 bilingual support.' },
      { name: 'Kids Help Phone', contact: '1-800-668-6868 or text CONNECT to 686868', description: 'Support for young people, 24/7.' },
    ],
  },
  {
    country: 'United Kingdom',
    emergency: '999',
    resources: [
      { name: 'Samaritans', contact: '116 123', description: 'Free, 24/7, confidential emotional support.' },
      { name: 'Shout', contact: 'Text SHOUT to 85258', description: '24/7 free text support.' },
    ],
  },
  {
    country: 'Ireland',
    emergency: '112 or 999',
    resources: [
      { name: 'Samaritans Ireland', contact: '116 123', description: 'Free, 24/7, confidential emotional support.' },
      { name: 'Pieta', contact: '1800 247 247 or text HELP to 51444', description: 'Support for suicide and self-harm.' },
    ],
  },
  {
    country: 'Australia',
    emergency: '000',
    resources: [
      { name: 'Lifeline Australia', contact: '13 11 14', description: '24/7 crisis support and suicide prevention.' },
      { name: 'Beyond Blue', contact: '1300 22 4636', description: 'Support for anxiety, depression, and suicide prevention.' },
    ],
  },
  {
    country: 'New Zealand',
    emergency: '111',
    resources: [
      { name: 'Need to Talk?', contact: 'Call or text 1737', description: '24/7 free call or text with a trained counsellor.' },
      { name: 'Lifeline Aotearoa', contact: '0800 543 354', description: '24/7 crisis support.' },
    ],
  },
  {
    country: 'India',
    emergency: '112',
    resources: [
      { name: 'iCall (TISS)', contact: '9152987821', description: 'Psychosocial helpline, Mon–Sat.' },
      { name: 'Vandrevala Foundation', contact: '1860-2662-345 / 1800-2333-330', description: '24/7 mental health helpline.' },
    ],
  },
  {
    country: 'South Africa',
    emergency: '10111 / 112 (mobile)',
    resources: [
      { name: 'SADAG Mental Health Line', contact: '0800 21 22 23', description: '24/7 crisis line run by the SA Depression and Anxiety Group.' },
      { name: 'Suicide Crisis Line', contact: '0800 567 567', description: '24/7 suicide crisis support.' },
    ],
  },
]

export const INTERNATIONAL_RESOURCES: CrisisResource[] = [
  {
    name: 'Find A Helpline',
    contact: 'findahelpline.com',
    description: 'A directory of crisis lines across 130+ countries — use if your country isn’t listed above.',
  },
  {
    name: 'Befrienders Worldwide',
    contact: 'befrienders.org',
    description: 'International network of emotional support helplines.',
  },
  {
    name: 'International Association for Suicide Prevention',
    contact: 'iasp.info/resources/Crisis_Centres',
    description: 'Directory of crisis centres worldwide.',
  },
]
