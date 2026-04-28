import "~style.css"

import { useEffect, useMemo, useState } from "react"

import { createEmptyProfile, mergeProfileUpdates } from "~lib/profile-utils"
import { getProfiles, saveProfiles } from "~lib/storage"
import type { IdentityProfile } from "~types/profiles"

type FormMode = "create" | "edit"

const emptyDraft = (): IdentityProfile =>
  createEmptyProfile("New Profile")

const ProfileForm = ({
  value,
  onChange,
  onSave,
  onCancel,
  mode
}: {
  value: IdentityProfile
  onChange: (next: IdentityProfile) => void
  onSave: () => void
  onCancel: () => void
  mode: FormMode
}) => {
  const update = (key: keyof IdentityProfile, nextValue: string) => {
    onChange(mergeProfileUpdates(value, { [key]: nextValue } as Partial<IdentityProfile>))
  }

  const updateCustom = (key: string, nextValue: string) => {
    onChange(
      mergeProfileUpdates(value, {
        customFields: {
          ...value.customFields,
          [key]: nextValue
        }
      })
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          {mode === "create" ? "Add Profile" : "Edit Profile"}
        </h2>
        <button
          className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
          onClick={onCancel}
          type="button">
          Cancel
        </button>
      </div>

      <div className="space-y-2">
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-slate-300 focus:border-slate-400"
          placeholder="Profile name"
          value={value.label}
          onChange={(event) => update("label", event.target.value)}
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-slate-300 focus:border-slate-400"
          placeholder="Full name"
          value={value.fullName}
          onChange={(event) => update("fullName", event.target.value)}
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-slate-300 focus:border-slate-400"
          placeholder="Email"
          type="email"
          value={value.email}
          onChange={(event) => update("email", event.target.value)}
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-slate-300 focus:border-slate-400"
          placeholder="Phone"
          type="tel"
          value={value.phone}
          onChange={(event) => update("phone", event.target.value)}
        />
        <textarea
          className="min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-slate-300 focus:border-slate-400"
          placeholder="Address"
          value={value.address}
          onChange={(event) => update("address", event.target.value)}
        />
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Custom Fields</h3>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            onClick={() => {
              const key = window.prompt("Custom field key")?.trim().toLowerCase().replace(/\s+/g, "_")
              if (!key) return
              if (value.customFields[key] !== undefined) return
              updateCustom(key, "")
            }}>
            + Add
          </button>
        </div>

        <div className="space-y-2">
          {Object.entries(value.customFields).map(([key, fieldValue]) => (
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2" key={key}>
              <input
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500"
                readOnly
                value={key}
              />
              <input
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                value={fieldValue}
                onChange={(event) => updateCustom(key, event.target.value)}
              />
              <button
                className="rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-100"
                onClick={() => {
                  const next = { ...value.customFields }
                  delete next[key]
                  onChange(mergeProfileUpdates(value, { customFields: next }))
                }}
                type="button">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onSave}
        className="mt-4 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
        {mode === "create" ? "Create Profile" : "Save Changes"}
      </button>
    </section>
  )
}

function Popup() {
  const [profiles, setProfiles] = useState<IdentityProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mode, setMode] = useState<FormMode>("create")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [draft, setDraft] = useState<IdentityProfile>(emptyDraft())

  useEffect(() => {
    ;(async () => {
      try {
        setProfiles(await getProfiles())
      } catch (err) {
        console.error(err)
        setError("Failed to load profiles")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const canSubmit = useMemo(() => draft.label.trim().length > 0, [draft.label])

  const openCreate = () => {
    setMode("create")
    setDraft(emptyDraft())
    setIsFormOpen(true)
  }

  const openEdit = (profile: IdentityProfile) => {
    setMode("edit")
    setDraft(profile)
    setIsFormOpen(true)
  }

  const persistProfiles = async (next: IdentityProfile[]) => {
    setProfiles(next)
    await saveProfiles(next)
  }

  const handleSaveDraft = async () => {
    if (!canSubmit) return

    try {
      if (mode === "create") {
        await persistProfiles([...profiles, draft])
      } else {
        await persistProfiles(profiles.map((profile) => (profile.id === draft.id ? draft : profile)))
      }
      setIsFormOpen(false)
    } catch (err) {
      console.error(err)
      setError("Failed to save profile")
    }
  }

  const handleDelete = async (profileId: string) => {
    try {
      await persistProfiles(profiles.filter((profile) => profile.id !== profileId))
    } catch (err) {
      console.error(err)
      setError("Failed to delete profile")
    }
  }

  return (
    <main className="w-[400px] bg-slate-50 p-4 text-slate-900">
      <header className="mb-4">
        <h1 className="text-lg font-semibold">Smart Identity Autofill</h1>
        <p className="text-xs text-slate-500">Minimal profile dashboard for one-click web form autofill.</p>
      </header>

      <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Profiles</h2>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50">
            + Add Profile
          </button>
        </div>

        {loading ? <p className="text-xs text-slate-500">Loading...</p> : null}
        {!loading && profiles.length === 0 ? (
          <p className="text-xs text-slate-500">No profiles yet. Add your first profile.</p>
        ) : null}

        <div className="space-y-2">
          {profiles.map((profile) => (
            <article
              key={profile.id}
              className="rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{profile.label}</p>
                  <p className="text-xs text-slate-500">{profile.email || "No email set"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(profile)}
                    className="rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(profile.id)}
                    className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isFormOpen ? (
        <ProfileForm
          mode={mode}
          value={draft}
          onChange={setDraft}
          onSave={handleSaveDraft}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : null}

      {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
    </main>
  )
}

export default Popup
