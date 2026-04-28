# Smart Identity Autofill (Plasmo Chrome Extension)

Smart Identity Autofill is a fast, lightweight Chrome extension built with **Plasmo + React + Tailwind CSS**. It lets users manage multiple identity profiles and autofill form fields with one click.

## Features

- Multiple profiles out of the box: **Personal**, **Work**, **Freelance**
- Profile fields: `name`, `email`, `phone`, `address`, plus unlimited custom fields
- Floating autofill button on pages with forms
- One-click profile selection and smart field mapping
- Dynamic learning of new fields and storage for reuse
- Minimal, Notion-like popup UI
- Uses only Chrome local storage (no backend)

## Folder Structure

```text
smart-identity-autofill/
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
├─ postcss.config.js
├─ README.md
└─ src/
   ├─ content.ts                  # Content script (floating button + autofill flow)
   ├─ popup.tsx                   # Popup UI entry
   ├─ style.css                   # Tailwind styles
   ├─ components/
   │  └─ ProfileCard.tsx          # Profile editor card
   ├─ lib/
   │  ├─ autofill.ts              # Autofill + dynamic field capture
   │  ├─ constants.ts             # Storage key + field matchers
   │  ├─ form-detection.ts        # Input detection and key inference
   │  ├─ profile-utils.ts         # Profile creation/merge helpers
   │  └─ storage.ts               # Chrome storage abstraction
   └─ types/
      └─ profiles.ts              # Shared TypeScript types
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

4. Package extension ZIP (optional):

   ```bash
   npm run package
   ```

## Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select the generated build folder:
   - For dev: `.plasmo/chrome-mv3-dev`
   - For production build: `build/chrome-mv3-prod`

## Usage

1. Click extension icon → manage profiles in popup.
2. Visit any page with forms.
3. Click floating **⚡ Autofill** button.
4. Select a profile to fill detected fields.
5. As you type unknown fields, extension learns and stores them under custom fields for the selected profile.

## Error Handling

- Storage operations are wrapped with try/catch.
- Autofill and dynamic save logic fail gracefully with console diagnostics.
- UI shows actionable fallback text when profiles are unavailable.
