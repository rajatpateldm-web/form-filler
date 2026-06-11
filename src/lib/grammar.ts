import type { GrammarSuggestion, WritingTone } from "~types/writing"

type Rule = {
  title: string
  message: string
  category: GrammarSuggestion["category"]
  pattern: RegExp
  replace: string | ((match: string, ...groups: string[]) => string)
}

const BASE_RULES: Rule[] = [
  {
    title: "Use standard agreement",
    message: "Use “is” with a singular subject.",
    category: "grammar",
    pattern: /\b([Tt]his|[Tt]hat|[Ii]t|[Hh]e|[Ss]he)\s+are\b/g,
    replace: (_match, subject: string) => `${subject} is`
  },
  {
    title: "Use standard agreement",
    message: "Use “are” with a plural subject.",
    category: "grammar",
    pattern: /\b([Tt]hey|[Ww]e|[Yy]ou)\s+is\b/g,
    replace: (_match, subject: string) => `${subject} are`
  },
  {
    title: "Fix article choice",
    message: "Use “an” before a vowel sound.",
    category: "grammar",
    pattern: /\b([Aa])\s+([aeiouAEIOU][\w-]*)\b/g,
    replace: (_match, article: string, word: string) => `${article === "A" ? "An" : "an"} ${word}`
  },
  {
    title: "Fix article choice",
    message: "Use “a” before most consonant sounds.",
    category: "grammar",
    pattern: /\b([Aa]n)\s+([bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ][\w-]*)\b/g,
    replace: (_match, article: string, word: string) => `${article[0] === "A" ? "A" : "a"} ${word}`
  },
  {
    title: "Avoid double negatives",
    message: "A single negative is clearer and grammatically standard.",
    category: "grammar",
    pattern: /\b(can|could|did|do|does|is|are|was|were|have|has|had)n't\s+no\b/gi,
    replace: (match: string) => match.replace(/\s+no\b/i, " any")
  },
  {
    title: "Remove repeated word",
    message: "Repeated words are usually accidental.",
    category: "grammar",
    pattern: /\b([A-Za-z]+)\s+\1\b/gi,
    replace: (_match, word: string) => word
  },
  {
    title: "Tighten wording",
    message: "This phrase is wordy; use the shorter alternative.",
    category: "clarity",
    pattern: /\bin order to\b/gi,
    replace: "to"
  },
  {
    title: "Tighten wording",
    message: "This phrase can usually be shortened.",
    category: "clarity",
    pattern: /\bdue to the fact that\b/gi,
    replace: "because"
  },
  {
    title: "Tighten wording",
    message: "Use a direct phrase for stronger writing.",
    category: "clarity",
    pattern: /\bat this point in time\b/gi,
    replace: "now"
  },
  {
    title: "Tighten wording",
    message: "Use a direct phrase for stronger writing.",
    category: "clarity",
    pattern: /\bin the event that\b/gi,
    replace: "if"
  },
  {
    title: "Use stronger wording",
    message: "Remove filler words when they do not add meaning.",
    category: "style",
    pattern: /\b(really|very|basically|actually|just)\s+/gi,
    replace: ""
  },
  {
    title: "Prefer active phrasing",
    message: "Active voice is often clearer and more concise.",
    category: "style",
    pattern: /\b(is|are|was|were|be|been|being)\s+able to\b/gi,
    replace: "can"
  },
  {
    title: "Fix spacing",
    message: "Use one space after punctuation.",
    category: "grammar",
    pattern: /([.!?]) {2,}/g,
    replace: "$1 "
  },
  {
    title: "Remove space before punctuation",
    message: "Punctuation should follow the previous word directly.",
    category: "grammar",
    pattern: /\s+([,.;:!?])/g,
    replace: "$1"
  }
]

const TONE_RULES: Record<WritingTone, Rule[]> = {
  clear: [],
  friendly: [
    {
      title: "Soften the tone",
      message: "A friendlier phrase can make the request feel more collaborative.",
      category: "tone",
      pattern: /\bYou must\b/g,
      replace: "Could you please"
    }
  ],
  professional: [
    {
      title: "Use professional wording",
      message: "This wording sounds more polished in professional writing.",
      category: "tone",
      pattern: /\bASAP\b/g,
      replace: "as soon as possible"
    },
    {
      title: "Use professional wording",
      message: "Use a more formal alternative.",
      category: "tone",
      pattern: /\bkinda\b/gi,
      replace: "somewhat"
    }
  ]
}

const capitalizeSentenceStarts = (text: string): GrammarSuggestion[] => {
  const suggestions: GrammarSuggestion[] = []
  const pattern = /(^|[.!?]\s+)([a-z])/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    const prefix = match[1]
    const letter = match[2]
    const start = match.index + prefix.length
    const before = text.slice(start, start + 1)
    const after = letter.toUpperCase()

    suggestions.push({
      id: `capitalization-${start}-${after}`,
      title: "Capitalize sentence start",
      message: "Sentences should start with a capital letter.",
      before,
      after,
      start,
      end: start + 1,
      category: "grammar"
    })
  }

  return suggestions
}

const runRule = (text: string, rule: Rule): GrammarSuggestion[] => {
  const suggestions: GrammarSuggestion[] = []
  let match: RegExpExecArray | null

  while ((match = rule.pattern.exec(text)) !== null) {
    const before = match[0]
    const flags = rule.pattern.flags.replace("g", "")
    const scopedPattern = new RegExp(rule.pattern.source, flags)
    const after = before.replace(scopedPattern, rule.replace as string)

    if (before === after) {
      continue
    }

    suggestions.push({
      id: `${rule.title}-${match.index}-${after}`,
      title: rule.title,
      message: rule.message,
      before,
      after,
      start: match.index,
      end: match.index + before.length,
      category: rule.category
    })
  }

  return suggestions
}

export const analyzeWriting = (text: string, tone: WritingTone = "clear"): GrammarSuggestion[] => {
  const rules = [...BASE_RULES, ...TONE_RULES[tone]]
  const suggestions = rules.flatMap((rule) => runRule(text, rule))

  return [...suggestions, ...capitalizeSentenceStarts(text)]
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .filter((suggestion, index, all) =>
      all.findIndex((candidate) => candidate.start === suggestion.start && candidate.end === suggestion.end) === index
    )
}

export const applySuggestion = (text: string, suggestion: GrammarSuggestion): string =>
  `${text.slice(0, suggestion.start)}${suggestion.after}${text.slice(suggestion.end)}`

export const applyAllSuggestions = (text: string, suggestions: GrammarSuggestion[]): string =>
  [...suggestions]
    .sort((a, b) => b.start - a.start)
    .reduce((current, suggestion) => applySuggestion(current, suggestion), text)
