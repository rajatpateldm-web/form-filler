import { EDITABLE_INPUT_TYPES } from "~lib/constants"
import {
  analyzeWriting,
  applyAllSuggestions,
  applySuggestion
} from "~lib/grammar"
import { getWritingSettings } from "~lib/storage"
import type { GrammarSuggestion, WritingSettings } from "~types/writing"

let activeEditable: HTMLElement | null = null
let settings: WritingSettings | null = null
let suggestions: GrammarSuggestion[] = []
let scanTimer: number | undefined
let isOpen = false

const root = document.createElement("div")
root.id = "writing-coach-root"
root.style.all = "initial"
root.style.position = "fixed"
root.style.bottom = "20px"
root.style.right = "20px"
root.style.zIndex = "2147483647"
root.style.fontFamily = "Inter, system-ui, -apple-system, sans-serif"
root.style.display = "none"
document.documentElement.appendChild(root)

const container = document.createElement("div")
container.style.position = "relative"
root.appendChild(container)

const button = document.createElement("button")
button.textContent = "✍️ Improve"
button.type = "button"
button.title = "Improve writing"
button.style.cssText = `
  border: 1px solid #c7d2fe;
  background: #312e81;
  color: #fff;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 14px;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(49,46,129,0.28);
`
container.appendChild(button)

const panel = document.createElement("section")
panel.style.cssText = `
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  width: min(360px, calc(100vw - 32px));
  max-height: min(520px, calc(100vh - 96px));
  overflow: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
  padding: 14px;
  display: none;
  color: #0f172a;
`
container.appendChild(panel)

const header = document.createElement("div")
header.style.cssText = "display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px;"
panel.appendChild(header)

const titleWrap = document.createElement("div")
header.appendChild(titleWrap)

const title = document.createElement("h2")
title.textContent = "Writing Coach"
title.style.cssText = "margin:0;font-size:15px;font-weight:800;color:#0f172a;"
titleWrap.appendChild(title)

const summary = document.createElement("p")
summary.style.cssText = "margin:3px 0 0;font-size:12px;color:#64748b;"
titleWrap.appendChild(summary)

const closeButton = document.createElement("button")
closeButton.type = "button"
closeButton.textContent = "✕"
closeButton.style.cssText = "border:none;background:#f8fafc;color:#475569;border-radius:8px;padding:4px 8px;cursor:pointer;"
header.appendChild(closeButton)

const actions = document.createElement("div")
actions.style.cssText = "display:flex;gap:8px;margin-bottom:10px;"
panel.appendChild(actions)

const rescanButton = document.createElement("button")
rescanButton.type = "button"
rescanButton.textContent = "Rescan"
rescanButton.style.cssText = "border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:10px;padding:7px 10px;font-size:12px;font-weight:700;cursor:pointer;"
actions.appendChild(rescanButton)

const applyAllButton = document.createElement("button")
applyAllButton.type = "button"
applyAllButton.textContent = "Apply all"
applyAllButton.style.cssText = "border:1px solid #312e81;background:#312e81;color:#fff;border-radius:10px;padding:7px 10px;font-size:12px;font-weight:700;cursor:pointer;"
actions.appendChild(applyAllButton)

const list = document.createElement("div")
list.style.cssText = "display:flex;flex-direction:column;gap:8px;"
panel.appendChild(list)

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

const isEditableElement = (target: EventTarget | null): target is HTMLElement => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
    return true
  }

  if (target instanceof HTMLTextAreaElement) {
    return !target.disabled && !target.readOnly
  }

  if (target instanceof HTMLInputElement) {
    return !target.disabled && !target.readOnly && EDITABLE_INPUT_TYPES.has(target.type)
  }

  return false
}

const getEditableText = (element: HTMLElement): string => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value
  }

  return element.innerText ?? element.textContent ?? ""
}

const setEditableText = (element: HTMLElement, value: string) => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const proto = element instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set

    if (setter) {
      setter.call(element, value)
    } else {
      element.value = value
    }
  } else {
    element.textContent = value
  }

  element.dispatchEvent(new Event("input", { bubbles: true }))
  element.dispatchEvent(new Event("change", { bubbles: true }))
}

const setPanelOpen = (next: boolean) => {
  isOpen = next
  panel.style.display = next ? "block" : "none"
}

