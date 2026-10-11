
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { QRShare } from '../../components/profile/QRShare'

export function SettingsPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const { add } = useToast()

  useEffect(()=> {
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email||'')
      const { data: p } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()
      if (p) setUsername(p.username)
    })()
  }, [])

  async function updateEmail() {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ email })
      if (error) throw error
      add({ title: 'Check your new email to confirm', type: 'success' })
    } catch (e:any) { add({ title: e.message, type: 'error' }) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (deleteConfirm !== username) { add({ title: 'Type your username to confirm', type: 'error' }); return }
    if (!confirm('This will permanently delete your account and profile. Are you sure?')) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // delete profile will cascade links via DB, but we also delete user via service? For now delete profile and sign out
      await supabase.from('profiles').delete().eq('id', user.id)
      // supabase auth admin delete requires service role - we call worker endpoint
      const appUrl = import.meta.env.VITE_APP_URL
      if (appUrl) {
        await fetch(appUrl+'/api/account/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      }
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (e:any) { add({ title: e.message, type: 'error' }) }
  }

  const profileUrl = username ? window.location.origin + '/@' + username : ''

  return (
    <div className="space-y-6 max-w-3xl animate-in">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader><h2 className="font-medium">Sharing</h2></CardHeader>
        <CardContent className="space-y-4">
          {profileUrl ? <QRShare url={profileUrl} /> : <p className="text-sm text-zinc-500">No username</p>}
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={()=> navigator.clipboard.writeText(profileUrl)}>Copy profile URL</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-medium">Email & Auth</h2></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Email" value={email} onChange={e=> setEmail(e.target.value)} />
          <Button size="sm" onClick={updateEmail} loading={saving}>Update email</Button>
          <div className="pt-4">
            <Button variant="secondary" size="sm" onClick={async()=>{
              if (!email) return
              const { error } = await supabase.auth.resetPasswordForEmail(email)
              if (error) add({ title: error.message, type: 'error' })
              else add({ title: 'Password reset email sent', type: 'success' })
            }}>Send password reset</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-medium">Privacy</h2></CardHeader>
        <CardContent className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2">
          <p>• Profile views and link clicks are tracked without storing raw IP.</p>
          <p>• No third-party ads or trackers on public pages.</p>
          <p>• You can set visibility to public, unlisted, or disabled.</p>
          <p>• Contact email only shown if you enable public toggle.</p>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader><h2 className="font-medium text-red-600">Danger zone</h2></CardHeader>
        <CardContent className="space-y-4">
          {!showDelete ? <Button variant="danger" size="sm" onClick={()=> setShowDelete(true)}>Delete account</Button> : (
            <div className="space-y-3">
              <p className="text-sm">Type your username <strong>{username}</strong> to confirm deletion. This action is permanent and will delete your profile, links, and analytics.</p>
              <Input value={deleteConfirm} onChange={e=> setDeleteConfirm(e.target.value)} placeholder={username} />
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={handleDelete}>Permanently delete</Button>
                <Button variant="ghost" size="sm" onClick={()=> setShowDelete(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
