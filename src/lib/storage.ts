import { Storage } from "@plasmohq/storage"

import { STORAGE_KEY } from "~lib/constants"
import { createDefaultProfiles } from "~lib/profile-utils"
import type { IdentityProfile } from "~types/profiles"

const storage = new Storage({ area: "local" })

export const getProfiles = async (): Promise<IdentityProfile[]> => {
  try {
    const stored = await storage.get<IdentityProfile[]>(STORAGE_KEY)

    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      const defaults = createDefaultProfiles()
      await storage.set(STORAGE_KEY, defaults)
      return defaults
    }

    return stored
  } catch (error) {
    console.error("[Smart Identity Autofill] Failed to load profiles", error)
    return createDefaultProfiles()
  }
}

export const saveProfiles = async (profiles: IdentityProfile[]): Promise<void> => {
  try {
    await storage.set(STORAGE_KEY, profiles)
  } catch (error) {
    console.error("[Smart Identity Autofill] Failed to save profiles", error)
    throw new Error("Unable to save identity profiles")
  }
}

export const updateProfileById = async (
  profileId: string,
  updater: (profile: IdentityProfile) => IdentityProfile
): Promise<IdentityProfile[]> => {
  const profiles = await getProfiles()
  const next = profiles.map((profile) =>
    profile.id === profileId ? updater(profile) : profile
  )
  await saveProfiles(next)
  return next
}
