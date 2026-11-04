import { useId, useRef, useState } from 'react'
import { addDecisionLogEntry, recordDecisionOnRequest } from '../lib/data'
import type { Decision, DecisionEntry } from '../lib/data'

interface Props {
  requestId: number
  title: string
  decidedBy: string // the Acting as sample address
  onDecided: (requestId: number, decision: Decision) => void
}

type Phase =
  | { name: 'editing' }
  | { name: 'confirming'; decision: Decision }
  | { name: 'saving'; decision: Decision }
  | { name: 'updateFailed'; decision: Decision; message: string }
  // The request is already updated; only the history row is missing.
  | { name: 'logFailed'; entry: DecisionEntry; message: string }

/**
 * A person's decision on a pending request. Nothing here is automatic: it only writes what the
 * reviewer chose, in two steps (update the request, then add the history row). If the second step
 * fails, the panel says so and retries only that step, so the request is never decided twice.
 */
export function DecisionPanel({ requestId, title, decidedBy, onDecided }: Props) {
  const uid = useId()
  const [rationale, setRationale] = useState('')
  const [phase, setPhase] = useState<Phase>({ name: 'editing' })
  const busy = useRef(false)

  const text = rationale.trim()
  const canChoose = text.length > 0

  async function writeLog(entry: DecisionEntry) {
    try {
      await addDecisionLogEntry(entry)
    } catch (e) {
      setPhase({ name: 'logFailed', entry, message: e instanceof Error ? e.message : 'The history entry was not saved.' })
      return false
    }
    return true
  }

  async function confirm(decision: Decision) {
    if (busy.current) return
    busy.current = true
    setPhase({ name: 'saving', decision })
    try {
      try {
        await recordDecisionOnRequest(requestId, decision, text)
      } catch (e) {
        setPhase({ name: 'updateFailed', decision, message: e instanceof Error ? e.message : 'The request was not updated.' })
        return
      }
      const entry: DecisionEntry = { requestId, decision, decidedBy, rationale: text }
      if (await writeLog(entry)) onDecided(requestId, decision)
    } finally {
      busy.current = false
    }
  }

  async function retryLog(entry: DecisionEntry) {
    if (busy.current) return
    busy.current = true
    setPhase({ name: 'saving', decision: entry.decision })
    try {
      if (await writeLog(entry)) onDecided(entry.requestId, entry.decision)
    } finally {
      busy.current = false
    }
  }

  const locked = phase.name === 'saving' || phase.name === 'logFailed'

  return (
    <fieldset className="decision" disabled={phase.name === 'saving'}>
      <legend>Reviewer decision; nothing is automatic</legend>
      <p className="help">
        Request {requestId}: {title || 'untitled'}. Recorded as {decidedBy}.
      </p>

      {phase.name === 'logFailed' ? (
        <div role="alert" className="banner banner-error">
          <p>
            The request is now {phase.entry.decision}, but its history entry was not saved. {phase.message}
          </p>
          <button type="button" onClick={() => retryLog(phase.entry)}>
            Retry saving the history entry
          </button>
        </div>
      ) : (
        <>
          <label htmlFor={`${uid}-why`}>Rationale (required)</label>
          <textarea id={`${uid}-why`} rows={3} value={rationale} disabled={locked}
            aria-describedby={`${uid}-why-help`} onChange={(e) => setRationale(e.target.value)} />
          <p id={`${uid}-why-help`} className="help">
            Say why. Approve and Reject stay disabled until this is filled in.
          </p>
        </>
      )}

      {phase.name === 'updateFailed' ? (
        <div role="alert" className="banner banner-error">
          <p>{phase.message}</p>
          <p>Nothing was changed. Your rationale is still here; choose Approve or Reject to try again.</p>
        </div>
      ) : null}

      {phase.name === 'editing' || phase.name === 'updateFailed' ? (
        <div className="actions">
          <button type="button" disabled={!canChoose} onClick={() => setPhase({ name: 'confirming', decision: 'Approved' })}>
            Approve
          </button>
          <button type="button" disabled={!canChoose} onClick={() => setPhase({ name: 'confirming', decision: 'Rejected' })}>
            Reject
          </button>
        </div>
      ) : null}

      {phase.name === 'confirming' ? (
        <div role="group" aria-label="Confirm decision" className="banner">
          <p>
            Mark request {requestId} as {phase.decision} with this rationale?
          </p>
          <div className="actions">
            <button type="button" className="primary" autoFocus onClick={() => confirm(phase.decision)}>
              Confirm {phase.decision === 'Approved' ? 'approval' : 'rejection'}
            </button>
            <button type="button" onClick={() => setPhase({ name: 'editing' })}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {phase.name === 'saving' ? (
        <p role="status" className="note">
          Saving…
        </p>
      ) : null}
    </fieldset>
  )
}
