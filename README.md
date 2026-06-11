# Writing Coach Grammar Tool

Writing Coach Grammar Tool is a lightweight browser extension built with **Plasmo + React + Tailwind CSS**. It helps users fine-tune writing directly in editable fields across the web by suggesting grammar, clarity, style, and tone improvements.

## Features

- Works in Chrome and Firefox through Plasmo browser targets.
- Floating **✍️ Improve** button appears when the user focuses a text input, textarea, or rich-text editor.
- Local, rule-based suggestions for grammar agreement, article choice, repeated words, spacing, capitalization, wordiness, filler words, and tone.
- One-click application for individual suggestions or all suggestions at once.
- Popup settings for suggestion tone: **Clear**, **Friendly**, or **Professional**.
- Optional auto-scan while typing and optional floating toolbar visibility.
- Uses browser local storage only; no backend or remote writing service is required.

## Folder Structure

```text
writing-coach-grammar-tool/
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
├─ postcss.config.js
├─ README.md
└─ src/
   ├─ content.ts                  # Content script for editable-field detection and suggestions UI
   ├─ popup.tsx                   # Extension popup settings UI
   ├─ style.css                   # Tailwind styles
   ├─ lib/
   │  ├─ constants.ts             # Storage key and editable input types
   │  ├─ grammar.ts               # Local grammar, clarity, style, and tone analyzer
   │  └─ storage.ts               # Browser local storage abstraction
   └─ types/
      └─ writing.ts               # Shared settings and suggestion types
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development mode:

   ```bash
   npm run dev
   ```

3. Build production extension:

   ```bash
   npm run build
   ```

4. Build browser-specific bundles:

   ```bash
   npm run build:chrome
   npm run build:firefox
   ```

5. Package extension ZIP (optional):

   ```bash
   npm run package
   ```

## Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the generated Chrome build folder, such as `build/chrome-mv3-prod`.

## Load Extension in Firefox

1. Build the Firefox target with `npm run build:firefox`.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on**.
4. Select the generated manifest from the Firefox build folder.

## Usage

1. Click the extension icon and choose a preferred writing tone.
2. Visit any page with an editable field.
3. Click into the field and press **✍️ Improve**.
4. Review suggestions and apply a single improvement or **Apply all**.
5. Continue typing; when auto-scan is enabled, suggestions refresh as the text changes.

## Privacy

All suggestions are generated locally by deterministic rules in the content script. The extension stores only user settings in browser local storage.
