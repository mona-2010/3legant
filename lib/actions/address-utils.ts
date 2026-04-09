import { UserAddress } from "@/types"

type AddressLike = {
  street_address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  country?: string | null
}

const normalizeValue = (value?: string | null) =>
  (value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()

export const getAddressSignature = (address: AddressLike) => {
  return [
    normalizeValue(address.street_address),
    normalizeValue(address.city),
    normalizeValue(address.state),
    normalizeValue(address.zip_code),
    normalizeValue(address.country),
  ].join("|")
}

export const hasDuplicateAddress = (
  candidate: AddressLike,
  existing: UserAddress[],
  excludeId?: string
) => {
  const candidateSignature = getAddressSignature(candidate)
  return existing.some((address) => {
    if (excludeId && address.id === excludeId) return false
    return getAddressSignature(address) === candidateSignature
  })
}

export const readDeletedSignatures = (rawCookieValue?: string) => {
  if (!rawCookieValue) return new Set<string>()

  try {
    const parsed = JSON.parse(rawCookieValue)
    if (!Array.isArray(parsed)) return new Set<string>()
    return new Set(parsed.filter((value): value is string => typeof value === "string"))
  } catch {
    return new Set<string>()
  }
}

export const serializeDeletedSignatures = (values: Set<string>) => {
  return JSON.stringify(Array.from(values).slice(-100))
}
