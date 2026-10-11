
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Eye, MousePointerClick, Link2, ExternalLink } from 'lucide-react'
import { formatNumber } from '../../lib/utils'
import { Link } from 'react-router-dom'

export function OverviewPage() {
  const [stats, setStats] = useState({ views: 0, clicks: 0, links: 0, profile: null as any })
  const [topLinks, setTopLinks] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      const { count: linkCount } = await supabase.from('links').select('*', { count: 'exact', head: true }).eq('profile_id', user.id)
      // analytics: sum
      const { data: events } = await supabase.from('analytics_events').select('event_type, link_id').eq('profile_id', user.id)
      const views = events?.filter(e=> e.event_type==='profile_view').length || 0
      const clicks = events?.filter(e=> e.event_type==='link_click').length || 0
      // top links
      const clickMap: Record<string, number> = {}
      events?.forEach(e=> { if (e.event_type==='link_click' && e.link_id) clickMap[e.link_id] = (clickMap[e.link_id]||0)+1 })
      const topIds = Object.entries(clickMap).sort((a,b)=> b[1]-a[1]).slice(0,5).map(([id])=> id)
      let topLinksData: any[] = []
      if (topIds.length) {
        const { data: l } = await supabase.from('links').select('*').in('id', topIds)
        topLinksData = (l||[]).map((link:any)=> ({ ...link, clicks: clickMap[link.id] }))
      }
      setStats({ views, clicks, links: linkCount||0, profile })
      setTopLinks(topLinksData)
    })()
  }, [])

  const completion = (() => {
    if (!stats.profile) return 0
    let c = 0
    if (stats.profile.display_name) c+=20
    if (stats.profile.bio) c+=20
    if (stats.profile.avatar_url) c+=20
    if (stats.profile.username) c+=20
    if (stats.links>0) c+=20
    return c
  })()

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Overview</h1>
        {stats.profile?.username && <a href={"/@"+stats.profile.username} target="_blank" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"><ExternalLink className="h-4 w-4" /> View profile</a>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-zinc-500">Profile views</span><Eye className="h-4 w-4 text-zinc-400" /></div><div className="mt-2 text-2xl font-semibold">{formatNumber(stats.views)}</div><div className="mt-1 text-xs text-zinc-500">Last 30 days aggregated</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-zinc-500">Link clicks</span><MousePointerClick className="h-4 w-4 text-zinc-400" /></div><div className="mt-2 text-2xl font-semibold">{formatNumber(stats.clicks)}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-zinc-500">Active links</span><Link2 className="h-4 w-4 text-zinc-400" /></div><div className="mt-2 text-2xl font-semibold">{stats.links}</div></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader><h2 className="font-medium">Profile completion</h2></CardHeader>
          <CardContent>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div className="h-full bg-zinc-900 dark:bg-white transition-all" style={{ width: completion+'%' }} />
            </div>
            <p className="mt-2 text-sm text-zinc-500">{completion}% complete</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/dashboard/profile"><Button variant="secondary" size="sm">Edit profile</Button></Link>
              <Link to="/dashboard/links"><Button variant="secondary" size="sm">Manage links</Button></Link>
              <Link to="/dashboard/appearance"><Button variant="secondary" size="sm">Customize appearance</Button></Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-medium">Top links</h2></CardHeader>
          <CardContent>
            {topLinks.length===0 ? <p className="text-sm text-zinc-500">No clicks yet</p> : (
              <div className="space-y-3">
                {topLinks.map(l=>(
                  <div key={l.id} className="flex items-center justify-between text-sm">
                    <span className="truncate pr-2">{l.title}</span>
                    <span className="text-zinc-500">{l.clicks} clicks</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
