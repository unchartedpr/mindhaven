import { ButtonLink, PageHeader } from '../components/ui'

export function NotFound() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Page not found" subtitle="That page doesn’t exist — the link may be old or mistyped." />
      <div className="flex flex-wrap gap-3">
        <ButtonLink to="/">Go home</ButtonLink>
        <ButtonLink to="/resources" variant="secondary">
          Crisis resources
        </ButtonLink>
      </div>
    </div>
  )
}
