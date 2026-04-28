import { DEFAULT_PROFILE_NAMES, type IdentityProfile } from "~types/profiles"

export const createEmptyProfile = (label: string): IdentityProfile => ({
  id: crypto.randomUUID(),
  label,
  fullName: "",
  email: "",
  phone: "",
  address: "",
  customFields: {},
  updatedAt: Date.now()
})

export const createDefaultProfiles = (): IdentityProfile[] =>
  DEFAULT_PROFILE_NAMES.map(createEmptyProfile)

export const mergeProfileUpdates = (
  profile: IdentityProfile,
  updates: Partial<IdentityProfile>
): IdentityProfile => ({
  ...profile,
  ...updates,
  customFields: {
    ...profile.customFields,
    ...(updates.customFields ?? {})
  },
  updatedAt: Date.now()
})
