
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Link as LinkType, LinkGroup } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { isSafeUrl } from '../../lib/utils'
import { GripVertical, Trash2, Eye, EyeOff, Plus, Edit3 } from 'lucide-react'

export function LinksPage() {
  const [links, setLinks] = useState<LinkType[]>([])
  const [groups, setGroups] = useState<LinkGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLink, setEditingLink] = useState<Partial<LinkType> & { isNew?: boolean } | null>(null)
  const [editingGroup, setEditingGroup] = useState<Partial<LinkGroup> & { isNew?: boolean } | null>(null)
  const { add } = useToast()

  async function fetchAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: l } = await supabase.from('links').select('*').eq('profile_id', user.id).order('sort_order')
    const { data: g } = await supabase.from('link_groups').select('*').eq('profile_id', user.id).order('sort_order')
    setLinks((l as LinkType[])||[])
    setGroups((g as LinkGroup[])||[])
    setLoading(false)
  }
  useEffect(()=>{ fetchAll() }, [])

  async function saveLink() {
    if (!editingLink) return
    if (!editingLink.title?.trim()) { add({ title: 'Title required', type: 'error' }); return }
    if (!editingLink.url || !isSafeUrl(editingLink.url)) { add({ title: 'Valid https URL required', type: 'error' }); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    try {
      if (editingLink.isNew) {
        const { error } = await supabase.from('links').insert({
          profile_id: user.id,
          title: editingLink.title!.trim(),
          url: editingLink.url!.trim(),
          description: editingLink.description || null,
          icon: editingLink.icon || null,
          sort_order: links.length,
          is_active: editingLink.is_active ?? true,
          is_public: editingLink.is_public ?? true,
          group_id: editingLink.group_id || null
        })
        if (error) throw error
      } else {
        const { error } = await supabase.from('links').update({
          title: editingLink.title!.trim(),
          url: editingLink.url!.trim(),
          description: editingLink.description || null,
          icon: editingLink.icon || null,
          is_active: editingLink.is_active,
          is_public: editingLink.is_public,
          group_id: editingLink.group_id || null
        }).eq('id', editingLink.id)
        if (error) throw error
      }
      setEditingLink(null)
      fetchAll()
      add({ title: 'Link saved', type: 'success' })
    } catch (e:any) { add({ title: e.message, type: 'error' }) }
  }

  async function deleteLink(id: string) {
    if (!confirm('Delete this link?')) return
    const { error } = await supabase.from('links').delete().eq('id', id)
    if (error) { add({ title: error.message, type: 'error' }); return }
    fetchAll()
  }

  async function toggleActive(link: LinkType) {
    await supabase.from('links').update({ is_active: !link.is_active }).eq('id', link.id)
    fetchAll()
  }

  async function moveLink(id: string, dir: -1|1) {
    const idx = links.findIndex(l=> l.id===id)
    if (idx<0) return
    const newIdx = idx+dir
    if (newIdx<0 || newIdx>=links.length) return
    const newLinks = [...links]
    const [moved] = newLinks.splice(idx,1)
    newLinks.splice(newIdx,0,moved)
    // update sort_order
    setLinks(newLinks)
    for (let i=0;i<newLinks.length;i++) {
      await supabase.from('links').update({ sort_order: i }).eq('id', newLinks[i].id)
    }
  }

  async function saveGroup() {
    if (!editingGroup) return
    if (!editingGroup.title?.trim()) { add({ title: 'Group title required', type: 'error' }); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (editingGroup.isNew) {
      const { error } = await supabase.from('link_groups').insert({ profile_id: user.id, title: editingGroup.title!.trim(), sort_order: groups.length })
      if (error) { add({ title: error.message, type: 'error' }); return }
    } else {
      const { error } = await supabase.from('link_groups').update({ title: editingGroup.title!.trim() }).eq('id', editingGroup.id)
      if (error) { add({ title: error.message, type: 'error' }); return }
    }
    setEditingGroup(null)
    fetchAll()
  }

  async function deleteGroup(id: string) {
    if (!confirm('Delete group? Links inside will become ungrouped.')) return
    await supabase.from('link_groups').delete().eq('id', id)
    fetchAll()
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="space-y-6 animate-in max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Links</h1>
        <Button size="sm" onClick={()=> setEditingLink({ title:'', url:'https://', description:'', is_active:true, is_public:true, isNew:true })}><Plus className="h-4 w-4 mr-1" /> Add link</Button>
      </div>

      {/* Groups */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-sm">Groups (optional)</h2>
            <Button variant="ghost" size="sm" onClick={()=> setEditingGroup({ title:'', isNew:true })}>+ New group</Button>
          </div>
          {groups.length===0 ? <p className="text-xs text-zinc-500">No groups. Links will show in one list.</p> : (
            <div className="flex flex-wrap gap-2">
              {groups.map(g=>(
                <div key={g.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm">
                  {g.title}
                  <button onClick={()=> setEditingGroup(g)} className="opacity-60 hover:opacity-100"><Edit3 className="h-3 w-3" /></button>
                  <button onClick={()=> deleteGroup(g.id)} className="opacity-60 hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
          {editingGroup && (
            <div className="mt-4 flex gap-2">
              <Input value={editingGroup.title||''} onChange={e=> setEditingGroup(s=>({...s!, title: e.target.value}))} placeholder="Group title" />
              <Button size="sm" onClick={saveGroup}>Save</Button>
              <Button variant="ghost" size="sm" onClick={()=> setEditingGroup(null)}>Cancel</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Links list */}
      <div className="space-y-3">
        {links.length===0 && <Card><CardContent className="p-8 text-center text-sm text-zinc-500">No links yet. Add your first link!</CardContent></Card>}
        {links.map((link, idx)=>(
          <Card key={link.id} className={"group " + (!link.is_active ? "opacity-60" : "")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <button onClick={()=> moveLink(link.id,-1)} disabled={idx===0} className="text-zinc-400 hover:text-zinc-900 disabled:opacity-30">▲</button>
                <GripVertical className="h-4 w-4 text-zinc-300" />
                <button onClick={()=> moveLink(link.id,1)} disabled={idx===links.length-1} className="text-zinc-400 hover:text-zinc-900 disabled:opacity-30">▼</button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{link.title}</div>
                <div className="text-xs text-zinc-500 truncate">{link.url}</div>
                {link.description && <div className="text-xs text-zinc-500 truncate">{link.description}</div>}
                {link.group_id && <div className="text-[11px] mt-1 inline-block px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">{groups.find(g=> g.id===link.group_id)?.title}</div>}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={()=> toggleActive(link)}>{link.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
                <Button variant="ghost" size="sm" onClick={()=> setEditingLink(link)}><Edit3 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={()=> deleteLink(link.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit modal inline */}
      {editingLink && (
        <Card className="border-zinc-900 dark:border-white">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-medium">{editingLink.isNew ? 'New link' : 'Edit link'}</h3>
            <Input label="Title" value={editingLink.title||''} onChange={e=> setEditingLink(s=>({...s!, title: e.target.value}))} placeholder="My awesome project" />
            <Input label="URL" value={editingLink.url||''} onChange={e=> setEditingLink(s=>({...s!, url: e.target.value}))} placeholder="https://..." />
            <Textarea label="Description (optional)" value={editingLink.description||''} onChange={e=> setEditingLink(s=>({...s!, description: e.target.value}))} placeholder="Short description" />
            <Input label="Icon (optional emoji or name)" value={editingLink.icon||''} onChange={e=> setEditingLink(s=>({...s!, icon: e.target.value}))} placeholder="🚀" />
            <div>
              <label className="text-sm font-medium">Group (optional)</label>
              <select value={editingLink.group_id||''} onChange={e=> setEditingLink(s=>({...s!, group_id: e.target.value || null}))} className="mt-1 w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3">
                <option value="">No group</option>
                {groups.map(g=> <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editingLink.is_active} onChange={e=> setEditingLink(s=>({...s!, is_active: e.target.checked}))} /> Active</label>
            <div className="flex gap-2">
              <Button onClick={saveLink}>Save link</Button>
              <Button variant="ghost" onClick={()=> setEditingLink(null)}>Cancel</Button>
            </div>
            <p className="text-[11px] text-zinc-500">Only http/https URLs are allowed. javascript: and data: schemes are rejected.</p>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-zinc-500">Tip: Use keyboard Tab to navigate. Drag-and-drop via buttons, or touch-friendly reorder. Provide accessible alternative.</div>
    </div>
  )
}
