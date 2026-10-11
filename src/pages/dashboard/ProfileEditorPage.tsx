
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input, Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { normalizeUsername, RESERVED_USERNAMES } from '../../lib/utils'
import { ProfileCard } from '../../components/profile/ProfileCard'
import type { Profile } from '../../lib/supabase'

export function ProfileEditorPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const { add } = useToast()

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if (data) { setProfile(data as Profile); setForm(data) }
    setLoading(false)
  }

  async function uploadImage(file: File, bucket: 'avatars'|'covers', userId: string) {
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type })
    if (error) throw error
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const normUsername = normalizeUsername(form.username || '')
      if (!normUsername || normUsername.length < 3) throw new Error('Username invalid')
      if (RESERVED_USERNAMES.has(normUsername)) throw new Error('Reserved username')
      let avatarUrl = form.avatar_url
      let coverUrl = form.cover_url
      if (avatarFile) {
        if (avatarFile.size > 2_000_000) throw new Error('Avatar max 2MB')
        if (!avatarFile.type.startsWith('image/')) throw new Error('Avatar must be image')
        avatarUrl = await uploadImage(avatarFile, 'avatars', user.id)
      }
      if (coverFile) {
        if (coverFile.size > 4_000_000) throw new Error('Cover max 4MB')
        coverUrl = await uploadImage(coverFile, 'covers', user.id)
      }
      const payload = {
        username: normUsername,
        display_name: form.display_name?.trim() || normUsername,
        bio: form.bio || '',
        location: form.location || null,
        contact_email: form.contact_email || null,
        contact_email_public: !!form.contact_email_public,
        visibility: form.visibility || 'public',
        status_text: form.status_text || null,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        avatar_url: avatarUrl || null,
        cover_url: coverUrl || null,
        theme_config: form.theme_config || {}
      }
      const { error } = await supabase.from('profiles').update(payload).eq('id', user.id)
      if (error) throw error
      add({ title: 'Profile saved', type: 'success' })
      load()
    } catch (err: any) {
      add({ title: err.message, type: 'error' })
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!profile) return <div className="p-8">No profile found</div>

  return (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 animate-in">
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold">Profile editor</h1>
        <Card>
          <CardHeader><h2 className="font-medium">Basic info</h2></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Username" value={form.username || ''} onChange={e=> setForm((s:any)=>({...s, username: e.target.value}))} hint="Your public URL: /@username" />
              <Input label="Display name" value={form.display_name || ''} onChange={e=> setForm((s:any)=>({...s, display_name: e.target.value}))} required />
              <Textarea label="Bio" value={form.bio || ''} onChange={e=> setForm((s:any)=>({...s, bio: e.target.value}))} placeholder="Tell people about you..." rows={3} />
              <Input label="Status (optional)" value={form.status_text || ''} onChange={e=> setForm((s:any)=>({...s, status_text: e.target.value}))} placeholder="e.g. Open to work, Building..." />
              <Input label="Location (optional)" value={form.location || ''} onChange={e=> setForm((s:any)=>({...s, location: e.target.value}))} placeholder="Yen Bai, Vietnam" />
              <Input label="Contact email (optional)" type="email" value={form.contact_email || ''} onChange={e=> setForm((s:any)=>({...s, contact_email: e.target.value}))} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.contact_email_public} onChange={e=> setForm((s:any)=>({...s, contact_email_public: e.target.checked}))} /> Show contact email publicly</label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Avatar (max 2MB)</label>
                  <input type="file" accept="image/*" onChange={e=> setAvatarFile(e.target.files?.[0]||null)} className="text-sm" />
                  {form.avatar_url && <img src={form.avatar_url} alt="avatar" className="mt-2 h-16 w-16 rounded-full object-cover" />}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Cover (max 4MB)</label>
                  <input type="file" accept="image/*" onChange={e=> setCoverFile(e.target.files?.[0]||null)} className="text-sm" />
                  {form.cover_url && <img src={form.cover_url} alt="cover" className="mt-2 h-16 w-full rounded object-cover" />}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Visibility</label>
                <select value={form.visibility || 'public'} onChange={e=> setForm((s:any)=>({...s, visibility: e.target.value}))} className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3">
                  <option value="public">Public - anyone can view</option>
                  <option value="unlisted">Unlisted - only with direct link</option>
                  <option value="disabled">Disabled - not accessible</option>
                </select>
              </div>

              <Input label="SEO Title (optional)" value={form.meta_title || ''} onChange={e=> setForm((s:any)=>({...s, meta_title: e.target.value}))} hint="Max 60 chars" />
              <Textarea label="SEO Description (optional)" value={form.meta_description || ''} onChange={e=> setForm((s:any)=>({...s, meta_description: e.target.value}))} hint="Max 160 chars" rows={2} />

              <Button type="submit" loading={saving}>Save changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky lg:top-8 h-fit">
        <h2 className="font-medium mb-3">Live preview</h2>
        <div className="rounded-[24px] border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-soft max-h-[800px] overflow-y-auto">
          <ProfileCard profile={{ ...profile, ...form, avatar_url: avatarFile ? URL.createObjectURL(avatarFile) : form.avatar_url, cover_url: coverFile ? URL.createObjectURL(coverFile) : form.cover_url } as Profile} links={[]} groups={[]} isPreview />
        </div>
        <p className="mt-2 text-xs text-zinc-500">Preview does not track analytics</p>
      </div>
    </div>
  )
}
