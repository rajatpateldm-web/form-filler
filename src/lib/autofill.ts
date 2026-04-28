import { detectFieldKey, isFillableField } from "~lib/form-detection"
import type { CandidateInput } from "~lib/form-detection"
import type { IdentityProfile } from "~types/profiles"

const applyValue = (field: CandidateInput, value: string) => {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    field instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : field instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLSelectElement.prototype,
    "value"
  )?.set

  if (nativeSetter) {
    nativeSetter.call(field, value)
  } else {
    field.value = value
  }

  field.dispatchEvent(new Event("input", { bubbles: true }))
  field.dispatchEvent(new Event("change", { bubbles: true }))
}

export const autofillForm = (profile: IdentityProfile): number => {
  const fields = [...document.querySelectorAll("input, textarea, select")].filter(isFillableField)
  let filled = 0

  fields.forEach((field) => {
    const key = detectFieldKey(field)
    if (!key) {
      return
    }

    const value =
      key in profile
        ? String(profile[key as keyof IdentityProfile] ?? "")
        : profile.customFields[key] ?? ""

    if (!value || field.value === value) {
      return
    }

    applyValue(field, value)
    filled += 1
  })

  return filled
}

export const collectNewFieldValues = (profile: IdentityProfile): IdentityProfile => {
  const fields = [...document.querySelectorAll("input, textarea, select")].filter(isFillableField)
  const nextCustom = { ...profile.customFields }

  fields.forEach((field) => {
    const key = detectFieldKey(field)
    const value = field.value?.trim()

    if (!key || !value) {
      return
    }

    if (["fullName", "email", "phone", "address"].includes(key)) {
      return
    }

    if (!nextCustom[key]) {
      nextCustom[key] = value
    }
  })

  return {
    ...profile,
    customFields: nextCustom,
    updatedAt: Date.now()
  }
}
