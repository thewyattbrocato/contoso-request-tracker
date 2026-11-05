// All data access goes through the generated services in src/generated.
// Nothing here talks to SharePoint directly.
//
// Delegation: every filter and sort below uses only operators and columns that the
// SharePoint connector evaluates on the server (eq, and sorts on text, number and date
// columns). The one exception is the local re-sort in listReviewQueue, which only checks
// order on rows that are already fully loaded.

import { DecisionLogService, RequestsService } from '../generated'
import type { DecisionLogModel, RequestsModel } from '../generated'
import { EFFORT_RANK, STATUS_PENDING_REVIEW } from './types'
import type { DecisionRow, Effort, RequestRow, RequestType, Sensitivity } from './types'

const PAGE_SIZE = 100
const MAX_PAGES = 20 // 2,000 rows is far beyond this practice list; stops a runaway loop.

export class DataError extends Error {}

// Escape a value for an OData string literal: single quotes are doubled.
function odataString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

function describe(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

type Page<T> = { success: boolean; data: T[]; error?: unknown; skipToken?: string }

// Reads every page of a query. The connector pages on the server (top + skiptoken).
async function readAll<T>(fetchPage: (skipToken?: string) => Promise<Page<T>>, what: string): Promise<T[]> {
  const rows: T[] = []
  let skipToken: string | undefined
  for (let page = 0; page < MAX_PAGES; page++) {
    let result: Page<T>
    try {
      result = await fetchPage(skipToken)
    } catch (e) {
      throw new DataError(`Could not load ${what}. ${describe(e)}`)
    }
    if (!result.success) throw new DataError(`Could not load ${what}. ${describe(result.error)}`)
    rows.push(...(result.data ?? []))
    if (!result.skipToken) return rows
    skipToken = result.skipToken
  }
  return rows
}

function toRequest(r: RequestsModel.RequestsRead): RequestRow {
  return {
    id: r.ID ?? 0,
    title: r.Title ?? '',
    requestType: r.RequestType?.Value ?? '',
    businessOutcome: r.BusinessOutcome ?? '',
    sponsor: r.Sponsor ?? '',
    sponsorRank: r.SponsorRank ?? null,
    effort: r.Effort?.Value ?? '',
    effortRank: r.EffortRank ?? null,
    dataSensitivity: r.DataSensitivity?.Value ?? '',
    // StatusText is the text mirror that is safe to filter on; fall back to the choice value.
    status: r.StatusText || r.Status?.Value || '',
    ownerEmail: r.OwnerEmail ?? '',
    decisionRationale: r.DecisionRationale ?? '',
    created: r.Created ?? '',
  }
}

function toDecision(r: DecisionLogModel.DecisionLogRead): DecisionRow {
  return {
    id: r.ID ?? 0,
    requestId: r.RequestID,
    title: r.Title ?? '',
    decision: r.Decision?.Value ?? '',
    decidedBy: r.DecidedBy ?? '',
    rationale: r.Rationale ?? '',
    aiSuggestionUsed: r.AISuggestionUsed?.Value ?? '',
    decidedOn: r.DecidedOn ?? '',
  }
}

/** My requests: OwnerEmail equals the given requester address, newest first. */
export async function listMyRequests(email: string): Promise<RequestRow[]> {
  const filter = `OwnerEmail eq ${odataString(email.toLowerCase())}`
  const rows = await readAll(
    (skipToken) =>
      RequestsService.getAll({ filter, orderBy: ['Created desc'], top: PAGE_SIZE, maxPageSize: PAGE_SIZE, skipToken }),
    'your requests',
  )
  return rows.map(toRequest)
}

/** Review queue: StatusText is "Pending review", sorted by SponsorRank then EffortRank. */
export async function listReviewQueue(): Promise<RequestRow[]> {
  const filter = `StatusText eq ${odataString(STATUS_PENDING_REVIEW)}`
  const rows = await readAll(
    (skipToken) =>
      RequestsService.getAll({
        filter,
        orderBy: ['SponsorRank asc', 'EffortRank asc'],
        top: PAGE_SIZE,
        maxPageSize: PAGE_SIZE,
        skipToken,
      }),
    'the review queue',
  )
  // Safety net, not the sort: the server orders the rows. If the connector ever ignored the
  // second sort key, this keeps the list in the promised order. The queue is only the pending subset.
  return rows.map(toRequest).sort(
    (a, b) =>
      (a.sponsorRank ?? Number.MAX_SAFE_INTEGER) - (b.sponsorRank ?? Number.MAX_SAFE_INTEGER) ||
      (a.effortRank ?? Number.MAX_SAFE_INTEGER) - (b.effortRank ?? Number.MAX_SAFE_INTEGER),
  )
}

/** One request by its SharePoint item ID. */
export async function getRequest(id: number): Promise<RequestRow> {
  let result
  try {
    result = await RequestsService.get(String(id))
  } catch (e) {
    throw new DataError(`Could not load request ${id}. ${describe(e)}`)
  }
  if (!result.success || !result.data) throw new DataError(`Could not load request ${id}. ${describe(result.error)}`)
  return toRequest(result.data)
}

/** Decision history for one request: RequestID equals the item ID, newest first. */
export async function listDecisionHistory(requestId: number): Promise<DecisionRow[]> {
  const filter = `RequestID eq ${Number(requestId)}`
  const rows = await readAll(
    (skipToken) =>
      DecisionLogService.getAll({ filter, orderBy: ['DecidedOn desc'], top: PAGE_SIZE, maxPageSize: PAGE_SIZE, skipToken }),
    'the decision history',
  )
  return rows.map(toDecision)
}

export interface NewRequest {
  title: string
  requestType: RequestType
  businessOutcome: string
  sponsor: string
  sponsorRank: number
  effort: Effort
  dataSensitivity: Sensitivity
  ownerEmail: string
}

/** Creates a request with Status and StatusText "Pending review", so it lands in the review queue. Throws DataError with a friendly message. */
export async function createRequest(input: NewRequest): Promise<RequestRow> {
  let result
  try {
    result = await RequestsService.create({
      Title: input.title,
      RequestType: input.requestType,
      BusinessOutcome: input.businessOutcome,
      Sponsor: input.sponsor || undefined,
      SponsorRank: input.sponsorRank,
      Effort: input.effort,
      EffortRank: EFFORT_RANK[input.effort],
      DataSensitivity: input.dataSensitivity,
      Status: STATUS_PENDING_REVIEW,
      StatusText: STATUS_PENDING_REVIEW,
      OwnerEmail: input.ownerEmail.toLowerCase(),
    })
  } catch (e) {
    throw new DataError(`Your request was not saved. ${describe(e)}`)
  }
  if (!result.success) throw new DataError(`Your request was not saved. ${describe(result.error)}`)
  return toRequest(result.data)
}

export type Decision = 'Approved' | 'Rejected'

/** Step 1 of a human decision: Status, StatusText and DecisionRationale on the Requests item. */
export async function recordDecisionOnRequest(requestId: number, decision: Decision, rationale: string): Promise<void> {
  let result
  try {
    result = await RequestsService.update(String(requestId), {
      Status: decision,
      StatusText: decision,
      DecisionRationale: rationale,
    })
  } catch (e) {
    throw new DataError(`The request was not updated. ${describe(e)}`)
  }
  if (!result.success) throw new DataError(`The request was not updated. ${describe(result.error)}`)
}

export interface DecisionEntry {
  requestId: number
  decision: Decision
  decidedBy: string // a sample address from Acting as, never the signed-in user
  rationale: string
}

/** Step 2: the DecisionLog history row. AISuggestionUsed is No: the person decided without a suggestion. */
export async function addDecisionLogEntry(entry: DecisionEntry): Promise<void> {
  let result
  try {
    result = await DecisionLogService.create({
      Title: `Decision for request ${entry.requestId}`,
      RequestID: entry.requestId,
      Decision: entry.decision,
      DecidedBy: entry.decidedBy,
      Rationale: entry.rationale,
      AISuggestionUsed: 'No',
      DecidedOn: new Date().toISOString(),
    })
  } catch (e) {
    throw new DataError(`The history entry was not saved. ${describe(e)}`)
  }
  if (!result.success) throw new DataError(`The history entry was not saved. ${describe(result.error)}`)
}
