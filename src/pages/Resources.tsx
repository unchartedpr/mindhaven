import { useState } from 'react'
import { CRISIS_DIRECTORY, INTERNATIONAL_RESOURCES } from '../lib/resources'

export function Resources() {
  const [countryName, setCountryName] = useState(CRISIS_DIRECTORY[0].country)
  const country = CRISIS_DIRECTORY.find((c) => c.country === countryName) ?? CRISIS_DIRECTORY[0]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800 dark:text-sage-50">Crisis resources</h1>
        <p className="mt-1 text-sage-600 dark:text-sage-300">
          If you are in immediate danger, please contact your local emergency number right away.
        </p>
      </div>

      <div className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-500 dark:border-clay-500/30 dark:bg-clay-500/10 dark:text-clay-200">
        <p>
          MindHaven is a self-care companion, not a crisis service. It cannot see or respond to what
          you write. These listings are provided as a starting point and may not be complete or fully
          up to date — if a number doesn't work, try{' '}
          <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className="underline">
            findahelpline.com
          </a>{' '}
          or search "[your country] crisis helpline."
        </p>
      </div>

      <div>
        <label htmlFor="country" className="mb-2 block text-sm font-medium text-sage-700 dark:text-sage-200">
          Select your country
        </label>
        <select
          id="country"
          value={countryName}
          onChange={(e) => setCountryName(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-sage-200 bg-white p-2.5 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40"
        >
          {CRISIS_DIRECTORY.map((c) => (
            <option key={c.country} value={c.country}>
              {c.country}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm dark:border-sage-800 dark:bg-sage-900/40">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-sage-800 dark:text-sage-100">{country.country}</h2>
          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-700 dark:bg-sage-800 dark:text-sage-200">
            Emergency: {country.emergency}
          </span>
        </div>
        <ul className="flex flex-col gap-3">
          {country.resources.map((r) => (
            <li key={r.name} className="border-t border-sage-100 pt-3 first:border-t-0 first:pt-0 dark:border-sage-800">
              <div className="font-medium text-sage-800 dark:text-sage-100">{r.name}</div>
              <div className="text-sage-700 dark:text-sage-200">{r.contact}</div>
              <div className="text-sm text-sage-500 dark:text-sage-400">{r.description}</div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-sage-800 dark:text-sage-100">Not seeing your country?</h2>
        <ul className="flex flex-col gap-3">
          {INTERNATIONAL_RESOURCES.map((r) => (
            <li
              key={r.name}
              className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm dark:border-sage-800 dark:bg-sage-900/40"
            >
              <div className="font-medium text-sage-800 dark:text-sage-100">{r.name}</div>
              <div className="text-sage-700 dark:text-sage-200">{r.contact}</div>
              <div className="text-sm text-sage-500 dark:text-sage-400">{r.description}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
