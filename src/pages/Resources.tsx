import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, ButtonLink, PageHeader } from '../components/ui'
import {
  CRISIS_DIRECTORY,
  INTERNATIONAL_RESOURCES,
  countryForRegion,
  regionFromLanguages,
  type CrisisResource,
} from '../lib/resources'

const REPO_ISSUES = 'https://github.com/unchartedpr/mindhaven/issues/new'

function initialCountryCode(): string {
  if (typeof navigator === 'undefined') return ''
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language]
  return countryForRegion(regionFromLanguages(languages))?.code ?? ''
}

function reportUrl(country: string | undefined): string {
  const title = `Crisis directory: please check ${country ?? 'a listing'}`
  const body = 'Which number or listing is wrong or missing, and what is the correct information (with a source link if you can)?'
  return `${REPO_ISSUES}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
}

function ResourceItem({ resource }: { resource: CrisisResource }) {
  return (
    <>
      <div className="font-medium text-sage-800 dark:text-sage-100">{resource.name}</div>
      <div className="text-sage-700 dark:text-sage-200">
        {resource.href ? (
          <a href={resource.href} target="_blank" rel="noopener noreferrer" className="underline">
            {resource.contact}
          </a>
        ) : (
          resource.contact
        )}
      </div>
      <div className="text-sm text-sage-700 dark:text-sage-400">{resource.description}</div>
    </>
  )
}

export function Resources() {
  const [code, setCode] = useState(initialCountryCode)
  const country = CRISIS_DIRECTORY.find((c) => c.code === code)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Crisis resources"
        subtitle="If you are in immediate danger, please contact your local emergency number right away."
      />

      <Card tone="warning" className="text-sm text-clay-700 dark:text-clay-200">
        <p>
          MindHaven is a self-care companion, not a crisis service. It cannot see or respond to what you write.
          These listings are a starting point: numbers change and this list hasn’t been independently verified for
          every country. If a number doesn’t work, try{' '}
          <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline">
            findahelpline.com
          </a>{' '}
          or search “[your country] crisis helpline”.{' '}
          <a href={reportUrl(country?.country)} target="_blank" rel="noopener noreferrer" className="underline">
            Report an incorrect or missing number
          </a>
          .
        </p>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-sage-700 dark:text-sage-200">
          <strong className="font-medium">Your safety plan</strong> — your own steps and contacts for hard
          moments, kept on this device.
        </p>
        <ButtonLink to="/safety-plan" variant="secondary">
          Open safety plan
        </ButtonLink>
      </Card>

      <div>
        <label htmlFor="country" className="mb-2 block text-sm font-medium text-sage-700 dark:text-sage-200">
          Select your country
        </label>
        <select
          id="country"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-11 w-full max-w-xs rounded-lg border border-sage-200 bg-white p-2.5 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40"
        >
          <option value="">Choose your country…</option>
          {CRISIS_DIRECTORY.map((c) => (
            <option key={c.code} value={c.code}>
              {c.country}
            </option>
          ))}
        </select>
      </div>

      {country ? (
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-sage-800 dark:text-sage-100">{country.country}</h2>
            <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-700 dark:bg-sage-800 dark:text-sage-200">
              Emergency: {country.emergency}
            </span>
          </div>
          <ul className="flex flex-col gap-3">
            {country.resources.map((r) => (
              <li
                key={r.name}
                className="border-t border-sage-100 pt-3 first:border-t-0 first:pt-0 dark:border-sage-800"
              >
                <ResourceItem resource={r} />
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <p className="text-sm text-sage-700 dark:text-sage-300">
          Pick your country to see local numbers. Not listed? Use the worldwide directories below.
        </p>
      )}

      <div>
        <h2 className="mb-3 font-semibold text-sage-800 dark:text-sage-100">Worldwide directories</h2>
        <ul className="flex flex-col gap-3">
          {INTERNATIONAL_RESOURCES.map((r) => (
            <li key={r.name}>
              <Card>
                <ResourceItem resource={r} />
              </Card>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-sage-700 dark:text-sage-400">
        Want to be ready before a hard moment?{' '}
        <Link to="/safety-plan" className="underline">
          Make a safety plan
        </Link>
        .
      </p>
    </div>
  )
}
