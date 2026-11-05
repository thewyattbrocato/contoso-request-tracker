import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { createRequest } from '../lib/data'
import { EFFORTS, EFFORT_LABEL, REQUEST_TYPES, SENSITIVITIES, SENSITIVITY_HELP } from '../lib/types'
import type { Effort, RequestType, Sensitivity } from '../lib/types'

interface Props {
  email: string // the demo requester saved as OwnerEmail (a sample address, never the signed-in user)
  onCreated: (id: number) => void
  onViewMine: () => void
}

interface Form {
  title: string
  requestType: RequestType | ''
  businessOutcome: string
  sponsor: string
  sponsorRank: string
  effort: Effort | ''
  dataSensitivity: Sensitivity | ''
}

const EMPTY: Form = {
  title: '',
  requestType: '',
  businessOutcome: '',
  sponsor: '',
  sponsorRank: '',
  effort: '',
  dataSensitivity: '',
}

type Field = keyof Form
type Errors = Partial<Record<Field, string>>

function validate(f: Form): Errors {
  const e: Errors = {}
  const title = f.title.trim()
  if (!title) e.title = 'Enter a title.'
  else if (title.length > 255) e.title = 'Keep the title to 255 characters or fewer.'
  if (!f.requestType) e.requestType = 'Choose a request type.'
  if (!f.businessOutcome.trim()) e.businessOutcome = 'Describe the business outcome.'
  if (!f.dataSensitivity) e.dataSensitivity = 'Choose a data sensitivity.'
  if (!f.effort) e.effort = 'Choose an effort.'
  const rank = f.sponsorRank.trim()
  if (!rank) e.sponsorRank = 'Enter a sponsor rank.'
  else if (!/^\d+$/.test(rank) || !Number.isSafeInteger(Number(rank)) || Number(rank) < 1)
    e.sponsorRank = 'Enter a whole number, 1 or higher.'
  return e
}

const LABELS: Record<Field, string> = {
  title: 'Title',
  requestType: 'Request type',
  businessOutcome: 'Business outcome',
  sponsor: 'Sponsor',
  sponsorRank: 'Sponsor rank',
  effort: 'Effort',
  dataSensitivity: 'Data sensitivity',
}

