
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Profile, ThemeConfig } from '../../lib/supabase'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ProfileCard } from '../../components/profile/ProfileCard'
import { useToast } from '../../components/ui/Toast'
import { THEMES, BUTTON_STYLES } from '../../lib/constants'

export function AppearancePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [theme, setTheme] = useState<ThemeConfig>({})
  const [links, setLinks] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const { add } = useToast()

  useEffect(()=> {
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (p) { setProfile(p as Profile); setTheme((p as Profile).theme_config || {}) }
      const { data: l } = await supabase.from('links').select('*').eq('profile_id', user.id).order('sort_order')
      const { data: g } = await supabase.from('link_groups').select('*').eq('profile_id', user.id).order('sort_order')
      setLinks(l||[]); setGroups(g||[])
    })()
  }, [])

  async function save() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')
      const { error } = await supabase.from('profiles').update({ theme_config: theme }).eq('id', user.id)
      if (error) throw error
      add({ title: 'Appearance saved', type: 'success' })
    } catch (e:any) { add({ title: e.message, type: 'error' }) }
    finally { setSaving(false) }
  }

  if (!profile) return <div className="p-8">Loading...</div>

  return (
    <div className="grid lg:grid-cols-[1fr_0.9fr] gap-8 animate-in">
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold">Appearance</h1>

        <Card>
          <CardHeader><h2 className="font-medium">Themes</h2></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {THEMES.map(t=>(
              <button key={t.id} onClick={()=> setTheme(s=> ({ ...s, background: t.bg as string, textColor: t.text, theme: t.id as any }))}
                className={"rounded-2xl border p-4 text-left transition " + (theme.background===t.bg ? "border-zinc-900 dark:border-white ring-2" : "border-zinc-200 dark:border-zinc-800")}>
                <div className="h-10 w-full rounded-xl mb-2" style={{ background: t.bg as string }} />
                <div className="text-sm font-medium">{t.name}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-medium">Colors</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Background (color or gradient)" value={theme.background||''} onChange={e=> setTheme(s=>({...s, background: e.target.value}))} placeholder="#fdf6ec or linear-gradient(...)" />
            <Input label="Background image URL (optional)" value={theme.backgroundImage||''} onChange={e=> setTheme(s=>({...s, backgroundImage: e.target.value}))} placeholder="https://..." />
            <Input label="Text color" type="color" value={theme.textColor||'#000000'} onChange={e=> setTheme(s=>({...s, textColor: e.target.value}))} />
            <Input label="Button color" type="color" value={theme.buttonColor||'#ffffff'} onChange={e=> setTheme(s=>({...s, buttonColor: e.target.value}))} />
            <Input label="Button text color" type="color" value={theme.buttonTextColor||'#000000'} onChange={e=> setTheme(s=>({...s, buttonTextColor: e.target.value}))} />
            <Input label="Accent" value={theme.accent||''} onChange={e=> setTheme(s=>({...s, accent: e.target.value}))} placeholder="#000" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-medium">Buttons</h2></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {BUTTON_STYLES.map(b=>(
                <button key={b.id} onClick={()=> setTheme(s=>({...s, buttonStyle: b.id as any}))}
                  className={"h-12 rounded-2xl border bg-white dark:bg-zinc-900 text-sm " + (theme.buttonStyle===b.id ? "border-zinc-900 dark:border-white" : "border-zinc-200 dark:border-zinc-800")}>
                  {b.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={save} loading={saving}>Save appearance</Button>
      </div>

      <div className="lg:sticky lg:top-8 h-fit">
        <h2 className="font-medium mb-3">Live preview</h2>
        <div className="rounded-[24px] border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-soft max-h-[800px] overflow-y-auto">
          <ProfileCard profile={{ ...profile, theme_config: theme } as Profile} links={links} groups={groups} isPreview />
        </div>
      </div>
    </div>
  )
}
