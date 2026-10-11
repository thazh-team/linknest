
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { formatNumber } from '../../lib/utils'

export function AnalyticsPage() {
  const [daily, setDaily] = useState<any[]>([])
  const [topLinks, setTopLinks] = useState<any[]>([])
  const [range, setRange] = useState<'7d'|'30d'|'90d'>('30d')
  const [totals, setTotals] = useState({ views:0, clicks:0 })

  useEffect(()=> {
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const days = range==='7d'?7: range==='30d'?30:90
      const since = new Date()
      since.setDate(since.getDate()-days)
      const sinceStr = since.toISOString().slice(0,10)
      const { data: events } = await supabase.from('analytics_events').select('*').eq('profile_id', user.id).gte('date_bucket', sinceStr).order('date_bucket')
      // aggregate by date
      const map: Record<string,{ views:number, clicks:number }> = {}
      events?.forEach(e=>{
        const d = e.date_bucket
        if (!map[d]) map[d] = { views:0, clicks:0 }
        if (e.event_type==='profile_view') map[d].views++
        else map[d].clicks++
      })
      const dailyArr = Object.entries(map).sort((a,b)=> a[0].localeCompare(b[0])).map(([date,v])=> ({ date, ...v }))
      setDaily(dailyArr)
      setTotals({ views: events?.filter(e=> e.event_type==='profile_view').length||0, clicks: events?.filter(e=> e.event_type==='link_click').length||0 })

      const clickMap: Record<string, number> = {}
      events?.forEach(e=> { if (e.event_type==='link_click' && e.link_id) clickMap[e.link_id] = (clickMap[e.link_id]||0)+1 })
      const topIds = Object.entries(clickMap).sort((a,b)=> b[1]-a[1]).slice(0,10).map(([id])=> id)
      if (topIds.length) {
        const { data: l } = await supabase.from('links').select('*').in('id', topIds)
        setTopLinks((l||[]).map((link:any)=> ({ ...link, clicks: clickMap[link.id] })).sort((a:any,b:any)=> b.clicks-a.clicks))
      } else setTopLinks([])
    })()
  }, [range])

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <select value={range} onChange={e=> setRange(e.target.value as any)} className="h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardContent className="p-5"><div className="text-sm text-zinc-500">Profile views</div><div className="text-2xl font-semibold mt-1">{formatNumber(totals.views)}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-zinc-500">Link clicks</div><div className="text-2xl font-semibold mt-1">{formatNumber(totals.clicks)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><h2 className="font-medium">Views by day</h2></CardHeader>
        <CardContent>
          {daily.length===0 ? <p className="text-sm text-zinc-500">No data yet. Share your profile to start collecting privacy-friendly analytics.</p> : (
            <div className="space-y-2">
              {daily.map(d=>(
                <div key={d.date} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-zinc-500">{d.date}</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                    <div className="bg-zinc-900 dark:bg-white h-full" style={{ width: Math.min(100, (d.views / Math.max(1, ...daily.map(x=> x.views)))*100)+'%' }} />
                  </div>
                  <span className="w-20 text-right">{d.views} views, {d.clicks} clicks</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-medium">Most clicked links</h2></CardHeader>
        <CardContent>
          {topLinks.length===0 ? <p className="text-sm text-zinc-500">No clicks yet</p> : (
            <div className="space-y-2">
              {topLinks.map(l=>(
                <div key={l.id} className="flex justify-between text-sm py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <span className="truncate pr-4">{l.title}</span>
                  <span className="text-zinc-500">{l.clicks} clicks</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-[11px] text-zinc-500 leading-relaxed border rounded-xl p-4 bg-zinc-50 dark:bg-zinc-900/50">
        <strong>Privacy notes:</strong> We do not store raw IP addresses or invasive fingerprints. Analytics are aggregated by day. Rate limiting and basic bot filtering applied. Data retention: raw events kept 90 days, daily aggregates kept 1 year. You can request deletion via account settings. Accuracy is best-effort, not guaranteed.
      </div>
    </div>
  )
}
