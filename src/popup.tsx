import "~style.css"

import { useEffect, useState } from "react"

import { getWritingSettings, saveWritingSettings } from "~lib/storage"
import {
  DEFAULT_WRITING_SETTINGS,
  type WritingSettings,
  type WritingTone
} from "~types/writing"

const toneOptions: Array<{
  label: string
  value: WritingTone
  description: string
}> = [
  {
    label: "Clear",
    value: "clear",
    description: "Focus on grammar, clarity, and concise wording."
  },
  {
    label: "Friendly",
    value: "friendly",
    description: "Suggest softer phrasing for collaborative writing."
  },
  {
    label: "Professional",
    value: "professional",
    description: "Polish casual language for workplace communication."
  }
]

const Popup = () => {
  const [settings, setSettings] = useState<WritingSettings>(DEFAULT_WRITING_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setSettings(await getWritingSettings())
      } catch (err) {
        console.error(err)
        setError("Unable to load writing settings")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const persist = async (next: WritingSettings) => {
    setSettings(next)
    setError(null)
    setStatus(null)
    setIsSaving(true)

    try {
      await saveWritingSettings(next)
      setStatus("Settings saved. Refresh open tabs if the toolbar does not update immediately.")
    } catch (err) {
      console.error(err)
      setError("Failed to save your settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen w-[420px] bg-slate-50 p-4 text-slate-900">
      <header className="mb-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-violet-800 p-4 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">Writing Coach</p>
        <h1 className="mt-1 text-xl font-bold">Grammar and sentence improvement</h1>
        <p className="mt-2 text-sm leading-5 text-indigo-100">
          Works in Chrome and Firefox on text boxes, textareas, and rich-text editors. Suggestions run locally in your browser.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading settings…</p>
      ) : (
        <section className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">Suggestion tone</h2>
            <div className="mt-3 space-y-2">
              {toneOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40">
                  <input
                    type="radio"
                    name="tone"
                    value={option.value}
                    checked={settings.tone === option.value}
                    onChange={() => persist({ ...settings, tone: option.value })}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                    <span className="block text-xs leading-5 text-slate-500">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">Browser behavior</h2>
            <div className="mt-3 space-y-3">
              <label className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-sm font-medium">Auto-scan while typing</span>
                  <span className="block text-xs leading-5 text-slate-500">Refresh suggestions shortly after you edit text.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.autoScan}
                  onChange={(event) => persist({ ...settings, autoScan: event.target.checked })}
                  className="mt-1"
                />
              </label>

              <label className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-sm font-medium">Show floating toolbar</span>
                  <span className="block text-xs leading-5 text-slate-500">Display the Improve button when your cursor is in an editable field.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.showFloatingButton}
                  onChange={(event) => persist({ ...settings, showFloatingButton: event.target.checked })}
                  className="mt-1"
                />
              </label>
            </div>
          </article>

          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
            <strong>How to use:</strong> click into any writing field, press <span className="font-semibold">✍️ Improve</span>, review grammar,
            clarity, style, and tone suggestions, then apply one change or all changes.
          </article>
        </section>
      )}

      <footer className="mt-4 min-h-5 text-xs">
        {isSaving ? <p className="text-slate-500">Saving…</p> : null}
        {status ? <p className="text-emerald-700">{status}</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}
      </footer>
    </main>
  )
}

export default Popup
