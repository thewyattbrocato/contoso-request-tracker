import { useState } from 'react'
import { Async } from '../components/Async'
import { DecisionPanel } from '../components/DecisionPanel'
import type { Decision } from '../lib/data'
import { getRequest, listDecisionHistory } from '../lib/data'
import { formatDate } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import type { RequestRow } from '../lib/types'

interface Props {
  requestId: number | null
  decidedBy: string
  onBack: () => void
  onDecided: () => void
}

export function DetailView({ requestId, decidedBy, onBack, onDecided }: Props) {
  if (requestId === null) {
    return (
      <section aria-labelledby="detail-heading">
        <h2 id="detail-heading">Detail</h2>
        <p className="note empty">Choose a request from My requests or the Review queue to see it here.</p>
      </section>
    )
  }
  return <Loaded requestId={requestId} decidedBy={decidedBy} onBack={onBack} onDecided={onDecided} />
}

function Loaded({ requestId, decidedBy, onBack, onDecided }: { requestId: number; decidedBy: string; onBack: () => void; onDecided: () => void }) {
  // Bumped after a decision so the request and its history reload.
  const [reload, setReload] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const [request, retryRequest] = useAsync(() => getRequest(requestId), [requestId, reload])
  const [history, retryHistory] = useAsync(() => listDecisionHistory(requestId), [requestId, reload])

  const decided = (id: number, decision: Decision) => {
    setNotice(`Request ${id} was marked ${decision} and its history entry was saved.`)
    setReload((n) => n + 1)
    onDecided()
  }

  return (
    <section aria-labelledby="detail-heading">
      <h2 id="detail-heading">Detail</h2>
      <button type="button" className="link-button" onClick={onBack}>
        Back to the list
      </button>
      <div aria-live="polite">
        {notice ? (
          <div className="banner banner-ok">
            <p>{notice}</p>
          </div>
        ) : null}
      </div>
      <Async state={request} onRetry={retryRequest} emptyMessage="Request not found.">
        {(r) => (
          <>
            <RequestFields r={r} />
            {r.status === 'Pending review' ? (
              <DecisionPanel requestId={r.id} title={r.title} decidedBy={decidedBy} onDecided={decided} />
            ) : null}
          </>
        )}
      </Async>

      <h3>Decision history</h3>
      <Async state={history} onRetry={retryHistory} isEmpty={(rows) => rows.length === 0} emptyMessage="No decisions have been recorded for this request yet.">
        {(rows) => (
          <div className="table-wrap">
            <table>
              <caption>Newest decision first</caption>
              <thead>
                <tr>
                  <th scope="col">Decided on</th>
                  <th scope="col">Decision</th>
                  <th scope="col">Decided by</th>
                  <th scope="col">Rationale</th>
                  <th scope="col">AI suggestion used</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id}>
                    <th scope="row">{formatDate(d.decidedOn)}</th>
                    <td>
                      <span className="badge">{d.decision || 'None'}</span>
                    </td>
                    <td>{d.decidedBy}</td>
                    <td>{d.rationale}</td>
                    <td>{d.aiSuggestionUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Async>
    </section>
  )
}

function RequestFields({ r }: { r: RequestRow }) {
  return (
    <>
      <h3 className="request-title">{r.title || `Request ${r.id}`}</h3>
      <dl className="fields">
        <dt>Status</dt>
        <dd>
          <span className="badge">{r.status || 'No status'}</span>
        </dd>
        <dt>Type</dt>
        <dd>{r.requestType}</dd>
        <dt>Business outcome</dt>
        <dd className="prewrap">{r.businessOutcome}</dd>
        <dt>Sponsor</dt>
        <dd>{r.sponsor || 'Not given'}</dd>
        <dt>Sponsor rank</dt>
        <dd>{r.sponsorRank ?? 'Not given'}</dd>
        <dt>Effort</dt>
        <dd>{r.effort}</dd>
        <dt>Data sensitivity</dt>
        <dd>{r.dataSensitivity}</dd>
        <dt>Owner</dt>
        <dd>{r.ownerEmail}</dd>
        <dt>Created</dt>
        <dd>{formatDate(r.created)}</dd>
        {r.decisionRationale ? (
          <>
            <dt>Decision rationale</dt>
            <dd className="prewrap">{r.decisionRationale}</dd>
          </>
        ) : null}
      </dl>
    </>
  )
}
