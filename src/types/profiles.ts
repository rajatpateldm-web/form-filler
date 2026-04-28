export type BaseIdentityField =
  | "fullName"
  | "email"
  | "phone"
  | "address"

export type IdentityProfile = {
  id: string
  label: string
  fullName: string
  email: string
  phone: string
  address: string
  customFields: Record<string, string>
  updatedAt: number
}

export type FieldValueMap = Partial<Record<BaseIdentityField | string, string>>

export const DEFAULT_PROFILE_NAMES = ["Personal", "Work", "Freelance"]
