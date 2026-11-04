import { Async } from '../components/Async'
import { RequestTable } from '../components/RequestTable'
import { listMyRequests } from '../lib/data'
import { useAsync } from '../lib/useAsync'

interface Props {
  requester: string // the demo requester chosen in "Acting as" (a sample address)
  refreshKey: number
  onOpen: (id: number) => void
}

export function MyRequestsView({ requester, refreshKey, onOpen }: Props) {
  const [state, retry] = useAsync(() => listMyRequests(requester), [requester, refreshKey])
  return (
    <section aria-labelledby="my-heading">
      <h2 id="my-heading">My requests</h2>
      <p className="note">Requests submitted by {requester}, newest first.</p>
      <Async
        state={state}
        onRetry={retry}
        isEmpty={(rows) => rows.length === 0}
        emptyMessage="This requester has no requests yet. Use the Submit tab to add one, or pick another sample requester above."
      >
        {(rows) => (
          <RequestTable caption={`${rows.length} request${rows.length === 1 ? '' : 's'} for ${requester}`} rows={rows} onOpen={onOpen} />
        )}
      </Async>
    </section>
  )
}
