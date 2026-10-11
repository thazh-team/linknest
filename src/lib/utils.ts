
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function normalizeUsername(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9_]/g, '').slice(0,30)
}

export function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url)
    if (!['http:','https:'].includes(u.protocol)) return false
    if (u.protocol === 'javascript:') return false
    return true
  } catch { return false }
}

export const RESERVED_USERNAMES = new Set([
  'admin','root','api','dashboard','auth','login','register','settings','analytics',
  'linknest','www','app','support','help','about','terms','privacy','static','assets',
  'public','private','profile','user','link','links','@','home','explore'
])

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n/1000000).toFixed(1)+'M'
  if (n >= 1000) return (n/1000).toFixed(1)+'K'
  return n.toString()
}