const renderSuggestions = () => {
  list.innerHTML = ""
  applyAllButton.disabled = suggestions.length === 0
  applyAllButton.style.opacity = suggestions.length === 0 ? "0.5" : "1"
  summary.textContent = suggestions.length
    ? `${suggestions.length} suggestion${suggestions.length > 1 ? "s" : ""} found.`
    : "No issues found. Your writing looks clear."

  if (!activeEditable) {
    summary.textContent = "Select a text field to start."
  }

  if (suggestions.length === 0) {
    const empty = document.createElement("p")
    empty.textContent = activeEditable
      ? "Nothing to fix right now. Try Rescan after adding more text."
      : "Click into a text box, textarea, or rich-text editor."
    empty.style.cssText = "margin:0;padding:12px;border:1px dashed #cbd5e1;border-radius:12px;color:#64748b;font-size:12px;line-height:1.4;"
    list.appendChild(empty)
    return
  }

  suggestions.forEach((suggestion) => {
    const card = document.createElement("article")
    card.style.cssText = "border:1px solid #e2e8f0;border-radius:14px;padding:10px;background:#f8fafc;"

    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
        <strong style="font-size:12px;color:#0f172a;">${escapeHtml(suggestion.title)}</strong>
        <span style="font-size:10px;color:#4338ca;background:#eef2ff;border-radius:999px;padding:2px 7px;text-transform:uppercase;">${escapeHtml(suggestion.category)}</span>
      </div>
      <p style="margin:0 0 8px;font-size:12px;line-height:1.35;color:#475569;">${escapeHtml(suggestion.message)}</p>
      <div style="font-size:12px;line-height:1.45;color:#0f172a;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:8px;">
        <del style="color:#b91c1c;">${escapeHtml(suggestion.before)}</del>
        <span style="color:#64748b;"> → </span>
        <ins style="color:#047857;text-decoration:none;font-weight:700;">${escapeHtml(suggestion.after)}</ins>
      </div>
    `

    const applyButton = document.createElement("button")
    applyButton.type = "button"
    applyButton.textContent = "Apply"
    applyButton.style.cssText = "margin-top:8px;border:1px solid #047857;background:#047857;color:#fff;border-radius:9px;padding:6px 9px;font-size:12px;font-weight:700;cursor:pointer;"
    applyButton.addEventListener("click", () => {
      if (!activeEditable) {
        return
      }

      const next = applySuggestion(getEditableText(activeEditable), suggestion)
      setEditableText(activeEditable, next)
      scanActiveText()
    })

    card.appendChild(applyButton)
    list.appendChild(card)
  })
}

function scanActiveText() {
  if (!activeEditable || !settings) {
    suggestions = []
    renderSuggestions()
    return
  }

  suggestions = analyzeWriting(getEditableText(activeEditable), settings.tone)
  renderSuggestions()
}

const scheduleScan = () => {
  if (!settings?.autoScan) {
    return
  }

  if (scanTimer) {
    window.clearTimeout(scanTimer)
  }

  scanTimer = window.setTimeout(scanActiveText, 450)
}

const syncVisibility = () => {
  root.style.display = settings?.showFloatingButton === false || !activeEditable ? "none" : "block"
}

button.addEventListener("click", () => {
  scanActiveText()
  setPanelOpen(!isOpen)
})

closeButton.addEventListener("click", () => setPanelOpen(false))
rescanButton.addEventListener("click", scanActiveText)
applyAllButton.addEventListener("click", () => {
  if (!activeEditable || suggestions.length === 0) {
    return
  }

  const next = applyAllSuggestions(getEditableText(activeEditable), suggestions)
  setEditableText(activeEditable, next)
  scanActiveText()
})

document.addEventListener("focusin", (event) => {
  activeEditable = isEditableElement(event.target)
    ? event.target.closest<HTMLElement>('[contenteditable="true"]') ?? event.target
    : null
  syncVisibility()
  scheduleScan()
})

document.addEventListener("input", (event) => {
  if (event.target === activeEditable || (event.target instanceof Node && activeEditable?.contains(event.target))) {
    scheduleScan()
  }
}, true)

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Node)) {
    return
  }

  if (!container.contains(event.target) && event.target !== activeEditable) {
    setPanelOpen(false)
  }
})

void getWritingSettings().then((loaded) => {
  settings = loaded
  syncVisibility()
})
