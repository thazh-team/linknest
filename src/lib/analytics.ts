
import { supabase } from './supabase'

const RATE_LIMIT_KEY = 'ln_analytics_last'
const RATE_LIMIT_MS = 30_000 // 30 sec per profile view

export async function trackProfileView(profileId: string) {
  try {
    const key = RATE_LIMIT_KEY + ':' + profileId
    const last = localStorage.getItem(key)
    if (last && Date.now() - parseInt(last) < RATE_LIMIT_MS) return
    localStorage.setItem(key, Date.now().toString())

    // Call Worker API if available, else direct insert (RLS allows)
    // Worker endpoint /api/analytics/view for bot filtering & rate limiting server-side
    const appUrl = import.meta.env.VITE_APP_URL
    if (appUrl) {
      fetch(appUrl + '/api/analytics/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, referrer: document.referrer || null })
      }).catch(()=>{})
    } else {
      await supabase.from('analytics_events').insert({
        profile_id: profileId,
        event_type: 'profile_view',
        date_bucket: new Date().toISOString().slice(0,10),
        referrer: document.referrer || null
      })
    }
  } catch {}
}

export async function trackLinkClick(profileId: string, linkId: string) {
  try {
    const appUrl = import.meta.env.VITE_APP_URL
    if (appUrl) {
      fetch(appUrl + '/api/analytics/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, link_id: linkId })
      }).catch(()=>{})
    } else {
      await supabase.from('analytics_events').insert({
        profile_id: profileId,
        link_id: linkId,
        event_type: 'link_click',
        date_bucket: new Date().toISOString().slice(0,10)
      })
    }
  } catch {}
}
