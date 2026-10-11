
import { Link, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../../lib/constants'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { useEffect, useState } from 'react'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()
  useEffect(() => {
    supabase.auth.getUser().then(({data})=> setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session)=> setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/60 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 h-[60px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-[18px]">
          <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 grid place-items-center font-bold">L</div>
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={()=> navigate('/dashboard')}>Dashboard</Button>
              <Button variant="secondary" size="sm" onClick={async()=>{ await supabase.auth.signOut(); navigate('/') }}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={()=> navigate('/auth')}>Login</Button>
              <Button size="sm" onClick={()=> navigate('/auth?mode=signup')}>Get started</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
