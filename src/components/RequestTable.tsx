import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { formatDate } from '../lib/format'
import type { RequestRow } from '../lib/types'

interface Props {
  caption: string
  rows: RequestRow[]
  showOwner?: boolean
  onOpen: (id: number) => void
  /** Optional extra row action (for example Decide), and the content shown under the open row. */
  actionLabel?: string
  expandedId?: number | null
  onAction?: (id: number) => void
  renderExpanded?: (row: RequestRow) => ReactNode
}

export function RequestTable({ caption, rows, showOwner, onOpen, actionLabel, expandedId, onAction, renderExpanded }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Type</th>
            <th scope="col">Sensitivity</th>
            <th scope="col">Effort</th>
            <th scope="col" className="num">
              Sponsor rank
            </th>
            <th scope="col">Status</th>
            {showOwner ? <th scope="col">Owner</th> : <th scope="col">Created</th>}
            <th scope="col">
              <span className="visually-hidden">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <Fragment key={r.id}>
              <tr>
                <th scope="row">{r.title || `Request ${r.id}`}</th>
                <td>{r.requestType}</td>
                <td>{r.dataSensitivity}</td>
                <td>{r.effort}</td>
                <td className="num">{r.sponsorRank ?? ''}</td>
                <td>
                  <span className="badge">{r.status || 'No status'}</span>
                </td>
                <td>{showOwner ? r.ownerEmail : formatDate(r.created)}</td>
                <td className="row-actions">
                  <button type="button" onClick={() => onOpen(r.id)} aria-label={`Open details for ${r.title || `request ${r.id}`}`}>
                    Open
                  </button>
                  {actionLabel && onAction ? (
                    <button type="button" aria-expanded={expandedId === r.id} onClick={() => onAction(r.id)}
                      aria-label={`${actionLabel} for ${r.title || `request ${r.id}`}`}>
                      {actionLabel}
                    </button>
                  ) : null}
                </td>
              </tr>
              {renderExpanded && expandedId === r.id ? (
                <tr>
                  <td colSpan={8}>{renderExpanded(r)}</td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
