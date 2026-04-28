import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const base64Path = resolve(__dirname, "../assets/icon-source.base64")
const outputPath = resolve(__dirname, "../assets/icon.png")

const base64Data = readFileSync(base64Path, "utf8").replace(/\s+/g, "")
const buffer = Buffer.from(base64Data, "base64")

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, buffer)

console.log(`[icon] Generated ${outputPath}`)
