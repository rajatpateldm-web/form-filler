export type WritingTone = "clear" | "friendly" | "professional"

export type WritingSettings = {
  tone: WritingTone
  autoScan: boolean
  showFloatingButton: boolean
}

export type GrammarSuggestion = {
  id: string
  title: string
  message: string
  before: string
  after: string
  start: number
  end: number
  category: "grammar" | "clarity" | "style" | "tone"
}

export const DEFAULT_WRITING_SETTINGS: WritingSettings = {
  tone: "clear",
  autoScan: true,
  showFloatingButton: true
}
