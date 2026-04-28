import { FIELD_MATCHERS, IGNORED_INPUT_TYPES } from "~lib/constants"

export type CandidateInput = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

const getHint = (field: CandidateInput): string => {
  const attrs = [
    field.name,
    field.id,
    field.getAttribute("placeholder") ?? "",
    field.getAttribute("aria-label") ?? "",
    field.getAttribute("autocomplete") ?? ""
  ]

  const label =
    field.id.length > 0
      ? document.querySelector(`label[for="${CSS.escape(field.id)}"]`)?.textContent ?? ""
      : ""

  return `${attrs.join(" ")} ${label}`.toLowerCase()
}

export const isFillableField = (node: Element): node is CandidateInput => {
  if (!(node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement)) {
    return false
  }

  if (node instanceof HTMLInputElement && IGNORED_INPUT_TYPES.has(node.type)) {
    return false
  }

  return !node.readOnly && !node.disabled
}

export const detectFieldKey = (field: CandidateInput): string | null => {
  if (field instanceof HTMLInputElement) {
    if (field.type === "email") {
      return "email"
    }

    if (field.type === "tel") {
      return "phone"
    }
  }

  const hint = getHint(field)
  if (!hint) {
    return null
  }

  for (const [key, patterns] of Object.entries(FIELD_MATCHERS)) {
    if (patterns.some((pattern) => pattern.test(hint))) {
      return key
    }
  }

  const normalized = hint
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join("_")

  return normalized || null
}
