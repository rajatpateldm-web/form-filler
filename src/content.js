const STORAGE_KEY = "smartIdentityProfiles"
const LAST_PROFILE_KEY = "smartIdentityLastProfileId"

const FIELD_PATTERNS = {
  name: [/full\s*name/i, /first\s*name/i, /last\s*name/i, /name/i],
  email: [/email/i, /e-?mail/i],
  phone: [/phone/i, /mobile/i, /tel/i],
  address: [/address/i, /street/i, /city/i, /state/i, /zip/i, /postal/i]
}

const IGNORED_TYPES = new Set(["hidden", "password", "submit", "button", "reset", "checkbox", "radio", "file", "image"])

const state = {
  activeElement: null,
  fields: [],
  profiles: [],
  modalOpen: false,
  scanQueued: false
}

const root = document.createElement("div")
root.id = "smart-autofill-ui"
root.style.cssText = "all:initial;position:fixed;right:20px;bottom:20px;z-index:2147483647;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;"
document.documentElement.appendChild(root)

const button = document.createElement("button")
button.textContent = "⚡"
button.type = "button"
button.title = "Smart Autofill"
button.style.cssText = "width:44px;height:44px;border:none;border-radius:999px;background:#111827;color:#fff;font-size:18px;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.22);display:none;transition:transform .15s ease, background .15s ease;"
button.onmouseenter = () => (button.style.transform = "translateY(-1px)")
button.onmouseleave = () => (button.style.transform = "translateY(0)")
root.appendChild(button)

const modalBackdrop = document.createElement("div")
modalBackdrop.style.cssText = "position:fixed;inset:0;background:rgba(15,23,42,.3);display:none;align-items:center;justify-content:center;"
root.appendChild(modalBackdrop)

const modal = document.createElement("div")
modal.style.cssText = "width:320px;max-width:calc(100vw - 32px);background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 30px 70px rgba(15,23,42,.25);padding:14px;"
modalBackdrop.appendChild(modal)

const modalHeader = document.createElement("div")
modalHeader.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;"
modal.appendChild(modalHeader)

const modalTitle = document.createElement("h3")
modalTitle.textContent = "Select Profile"
modalTitle.style.cssText = "margin:0;font-size:14px;font-weight:600;color:#0f172a;"
modalHeader.appendChild(modalTitle)

const closeButton = document.createElement("button")
closeButton.type = "button"
closeButton.textContent = "✕"
closeButton.style.cssText = "border:none;background:transparent;color:#64748b;cursor:pointer;border-radius:8px;padding:4px 7px;"
closeButton.onmouseenter = () => (closeButton.style.background = "#f1f5f9")
closeButton.onmouseleave = () => (closeButton.style.background = "transparent")
modalHeader.appendChild(closeButton)

const listContainer = document.createElement("div")
listContainer.style.cssText = "display:flex;flex-direction:column;gap:8px;max-height:260px;overflow:auto;"
modal.appendChild(listContainer)

const note = document.createElement("p")
note.style.cssText = "margin:10px 0 0;font-size:11px;color:#64748b;"
modal.appendChild(note)

function safe(action, fallback = null) {
  try {
    return action()
  } catch (error) {
    console.warn("[Smart Autofill]", error)
    return fallback
  }
}

function normalize(text) {
  return String(text || "").trim().toLowerCase()
}

function getLabelText(field) {
  if (!field.id) return ""
  return safe(() => document.querySelector(`label[for="${CSS.escape(field.id)}"]`)?.textContent || "", "")
}

function fieldHint(field) {
  return normalize([
    getLabelText(field),
    field.getAttribute("placeholder") || "",
    field.getAttribute("name") || "",
    field.getAttribute("aria-label") || "",
    field.id || ""
  ].join(" "))
}

function isFillable(element) {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
    return false
  }

  if (element.disabled || element.readOnly) return false

  if (element instanceof HTMLInputElement && IGNORED_TYPES.has(element.type)) return false

  const style = window.getComputedStyle(element)
  if (style.display === "none" || style.visibility === "hidden") return false

  return true
}

function detectKey(element) {
  if (element instanceof HTMLInputElement) {
    if (element.type === "email") return "email"
    if (element.type === "tel") return "phone"
  }

  const hint = fieldHint(element)
  if (!hint) return null

  for (const [key, regexes] of Object.entries(FIELD_PATTERNS)) {
    if (regexes.some((regex) => regex.test(hint))) return key
  }

  return null
}

