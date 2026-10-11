
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Profile, Link, LinkGroup } from '../lib/supabase'
import { ProfileCard } from '../components/profile/ProfileCard'
import { trackProfileView } from '../lib/analytics'

export function PublicProfilePage() {
  const { username } = useParams()
  const clean = (username || '').replace(/^@/, '').toLowerCase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [groups, setGroups] = useState<LinkGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      // Try public view first
      const { data: p } = await supabase.from('public_profiles').select('*').eq('username', clean).maybeSingle()
      if (!p) {
        // fallback direct
        const { data: direct } = await supabase.from('profiles').select('*').ilike('username', clean).maybeSingle()
        if (!direct || direct.visibility === 'disabled') { setNotFound(true); setLoading(false); return }
        if (direct.visibility === 'public' || direct.visibility === 'unlisted') {
          setProfile(direct as Profile)
        } else { setNotFound(true); setLoading(false); return }
      } else {
        setProfile(p as Profile)
      }

      const profileId = (p as any)?.id || null
      // Need id: if from public_profiles we have id, fetch links
      const pid = profileId || (await supabase.from('profiles').select('id').eq('username', clean).maybeSingle()).data?.id
      if (pid) {
        const { data: l } = await supabase.from('public_links').select('*').eq('profile_id', pid).order('sort_order')
        const { data: g } = await supabase.from('link_groups').select('*').eq('profile_id', pid).order('sort_order')
        setLinks((l as Link[]) || [])
        setGroups((g as LinkGroup[]) || [])
        trackProfileView(pid)
        // SEO: set title
        const prof = (p as Profile) || null
        if (prof) {
          document.title = prof.meta_title || `${prof.display_name} — LinkNest`
          const metaDesc = document.querySelector('meta[name="description"]')
          if (metaDesc) metaDesc.setAttribute('content', prof.meta_description || prof.bio || '')
        }
      }
      setLoading(false)
    }
    load()
  }, [clean])

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#fbfaf8] dark:bg-[#0f0f10]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#fbfaf8] dark:bg-[#0f0f10] px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⊘</div>
          <h1 className="font-display text-2xl font-semibold">Profile not found</h1>
          <p className="mt-2 text-zinc-500">@{clean} is unavailable or disabled.</p>
          <a href="/" className="mt-6 inline-flex h-10 px-4 items-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">Go home</a>
        </div>
      </div>
    )
  }

  return <ProfileCard profile={profile} links={links} groups={groups} />
}
