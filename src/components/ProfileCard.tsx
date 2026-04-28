import type { ChangeEvent } from "react"

import type { IdentityProfile } from "~types/profiles"

type ProfileCardProps = {
  profile: IdentityProfile
  onChange: (profileId: string, field: keyof IdentityProfile, value: string) => void
  onCustomChange: (profileId: string, key: string, value: string) => void
  onAddCustomField: (profileId: string) => void
}

export const ProfileCard = ({
  profile,
  onChange,
  onCustomChange,
  onAddCustomField
}: ProfileCardProps) => {
  const onStandardFieldChange =
    (field: keyof IdentityProfile) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(profile.id, field, event.target.value)
    }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        className="mb-3 w-full rounded-md border border-slate-200 px-3 py-2 text-base font-semibold"
        value={profile.label}
        onChange={onStandardFieldChange("label")}
        placeholder="Profile name"
      />
      <div className="space-y-2">
        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={profile.fullName}
          onChange={onStandardFieldChange("fullName")}
          placeholder="Full name"
        />
        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={profile.email}
          onChange={onStandardFieldChange("email")}
          placeholder="Email"
          type="email"
        />
        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={profile.phone}
          onChange={onStandardFieldChange("phone")}
          placeholder="Phone"
          type="tel"
        />
        <textarea
          className="min-h-[72px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={profile.address}
          onChange={onStandardFieldChange("address")}
          placeholder="Address"
        />
      </div>

      <div className="mt-3 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Custom fields</h4>
        {Object.entries(profile.customFields).map(([key, value]) => (
          <div key={key} className="grid grid-cols-2 gap-2">
            <input
              value={key}
              readOnly
              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500"
            />
            <input
              value={value}
              onChange={(event) => onCustomChange(profile.id, key, event.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onAddCustomField(profile.id)}
          className="rounded-md border border-dashed border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
          + Add custom field
        </button>
      </div>
    </article>
  )
}