function collectFields(rootNode = document) {
  return Array.from(rootNode.querySelectorAll("input,textarea,select"))
    .filter(isFillable)
    .map((element) => ({ element, key: detectKey(element) }))
    .filter((entry) => Boolean(entry.key))
}

function queueScan() {
  if (state.scanQueued) return
  state.scanQueued = true

  requestAnimationFrame(() => {
    state.scanQueued = false
    state.fields = collectFields(document)
    button.style.display = state.fields.length > 0 ? "inline-flex" : "none"
  })
}

function scopedFields() {
  const focused = state.activeElement
  if (focused instanceof Element) {
    const form = focused.closest("form")
    if (form) return collectFields(form)
  }

  return state.fields
}

function setValue(element, value) {
  const proto = element instanceof HTMLInputElement
    ? HTMLInputElement.prototype
    : element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLSelectElement.prototype

  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set

  if (setter) setter.call(element, value)
  else element.value = value

  element.dispatchEvent(new Event("input", { bubbles: true }))
  element.dispatchEvent(new Event("change", { bubbles: true }))
}

function profileValues(profile) {
  return {
    name: profile.fullName || profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    address: profile.address || ""
  }
}

function fillProfile(profile) {
  const values = profileValues(profile)
  const fields = scopedFields()
  let count = 0

  fields.forEach(({ element, key }) => {
    const value = values[key]
    if (!value || element.value === value) return
    setValue(element, value)
    count += 1
  })

  return count
}

function storageGet(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve))
}

function storageSet(payload) {
  return new Promise((resolve) => chrome.storage.local.set(payload, resolve))
}

async function loadProfiles() {
  const data = await storageGet([STORAGE_KEY])
  return Array.isArray(data?.[STORAGE_KEY]) ? data[STORAGE_KEY] : []
}

async function lastProfileId() {
  const data = await storageGet([LAST_PROFILE_KEY])
  return data?.[LAST_PROFILE_KEY] || null
}

function openModal() {
  state.modalOpen = true
  modalBackdrop.style.display = "flex"
}

function closeModal() {
  state.modalOpen = false
  modalBackdrop.style.display = "none"
}

async function renderProfileSelector() {
  state.profiles = await loadProfiles()
  listContainer.innerHTML = ""

  if (!state.profiles.length) {
    const empty = document.createElement("p")
    empty.textContent = "No saved profiles. Create one from the extension popup."
    empty.style.cssText = "margin:0;padding:10px;border:1px dashed #cbd5e1;border-radius:12px;color:#64748b;font-size:12px;"
    listContainer.appendChild(empty)
    note.textContent = ""
    return
  }

  const lastId = await lastProfileId()

  state.profiles.forEach((profile) => {
    const card = document.createElement("button")
    card.type = "button"
    card.style.cssText = "text-align:left;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px;cursor:pointer;transition:background .15s ease,border-color .15s ease;"
    card.onmouseenter = () => {
      card.style.background = "#f8fafc"
      card.style.borderColor = "#cbd5e1"
    }
    card.onmouseleave = () => {
      card.style.background = "#fff"
      card.style.borderColor = "#e2e8f0"
    }

    card.innerHTML = `<div style="font-size:13px;font-weight:600;color:#0f172a;">${profile.label || "Untitled"}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px;">${profile.email || "No email"}</div>`

    if (profile.id === lastId) {
      card.style.borderColor = "#94a3b8"
    }

    card.addEventListener("click", async () => {
      const count = safe(() => fillProfile(profile), 0)
      await storageSet({ [LAST_PROFILE_KEY]: profile.id })
      note.textContent = count > 0 ? `Filled ${count} field${count > 1 ? "s" : ""}.` : "No matching fields found."
      closeModal()
    })

    listContainer.appendChild(card)
  })

  note.textContent = "Choose a profile to autofill this form."
}

button.addEventListener("click", async () => {
  await renderProfileSelector()
  openModal()
})

closeButton.addEventListener("click", closeModal)

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeModal()
})

document.addEventListener("focusin", (event) => {
  state.activeElement = event.target instanceof Element ? event.target : null
})

new MutationObserver(queueScan).observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["name", "placeholder", "aria-label", "id", "class", "style"]
})

queueScan()
