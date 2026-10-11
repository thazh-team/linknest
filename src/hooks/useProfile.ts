
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, Link, LinkGroup } from '../lib/supabase'

export function useMyProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [groups, setGroups] = useState<LinkGroup[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchAll() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if (p) {
      setProfile(p as Profile)
      const { data: l } = await supabase.from('links').select('*').eq('profile_id', user.id).order('sort_order')
      const { data: g } = await supabase.from('link_groups').select('*').eq('profile_id', user.id).order('sort_order')
      setLinks((l as Link[]) || [])
      setGroups((g as LinkGroup[]) || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  return { profile, links, groups, loading, refresh: fetchAll }
}
