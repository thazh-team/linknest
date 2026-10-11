
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, User, Link2, Palette, BarChart3, Settings, Menu, X, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
  { to: '/dashboard/links', icon: Link2, label: 'Links' },
  { to: '/dashboard/appearance', icon: Palette, label: 'Appearance' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { navigate('/auth'); return }
      const { data: p } = await supabase.from('profiles').select('username').eq('id', data.user.id).maybeSingle()
      setProfile(p)
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#fbfaf8] dark:bg-[#0f0f10] flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2 py-2 mb-4">
          <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 grid place-items-center font-bold">L</div>
          <span className="font-display font-semibold">LinkNest</span>
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition " + (isActive ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800")}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </NavLink>
          ))}
        </nav>
        {profile?.username && (
          <a href={"/@"+profile.username} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            <ExternalLink className="h-4 w-4" /> View profile
          </a>
        )}
      </aside>

      {/* Mobile drawer */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 h-14 flex items-center justify-between px-4">
          <div className="font-display font-semibold">Dashboard</div>
          <Button variant="ghost" size="sm" onClick={()=> setOpen(o=>!o)}>{open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}</Button>
        </div>
        {open && (
          <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 grid grid-cols-2 gap-2">
            {nav.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={()=> setOpen(false)}
                className={({ isActive }) => "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium " + (isActive ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800")}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </NavLink>
            ))}
          </div>
        )}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