export function SubmitView({ email, onCreated, onViewMine }: Props) {
  const [form, setForm] = useState<Form>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<number | null>(null)
  const savingRef = useRef(false) // blocks a double submit before React re-renders
  const uid = useId()

  const errors = validate(form)
  const missing = (Object.keys(errors) as Field[]).map((k) => LABELS[k])
  const valid = missing.length === 0

  const set = <K extends Field>(key: K, value: Form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSavedId(null)
  }
  const blur = (key: Field) => setTouched((t) => ({ ...t, [key]: true }))
  const shown = (key: Field) => (touched[key] ? errors[key] : undefined)
  const id = (key: string) => `${uid}-${key}`

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!valid || savingRef.current || form.requestType === '' || form.effort === '' || form.dataSensitivity === '') return
    savingRef.current = true
    setSaving(true)
    setError(null)
    try {
      const created = await createRequest({
        title: form.title.trim(),
        requestType: form.requestType,
        businessOutcome: form.businessOutcome.trim(),
        sponsor: form.sponsor.trim(),
        sponsorRank: Number(form.sponsorRank.trim()),
        effort: form.effort,
        dataSensitivity: form.dataSensitivity,
        ownerEmail: email,
      })
      setSavedId(created.id)
      setForm(EMPTY)
      setTouched({})
      onCreated(created.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Your request was not saved.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const describedBy = (key: Field, extra?: string) =>
    [shown(key) ? `${id(key)}-err` : '', extra ?? ''].filter(Boolean).join(' ') || undefined

  return (
    <section aria-labelledby="submit-heading">
      <h2 id="submit-heading">Submit a request</h2>
      <p className="note">Fictional Contoso practice data only. Do not enter real company information.</p>
      <p className="note">This request will be saved with owner {email}. Change it with Acting as, above.</p>

      <div aria-live="polite">
        {savedId !== null ? (
          <div className="banner banner-ok">
            <p>Saved as request {savedId}. Its status is Pending review, so it is now in the review queue.</p>
            <button type="button" onClick={onViewMine}>
              View my requests
            </button>
          </div>
        ) : null}
      </div>
      {error ? (
        <div role="alert" className="banner banner-error">
          <p>{error}</p>
          <p>Your answers are still here. Check your connection and try again.</p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor={id('title')}>Title</label>
          <input id={id('title')} type="text" value={form.title} maxLength={255} required aria-required="true"
            aria-invalid={shown('title') ? true : undefined} aria-describedby={describedBy('title')}
            onChange={(e) => set('title', e.target.value)} onBlur={() => blur('title')} />
          {shown('title') ? <p id={id('title-err')} className="err">{errors.title}</p> : null}
        </div>

        <div className="field">
          <label htmlFor={id('type')}>Request type</label>
          <select id={id('type')} value={form.requestType} required aria-required="true"
            aria-invalid={shown('requestType') ? true : undefined}
            aria-describedby={describedBy('requestType')}
            onChange={(e) => set('requestType', e.target.value as RequestType | '')} onBlur={() => blur('requestType')}>
            <option value="">Choose…</option>
            {REQUEST_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
          {shown('requestType') ? <p id={id('requestType-err')} className="err">{errors.requestType}</p> : null}
        </div>

        <div className="field">
          <label htmlFor={id('outcome')}>Business outcome</label>
          <textarea id={id('outcome')} rows={4} value={form.businessOutcome} required aria-required="true"
            aria-invalid={shown('businessOutcome') ? true : undefined}
            aria-describedby={describedBy('businessOutcome')}
            onChange={(e) => set('businessOutcome', e.target.value)} onBlur={() => blur('businessOutcome')} />
          {shown('businessOutcome') ? <p id={id('businessOutcome-err')} className="err">{errors.businessOutcome}</p> : null}
        </div>

        <div className="field">
          <label htmlFor={id('sensitivity')}>Data sensitivity</label>
          <select id={id('sensitivity')} value={form.dataSensitivity} required aria-required="true"
            aria-invalid={shown('dataSensitivity') ? true : undefined}
            aria-describedby={describedBy('dataSensitivity', id('sensitivity-help'))}
            onChange={(e) => set('dataSensitivity', e.target.value as Sensitivity | '')} onBlur={() => blur('dataSensitivity')}>
            <option value="">Choose…</option>
            {SENSITIVITIES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <p id={id('sensitivity-help')} className="help">
            {form.dataSensitivity ? SENSITIVITY_HELP[form.dataSensitivity] : 'Pick a level to see who has to review it.'}
          </p>
          {shown('dataSensitivity') ? <p id={id('dataSensitivity-err')} className="err">{errors.dataSensitivity}</p> : null}
        </div>

        <div className="field">
          <label htmlFor={id('effort')}>Effort</label>
          <select id={id('effort')} value={form.effort} required aria-required="true"
            aria-invalid={shown('effort') ? true : undefined}
            aria-describedby={describedBy('effort')}
            onChange={(e) => set('effort', e.target.value as Effort | '')} onBlur={() => blur('effort')}>
            <option value="">Choose…</option>
            {EFFORTS.map((x) => (<option key={x} value={x}>{EFFORT_LABEL[x]}</option>))}
          </select>
          {shown('effort') ? <p id={id('effort-err')} className="err">{errors.effort}</p> : null}
        </div>

        <div className="field">
          <label htmlFor={id('rank')}>Sponsor rank</label>
          <input id={id('rank')} type="text" inputMode="numeric" autoComplete="off" value={form.sponsorRank}
            required aria-required="true" aria-invalid={shown('sponsorRank') ? true : undefined}
            aria-describedby={describedBy('sponsorRank', id('rank-help'))}
            onChange={(e) => set('sponsorRank', e.target.value)} onBlur={() => blur('sponsorRank')} />
          <p id={id('rank-help')} className="help">Where the sponsor ranks this ask against their others. 1 is the highest priority.</p>
          {shown('sponsorRank') ? <p id={id('sponsorRank-err')} className="err">{errors.sponsorRank}</p> : null}
        </div>

        <div className="field">
          <label htmlFor={id('sponsor')}>Sponsor (optional)</label>
          <input id={id('sponsor')} type="text" value={form.sponsor} onChange={(e) => set('sponsor', e.target.value)} />
        </div>

        {!valid ? <p className="help">Still needed: {missing.join(', ')}.</p> : null}
        <button type="submit" className="primary" disabled={!valid || saving}>
          {saving ? 'Saving…' : 'Submit request'}
        </button>
      </form>
    </section>
  )
}
