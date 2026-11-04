import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useCurrentUser } from './lib/user'
import { DEFAULT_REQUESTER, SAMPLE_REQUESTERS } from './lib/types'
import { SubmitView } from './views/SubmitView'
import { MyRequestsView } from './views/MyRequestsView'
import { ReviewQueueView } from './views/ReviewQueueView'
import { DetailView } from './views/DetailView'

const TABS = [
  { id: 'submit', label: 'Submit' },
  { id: 'mine', label: 'My requests' },
  { id: 'queue', label: 'Review queue' },
  { id: 'detail', label: 'Detail' },
] as const

type TabId = (typeof TABS)[number]['id']

function App() {
  const user = useCurrentUser()
  const [tab, setTab] = useState<TabId>('submit')
  const [selected, setSelected] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  // Demo requester used for both saving and listing. The signed-in address is never stored or queried.
  const [actingAs, setActingAs] = useState<string>(DEFAULT_REQUESTER)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const open = (id: number) => {
    setSelected(id)
    setTab('detail')
  }

  // Keyboard pattern for tabs: arrows move and activate, Home and End jump.
  function onKeyDown(ev: KeyboardEvent, index: number) {
    let next = index
    if (ev.key === 'ArrowRight') next = (index + 1) % TABS.length
    else if (ev.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length
    else if (ev.key === 'Home') next = 0
    else if (ev.key === 'End') next = TABS.length - 1
    else return
    ev.preventDefault()
    setTab(TABS[next].id)
    tabRefs.current[TABS[next].id]?.focus()
  }

  return (
    <div className="shell">
      <a className="skip" href="#panel">Skip to content</a>
      <header>
        <h1>Contoso Request Tracker</h1>
        <p className="note">
          {user.state === 'ready' ? `Signed in as ${user.name}. ` : ''}Practice app with fictional Contoso data.
        </p>
      </header>

      <div role="tablist" aria-label="Sections" className="tabs">
        {TABS.map((t, i) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id}
            aria-controls="panel" tabIndex={tab === t.id ? 0 : -1}
            ref={(el) => { tabRefs.current[t.id] = el }}
            onClick={() => setTab(t.id)} onKeyDown={(e) => onKeyDown(e, i)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'submit' || tab === 'mine' || tab === 'queue' || tab === 'detail' ? (
        <div className="field acting">
          <label htmlFor="acting-as">Acting as (demo)</label>
          <select id="acting-as" value={actingAs} onChange={(e) => setActingAs(e.target.value)}>
            {SAMPLE_REQUESTERS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <p className="help">
            Sample requesters, so the demo shows a populated list. New requests are saved with this address, My requests lists it, and
            decisions are recorded under it. This is a demo convenience, not a permission, and the signed-in address is never stored.
          </p>
        </div>
      ) : null}

      <main id="panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={-1}>
        {tab === 'submit' ? (
          <SubmitView email={actingAs} onCreated={() => setRefreshKey((n) => n + 1)} onViewMine={() => setTab('mine')} />
        ) : null}
        {tab === 'mine' ? <MyRequestsView requester={actingAs} refreshKey={refreshKey} onOpen={open} /> : null}
        {tab === 'queue' ? <ReviewQueueView refreshKey={refreshKey} decidedBy={actingAs} onOpen={open} onDecided={() => setRefreshKey((n) => n + 1)} /> : null}
        {tab === 'detail' ? <DetailView requestId={selected} decidedBy={actingAs} onBack={() => setTab('mine')} onDecided={() => setRefreshKey((n) => n + 1)} /> : null}
      </main>
    </div>
  )
}

export default App
