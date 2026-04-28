export const STORAGE_KEY = "smartIdentityProfiles"

export const FIELD_MATCHERS: Record<string, RegExp[]> = {
  fullName: [
    /full.?name/i,
    /name/i,
    /first.?name/i,
    /last.?name/i,
    /given.?name/i,
    /family.?name/i
  ],
  email: [/e.?mail/i, /^email$/i],
  phone: [/phone/i, /mobile/i, /tel/i, /contact.?number/i],
  address: [/address/i, /street/i, /city/i, /state/i, /zip/i, /postal/i]
}

export const IGNORED_INPUT_TYPES = new Set([
  "hidden",
  "submit",
  "button",
  "reset",
  "file",
  "image",
  "password",
  "checkbox",
  "radio",
  "range",
  "color"
])
