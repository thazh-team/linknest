
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'
import { normalizeUsername, RESERVED_USERNAMES } from '../lib/utils'

export function AuthPage() {
  const [params] = useSearchParams()
  const modeParam = params.get('mode') === 'signup' ? 'signup' : 'login'
  const [mode, setMode] = useState<'login'|'signup'|'reset'>(modeParam as any)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { add } = useToast()

  useEffect(()=> { setMode(modeParam as any) }, [modeParam])

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        const norm = normalizeUsername(username)
        if (!norm || norm.length < 3) throw new Error('Username must be 3+ chars')
        if (RESERVED_USERNAMES.has(norm)) throw new Error('Reserved username')
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/dashboard' } })
        if (error) throw error
        if (data.user) {
          // create profile
          const { error: pErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            username: norm,
            display_name: norm,
            bio: '',
            visibility: 'public',
            theme_config: {}
          })
          if (pErr) {
            // if profile exists or username taken
            console.warn(pErr)
          }
        }
        add({ title: 'Check your email to verify your account', type: 'success' })
        setMode('login')
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        add({ title: 'Welcome back!', type: 'success' })
        navigate('/dashboard')
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth?mode=login' })
        if (error) throw error
        add({ title: 'Password reset email sent', type: 'success' })
        setMode('login')
      }
    } catch (err: any) {
      add({ title: err.message || 'Something went wrong', type: 'error' })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#fbfaf8] dark:bg-[#0f0f10] px-4">
      <Card className="w-full max-w-[420px]">
        <CardHeader>
          <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg">
            <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 grid place-items-center font-bold">L</div> LinkNest
          </Link>
          <h1 className="mt-6 font-display text-2xl font-semibold">{mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Reset password' : 'Welcome back'}</h1>
          <p className="text-sm text-zinc-500 mt-1">{mode === 'signup' ? 'Free, no ads, no watermark.' : 'Sign in to manage your profile.'}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'signup' && (
              <Input label="Username" placeholder="yourname" value={username} onChange={e=> setUsername(e.target.value)} hint="3-30 chars, lowercase, numbers, underscore. Your profile will be /@username" required />
            )}
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=> setEmail(e.target.value)} required />
            {mode !== 'reset' && (
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e=> setPassword(e.target.value)} required />
            )}
            <Button type="submit" className="w-full" loading={loading}>
              {mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset email' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-6 flex flex-col gap-2 text-sm">
            {mode === 'login' && (
              <>
                <button className="text-zinc-600 dark:text-zinc-400 hover:underline text-left" onClick={()=> setMode('reset')}>Forgot password?</button>
                <div className="text-zinc-500">No account? <button className="text-zinc-900 dark:text-white font-medium hover:underline" onClick={()=> setMode('signup')}>Sign up</button></div>
              </>
            )}
            {mode === 'signup' && <div className="text-zinc-500">Already have account? <button className="text-zinc-900 dark:text-white font-medium hover:underline" onClick={()=> setMode('login')}>Login</button></div>}
            {mode === 'reset' && <button className="text-zinc-900 dark:text-white font-medium hover:underline text-left" onClick={()=> setMode('login')}>Back to login</button>}
          </div>
          <p className="mt-6 text-[11px] text-zinc-500 leading-relaxed">By continuing, you agree to our Terms and acknowledge our Privacy Policy. Data is stored in your Supabase project. Passwords are handled by Supabase Auth.</p>
        </CardContent>
      </Card>
    </div>
  )
}
