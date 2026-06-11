# Writing Coach Grammar Tool

Writing Coach Grammar Tool is a lightweight browser extension built with **Plasmo + React + Tailwind CSS**. It helps users fine-tune writing directly in editable fields across the web by suggesting grammar, clarity, style, and tone improvements.

The extension is built with **Plasmo**, **React**, **TypeScript**, and **Tailwind CSS**, and can be built for both **Chrome** and **Firefox**.

- Works in Chrome and Firefox through Plasmo browser targets.
- Floating **✍️ Improve** button appears when the user focuses a text input, textarea, or rich-text editor.
- Local, rule-based suggestions for grammar agreement, article choice, repeated words, spacing, capitalization, wordiness, filler words, and tone.
- One-click application for individual suggestions or all suggestions at once.
- Popup settings for suggestion tone: **Clear**, **Friendly**, or **Professional**.
- Optional auto-scan while typing and optional floating toolbar visibility.
- Uses browser local storage only; no backend or remote writing service is required.

- Finds common grammar issues such as subject/verb agreement, article usage, repeated words, capitalization, and punctuation spacing.
- Suggests shorter alternatives for wordy phrases like “in order to” or “due to the fact that.”
- Helps remove filler words that weaken sentences.
- Offers tone-specific suggestions for **Clear**, **Friendly**, and **Professional** writing.
- Shows a floating **✍️ Improve** button only when your cursor is in an editable writing field.
- Runs locally in the browser and stores only extension settings in local browser storage.

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

Plasmo will generate a development extension bundle under `.plasmo/`. Keep this command running while you make changes.

## Build the Extension

Build a production bundle:

```bash
npm run build
```

Build browser-specific bundles:

```bash
npm run build:chrome
npm run build:firefox
```

Package the extension into a distributable archive:

```bash
npm run package
```

## Install in Chrome or Chromium Browsers

1. Build the Chrome extension:

   ```bash
   npm run build:chrome
   ```

2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the generated Chrome build folder, typically:

   ```text
   build/chrome-mv3-prod
   ```

6. Pin the extension from the browser toolbar if you want quick access to settings.

## Install in Firefox

1. Build the Firefox extension:

   ```bash
   npm run build:firefox
   ```

4. Build browser-specific bundles:

   ```bash
   npm run build:chrome
   npm run build:firefox
   ```

5. Package extension ZIP (optional):

   ```text
   build/firefox-mv2-prod
   ```

5. Firefox will load the extension temporarily. For regular use, package and sign the extension through Mozilla Add-ons.

## How to Use the Writing Coach

1. Open a website with a text field, textarea, or rich-text editor.
2. Click into the field where you are writing.
3. Click the floating **✍️ Improve** button in the lower-right corner.
4. Review the suggestions in the Writing Coach panel.
5. Choose one of the following actions:
   - Click **Apply** on a single suggestion to update only that issue.
   - Click **Apply all** to accept every current suggestion.
   - Click **Rescan** after editing text manually.
6. Continue writing. If auto-scan is enabled, suggestions refresh shortly after you type.

## Configure Settings

Click the extension icon in your browser toolbar to open settings.

### Suggestion Tone

Choose the writing tone that best matches your use case:

- **Clear**: focuses on grammar, clarity, and concise wording.
- **Friendly**: suggests softer phrasing for collaborative writing.
- **Professional**: polishes casual wording for workplace communication.

### Browser Behavior

You can also control:

- **Auto-scan while typing**: refreshes suggestions shortly after you edit text.
- **Show floating toolbar**: shows or hides the **✍️ Improve** button when writing fields are focused.

If settings do not apply to an already-open page immediately, refresh that page.

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the generated Chrome build folder, such as `build/chrome-mv3-prod`.

## Load Extension in Firefox

1. Build the Firefox target with `npm run build:firefox`.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on**.
4. Select the generated manifest from the Firefox build folder.

Writing suggestions are generated by local rules inside the browser content script. The extension does not send your writing to a remote server. It stores only your settings, such as selected tone and toolbar behavior, in browser local storage.

1. Click the extension icon and choose a preferred writing tone.
2. Visit any page with an editable field.
3. Click into the field and press **✍️ Improve**.
4. Review suggestions and apply a single improvement or **Apply all**.
5. Continue typing; when auto-scan is enabled, suggestions refresh as the text changes.

## Privacy

All suggestions are generated locally by deterministic rules in the content script. The extension stores only user settings in browser local storage.
