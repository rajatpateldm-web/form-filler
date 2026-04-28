import { autofillForm, collectNewFieldValues } from "~lib/autofill"
import { isFillableField } from "~lib/form-detection"
import { getProfiles, saveProfiles } from "~lib/storage"
import type { IdentityProfile } from "~types/profiles"

let profilesCache: IdentityProfile[] = []
let selectedProfileId: string | null = null
let activeForm: HTMLFormElement | null = null
let isOpen = false

const root = document.createElement("div")
root.id = "smart-identity-autofill-root"
root.style.all = "initial"
root.style.position = "fixed"
root.style.bottom = "20px"
root.style.right = "20px"
root.style.zIndex = "2147483647"
root.style.fontFamily = "Inter, system-ui, -apple-system, sans-serif"
document.documentElement.appendChild(root)

const container = document.createElement("div")
container.style.position = "relative"
root.appendChild(container)

const button = document.createElement("button")
button.textContent = "⚡ Autofill"
button.type = "button"
button.style.cssText = `
  border: 1px solid #e2e8f0;
  background: #0f172a;
  color: #fff;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  padding: 9px 14px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(2,6,23,0.28);
`
container.appendChild(button)

const panel = document.createElement("div")
panel.style.cssText = `
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  min-width: 230px;
  max-width: 280px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.16);
  padding: 10px;
  display: none;
`
container.appendChild(panel)

const statusLine = document.createElement("p")
statusLine.style.cssText = "margin: 0 0 6px; font-size: 11px; color: #64748b;"
statusLine.textContent = "Choose a profile"
panel.appendChild(statusLine)

const list = document.createElement("div")
list.style.cssText = "display: flex; flex-direction: column; gap: 6px;"
panel.appendChild(list)

const empty = document.createElement("p")
empty.textContent = "No profiles found. Create one in extension popup."
empty.style.cssText = "margin: 0; color: #64748b; font-size: 12px;"

const setPanelOpen = (next: boolean) => {
  isOpen = next
  panel.style.display = next ? "block" : "none"
}

const renderProfiles = () => {
  list.innerHTML = ""

  if (profilesCache.length === 0) {
    list.appendChild(empty)
    return
  }

  profilesCache.forEach((profile) => {
    const item = document.createElement("button")
    item.type = "button"
    item.style.cssText = `
      width: 100%;
      text-align: left;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #0f172a;
      border-radius: 10px;
      padding: 8px;
      cursor: pointer;
      font-size: 12px;
    `

    item.innerHTML = `<strong style="display:block;font-size:12px;">${profile.label}</strong>
      <span style="font-size:11px;color:#64748b;">${profile.email || "No email yet"}</span>`

    item.addEventListener("click", async () => {
      try {
        const filled = autofillForm(profile)
        selectedProfileId = profile.id
        statusLine.textContent =
          filled > 0 ? `Filled ${filled} field${filled > 1 ? "s" : ""}.` : "No matching fields found."
        setPanelOpen(false)
      } catch (error) {
        console.error("[Smart Identity Autofill] Autofill failed", error)
        statusLine.textContent = "Autofill failed."
      }
    })

    list.appendChild(item)
  })
}

const hasFillableFields = () => {
  const scopedRoot: ParentNode = activeForm ?? document
  const fields = [...scopedRoot.querySelectorAll("input, textarea, select")]
  return fields.some((field) => isFillableField(field))
}

const syncVisibility = () => {
  root.style.display = hasFillableFields() ? "block" : "none"
}

const loadProfiles = async () => {
  profilesCache = await getProfiles()
  renderProfiles()
}

let saveTimer: number | undefined
const scheduleDynamicSave = () => {
  if (!selectedProfileId) {
    return
  }

  if (saveTimer) {
    window.clearTimeout(saveTimer)
  }

  saveTimer = window.setTimeout(async () => {
    const profile = profilesCache.find((entry) => entry.id === selectedProfileId)
    if (!profile) {
      return
    }

    const updated = collectNewFieldValues(profile)
    profilesCache = profilesCache.map((entry) => (entry.id === selectedProfileId ? updated : entry))

    try {
      await saveProfiles(profilesCache)
    } catch (error) {
      console.error("[Smart Identity Autofill] Could not persist discovered fields", error)
    }
  }, 700)
}

button.addEventListener("click", async () => {
  if (!isOpen) {
    await loadProfiles()
  }
  setPanelOpen(!isOpen)
})

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Node)) {
    return
  }

  if (!container.contains(event.target)) {
    setPanelOpen(false)
  }
})

document.addEventListener("focusin", (event) => {
  const target = event.target
  if (!(target instanceof Element)) {
    return
  }

  const form = target.closest("form")
  activeForm = form instanceof HTMLFormElement ? form : null
  syncVisibility()
})

document.addEventListener("change", scheduleDynamicSave, true)
document.addEventListener("input", scheduleDynamicSave, true)

const observer = new MutationObserver(syncVisibility)
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
})

void loadProfiles().then(syncVisibility)
