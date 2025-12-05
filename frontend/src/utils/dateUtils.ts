// frontend/src/utils/dateUtils.ts

// Format Date -> 'YYYY-MM-DD' in *local* time (no timezone surprises)
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Parse 'YYYY-MM-DD' into a *local* Date object
export const parseLocalDate = (value: string): Date => {
  const [yearStr, monthStr, dayStr] = value.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (!year || !month || !day) {
    // Fallback: let JS try to parse weird values
    return new Date(value)
  }
  // IMPORTANT: this constructs a local date (no timezone shifts)
  return new Date(year, month - 1, day)
}

/**
 * Convert a Date to an ISO string that preserves the *local*
 * date & time the user picked (no UTC shift).
 *
 * Example: if user picks 2025-03-10 09:00 in their timezone,
 * this will produce "2025-03-10T09:00:00" regardless of offset.
 */
export const toLocalISOString = (date: Date): string => {
  const tzOffsetMinutes = date.getTimezoneOffset()
  const local = new Date(date.getTime() - tzOffsetMinutes * 60_000)
  // Drop milliseconds + trailing 'Z' to match LocalDateTime expectation
  return local.toISOString().replace(/\.\d{3}Z$/, '')
}
