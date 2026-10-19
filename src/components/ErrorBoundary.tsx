import { Component, type ErrorInfo, type ReactNode } from 'react'
import { downloadFile, today } from '../lib/download'
import { exportData, rawStorageDump } from '../lib/storage'
import { buttonClass } from './uiClasses'

interface Props {
  children: ReactNode
  /** When this value changes (e.g. the route), a previously caught error is cleared. */
  resetKey?: string
}

interface State {
  error: Error | null
  /** The last `resetKey` seen, so a change can clear a caught error. */
  seenKey: string | undefined
}

/**
 * Catches render errors so a bad record or a bug shows a recovery screen instead of a blank page.
 *
 * The recovery screen deliberately uses plain anchors and no app state: it must work even when the
 * router or the data layer is what failed. Crisis resources stay one tap away, and the person can
 * always download their data.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, seenKey: this.props.resetKey }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    // Navigating somewhere else gives the new page a clean slate.
    if (props.resetKey !== state.seenKey) return { error: null, seenKey: props.resetKey }
    return null
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('MindHaven render error:', error, info.componentStack)
  }

  private downloadData = () => {
    try {
      downloadFile(`mindhaven-backup-${today()}.json`, 'application/json', JSON.stringify(exportData(), null, 2))
    } catch {
      // The normal export failed; fall back to the unparsed storage contents so nothing is trapped.
      downloadFile(`mindhaven-raw-data-${today()}.json`, 'application/json', JSON.stringify(rawStorageDump(), null, 2))
    }
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-10 text-sage-800 dark:text-sage-100">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sage-700 dark:text-sage-300">
          Sorry — this page hit an unexpected problem. Your entries are still on this device and haven’t been
          deleted.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={buttonClass('primary')} onClick={() => this.setState({ error: null })}>
            Try again
          </button>
          <button type="button" className={buttonClass('secondary')} onClick={this.downloadData}>
            Download a copy of my data
          </button>
          <a className={buttonClass('secondary')} href="#/resources">
            Crisis resources
          </a>
        </div>
        <p className="text-sm text-sage-700 dark:text-sage-400">
          If it keeps happening, reload the page. If you need support right now, please use the crisis resources
          link above.
        </p>
        <details className="text-sm text-sage-700 dark:text-sage-400">
          <summary className="cursor-pointer">Technical details</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-sage-100 p-3 dark:bg-sage-900">
            {this.state.error.message}
          </pre>
        </details>
      </div>
    )
  }
}
