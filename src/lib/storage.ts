import { Storage } from "@plasmohq/storage"

import { STORAGE_KEY } from "~lib/constants"
import {
  DEFAULT_WRITING_SETTINGS,
  type WritingSettings
} from "~types/writing"

const storage = new Storage({ area: "local" })

export const getWritingSettings = async (): Promise<WritingSettings> => {
  try {
    const stored = await storage.get<Partial<WritingSettings>>(STORAGE_KEY)

    return {
      ...DEFAULT_WRITING_SETTINGS,
      ...(stored ?? {})
    }
  } catch (error) {
    console.error("[Writing Coach] Failed to load settings", error)
    return DEFAULT_WRITING_SETTINGS
  }
}

export const saveWritingSettings = async (settings: WritingSettings): Promise<void> => {
  try {
    await storage.set(STORAGE_KEY, settings)
  } catch (error) {
    console.error("[Writing Coach] Failed to save settings", error)
    throw new Error("Unable to save writing settings")
  }
}
