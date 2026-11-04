// Shared constants and view-model types. Values match the SharePoint choice values exactly.

export const REQUEST_TYPES = ['Engineering', 'Non-engineering'] as const
export const EFFORTS = ['S', 'M', 'L'] as const
export const SENSITIVITIES = ['Public', 'Internal', 'Confidential'] as const

export type RequestType = (typeof REQUEST_TYPES)[number]
export type Effort = (typeof EFFORTS)[number]
export type Sensitivity = (typeof SENSITIVITIES)[number]

// Numeric mirror of Effort, used so the review queue can sort on a delegable number column.
export const EFFORT_RANK: Record<Effort, number> = { S: 1, M: 2, L: 3 }

export const EFFORT_LABEL: Record<Effort, string> = {
  S: 'S (small)',
  M: 'M (medium)',
  L: 'L (large)',
}

export const SENSITIVITY_HELP: Record<Sensitivity, string> = {
  Public: 'Safe to share broadly. One reviewer.',
  Internal: 'Employees only. One reviewer.',
  Confidential: 'Named people only. Adds a data-owner approval.',
}

// The status text the review queue filters on.
export const STATUS_SUBMITTED = 'Submitted'
export const STATUS_PENDING_REVIEW = 'Pending review'

export interface RequestRow {
  id: number
  title: string
  requestType: string
  businessOutcome: string
  sponsor: string
  sponsorRank: number | null
  effort: string
  effortRank: number | null
  dataSensitivity: string
  status: string
  ownerEmail: string
  decisionRationale: string
  created: string
}

export interface DecisionRow {
  id: number
  requestId: number
  title: string
  decision: string
  decidedBy: string
  rationale: string
  aiSuggestionUsed: string
  decidedOn: string
}

// Sample requesters in the fictional demo data. These are not real people or real mailboxes.
// The signed-in user's own address is never listed here: it is read at run time and kept in memory only.
export const SAMPLE_REQUESTERS = [
  'wyatt.demo@contoso.example',
  'mokafor@contoso.example',
  'lfischer@contoso.example',
  'nhaddad@contoso.example',
] as const

export const DEFAULT_REQUESTER = SAMPLE_REQUESTERS[0]
