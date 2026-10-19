import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ContactListEditor, StringListEditor } from '../components/ListEditors'
import { Button, ButtonLink, Card, ConfirmButton, PageHeader } from '../components/ui'
import { safetyPlanStore } from '../lib/storage'
import type { SafetyContact, SafetyPlan as Plan } from '../lib/types'
import { useDocument } from '../lib/useStore'
import { emptySafetyPlan, isSafetyPlanEmpty, sanitizeSafetyPlan } from '../lib/validate'

/**
 * A personal safety plan following the structure of the Stanley–Brown Safety Planning Intervention.
 * Everything here is written by the user and stays on their device. MindHaven never analyses it.
 */

interface Section {
  key: keyof Omit<Plan, 'updatedAt'>
  title: string
  hint: string
  kind: 'list' | 'contacts'
  placeholder?: string
}

const SECTIONS: Section[] = [
  {
    key: 'warningSigns',
    title: 'My warning signs',
    hint: 'Thoughts, feelings, or situations that tell me things are getting worse.',
    kind: 'list',
    placeholder: 'e.g. I stop answering messages',
  },
  {
    key: 'copingStrategies',
    title: 'Things I can do on my own',
    hint: 'Ways I can calm down or take my mind off things — a walk, music, breathing, a shower.',
    kind: 'list',
    placeholder: 'e.g. Go for a walk around the block',
  },
  {
    key: 'distractionPeople',
    title: 'People and places that help me feel better',
    hint: 'Someone to be around, or somewhere to go, even if I don’t talk about what’s wrong.',
    kind: 'contacts',
  },
  {
    key: 'supportPeople',
    title: 'People I can ask for help',
    hint: 'People I trust enough to tell that I’m struggling.',
    kind: 'contacts',
  },
  {
    key: 'professionals',
    title: 'Professionals and crisis lines',
    hint: 'My therapist or doctor, and a crisis line for my country (see Crisis resources for numbers).',
    kind: 'contacts',
  },
  {
    key: 'safeEnvironment',
    title: 'Making my surroundings safer',
    hint: 'Steps to put distance between me and anything I could use to hurt myself. A friend can help with this.',
    kind: 'list',
    placeholder: 'e.g. Ask a friend to hold on to…',
  },
  {
    key: 'reasonsToLive',
    title: 'What’s worth holding on to',
    hint: 'People, plans, or things that matter to me.',
    kind: 'list',
    placeholder: 'e.g. My sister, my dog, the trip in spring',
  },
]

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+*#]/g, '')}`
}

function PlanView({ plan }: { plan: Plan }) {
  return (
    <div className="flex flex-col gap-4">
      {SECTIONS.map((section) => {
        const items = plan[section.key] as string[] | SafetyContact[]
        if (items.length === 0) return null
        return (
          <Card key={section.key}>
            <h2 className="mb-2 font-semibold text-sage-800 dark:text-sage-100">{section.title}</h2>
            <ul className="flex flex-col gap-1.5 text-sage-800 dark:text-sage-100">
              {section.kind === 'list'
                ? (items as string[]).map((text, i) => (
                    <li key={i} className="list-inside list-disc">
                      {text}
                    </li>
                  ))
                : (items as SafetyContact[]).map((c, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-x-3">
                      <span className="font-medium">{c.name || 'Unnamed'}</span>
                      {c.phone && (
                        <a href={telHref(c.phone)} className="text-sage-700 underline dark:text-sage-300">
                          {c.phone}
                        </a>
                      )}
                    </li>
                  ))}
            </ul>
          </Card>
        )
      })}
    </div>
  )
}

export function SafetyPlan() {
  const saved = useDocument(safetyPlanStore)
  const hasPlan = !isSafetyPlanEmpty(saved)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Plan>(() => saved ?? emptySafetyPlan())

  function startEditing() {
    setDraft(saved ?? emptySafetyPlan())
    setEditing(true)
  }

  function save() {
    const clean = sanitizeSafetyPlan({ ...draft, updatedAt: Date.now() })
    if (clean) safetyPlanStore.set(clean)
    setEditing(false)
  }

  const showEditor = editing || !hasPlan

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My safety plan"
        subtitle="A plan you write for yourself, for when things get very hard. It’s easier to decide what helps while you’re feeling steadier — then it’s there when you need it."
      />

      <Card tone="warning" className="text-sm text-clay-700 dark:text-clay-200">
        <p>
          This is your own plan, not medical advice. If you think you might act on thoughts of ending your life,
          please call your local emergency number or a crisis line right now —{' '}
          <Link to="/resources" className="underline">
            see crisis resources
          </Link>
          .
        </p>
      </Card>

      {showEditor ? (
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <p className="text-sm text-sage-700 dark:text-sage-300">
            Fill in as much or as little as you like — you can come back and add more. Stored only on this device
            (anyone who can use this browser could see it).
          </p>
          {SECTIONS.map((section) =>
            section.kind === 'list' ? (
              <StringListEditor
                key={section.key}
                legend={section.title}
                hint={section.hint}
                placeholder={section.placeholder}
                values={draft[section.key] as string[]}
                onChange={(next) => setDraft({ ...draft, [section.key]: next })}
              />
            ) : (
              <ContactListEditor
                key={section.key}
                legend={section.title}
                hint={section.hint}
                values={draft[section.key] as SafetyContact[]}
                onChange={(next) => setDraft({ ...draft, [section.key]: next })}
              />
            ),
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="submit">Save my plan</Button>
            {hasPlan && (
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      ) : (
        <>
          <PlanView plan={saved as Plan} />
          <div className="flex flex-wrap gap-3 print:hidden">
            <Button onClick={startEditing}>Edit my plan</Button>
            <Button variant="secondary" onClick={() => window.print()}>
              Print or save as PDF
            </Button>
            <ButtonLink to="/resources" variant="secondary">
              Crisis resources
            </ButtonLink>
          </div>
          <p className="text-sm text-sage-700 dark:text-sage-400 print:hidden">
            Last updated {new Date((saved as Plan).updatedAt).toLocaleDateString()}.
          </p>
          <div className="print:hidden">
            <ConfirmButton
              variant="danger"
              size="sm"
              confirmLabel="Click again to delete my plan"
              onConfirm={() => {
                safetyPlanStore.clear()
                setEditing(false)
              }}
            >
              Delete my safety plan
            </ConfirmButton>
          </div>
        </>
      )}
    </div>
  )
}
