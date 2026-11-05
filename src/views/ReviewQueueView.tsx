import { useState } from 'react'
import { Async } from '../components/Async'
import { DecisionPanel } from '../components/DecisionPanel'
import { RequestTable } from '../components/RequestTable'
import { listReviewQueue } from '../lib/data'
import type { Decision } from '../lib/data'
import { useAsync } from '../lib/useAsync'

interface Props {
  refreshKey: number
  decidedBy: string
  onOpen: (id: number) => void
  onDecided: () => void
}

// Hiding this tab from some people would be a convenience, not security.
// Who can read these rows is decided by the SharePoint list's permissions, not by this app.
export function ReviewQueueView({ refreshKey, decidedBy, onOpen, onDecided }: Props) {
  const [state, retry] = useAsync(() => listReviewQueue(), [refreshKey])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const decided = (id: number, decision: Decision) => {
    setNotice(`Request ${id} was marked ${decision} and its history entry was saved.`)
    setExpanded(null)
    onDecided() // refreshes the list; the decided request leaves the queue
  }

  return (
    <section aria-labelledby="queue-heading">
      <h2 id="queue-heading">Review queue</h2>
      <p className="note">
        New requests wait here for a person to decide; nothing is automatic.
      </p>
      <p className="note">Sorted by sponsor rank, then by effort (small first).</p>
      <div aria-live="polite">
        {notice ? (
          <div className="banner banner-ok">
            <p>{notice}</p>
          </div>
        ) : null}
      </div>
      <Async state={state} onRetry={retry} isEmpty={(rows) => rows.length === 0} emptyMessage="Nothing is waiting for review.">
        {(rows) => (
          <RequestTable
            caption={`${rows.length} request${rows.length === 1 ? '' : 's'} pending review`}
            rows={rows}
            showOwner
            onOpen={onOpen}
            actionLabel="Decide"
            expandedId={expanded}
            onAction={(id) => {
              setNotice(null)
              setExpanded((cur) => (cur === id ? null : id))
            }}
            renderExpanded={(r) => (
              <DecisionPanel requestId={r.id} title={r.title} decidedBy={decidedBy} onDecided={decided} />
            )}
          />
        )}
      </Async>
    </section>
  )
}
