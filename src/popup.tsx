import "~style.css"

import { useEffect, useMemo, useState } from "react"

import { ProfileCard } from "~components/ProfileCard"
import { createEmptyProfile, mergeProfileUpdates } from "~lib/profile-utils"
import { getProfiles, saveProfiles } from "~lib/storage"
import type { IdentityProfile } from "~types/profiles"

const Popup = () => {
  const [profiles, setProfiles] = useState<IdentityProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getProfiles()
        setProfiles(data)
      } catch (err) {
        console.error(err)
        setError("Unable to load profiles")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const canSave = useMemo(() => profiles.length > 0 && !isSaving, [profiles, isSaving])

  const updateProfile = (profileId: string, updates: Partial<IdentityProfile>) => {
    setProfiles((current) =>
      current.map((profile) =>
        profile.id === profileId ? mergeProfileUpdates(profile, updates) : profile
      )
    )
  }

  const handleSave = async () => {
    setError(null)
    setIsSaving(true)

    try {
      await saveProfiles(profiles)
    } catch (err) {
      console.error(err)
      setError("Failed to save your updates")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen w-[420px] bg-slate-50 p-4">
      <header className="mb-4">
        <h1 className="text-lg font-semibold">Smart Identity Autofill</h1>
        <p className="text-xs text-slate-500">Manage reusable identity profiles for one-click form filling.</p>
      </header>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading profiles…</p>
      ) : (
        <section className="space-y-3">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onChange={(profileId, field, value) =>
                updateProfile(profileId, { [field]: value } as Partial<IdentityProfile>)
              }
              onCustomChange={(profileId, key, value) => {
                const existing = profiles.find((profile) => profile.id === profileId)
                if (!existing) {
                  return
                }

                updateProfile(profileId, {
                  customFields: {
                    ...existing.customFields,
                    [key]: value
                  }
                })
              }}
              onAddCustomField={(profileId) => {
                const fieldName = window.prompt("Enter custom field key (e.g. company, website)")
                if (!fieldName) {
                  return
                }

                const sanitized = fieldName.trim().toLowerCase().replace(/\s+/g, "_")
                if (!sanitized) {
                  return
                }

                const existing = profiles.find((profile) => profile.id === profileId)
                if (!existing) {
                  return
                }

                updateProfile(profileId, {
                  customFields: {
                    ...existing.customFields,
                    [sanitized]: existing.customFields[sanitized] ?? ""
                  }
                })
              }}
            />
          ))}
        </section>
      )}

      <footer className="sticky bottom-0 mt-4 border-t border-slate-200 bg-slate-50 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setProfiles((current) => [...current, createEmptyProfile(`Profile ${current.length + 1}`)])}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white">
            + New profile
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>

        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      </footer>
    </main>
  )
}

export default Popup
