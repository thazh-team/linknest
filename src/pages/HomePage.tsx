
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Navbar } from '../components/layout/Navbar'
import { Link2, Palette, BarChart3, Shield, Zap, Smartphone } from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#fbfaf8] dark:bg-[#0f0f10]">
      <Navbar />
      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-28">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 mb-6">Free • No ads • No watermark</div>
              <h1 className="font-display text-[40px] md:text-[56px] font-semibold leading-[0.95] tracking-tight">
                Your links,<br/> beautifully<br/> nested.
              </h1>
              <p className="mt-6 text-[18px] leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-[480px]">
                Create a stunning personal profile page that brings all your links, socials, and portfolio together. Mobile-first, privacy-focused, deployed on Cloudflare.
              </p>
              <div className="mt-8 flex gap-3">
                <Button size="lg" onClick={()=> navigate('/auth?mode=signup')}>Create your LinkNest</Button>
                <Button variant="secondary" size="lg" onClick={()=> navigate('/@demo')}>View demo</Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-zinc-500">
                <span className="inline-flex items-center gap-1.5"><Shield className="h-4 w-4" /> Privacy-first</span>
                <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4" /> Fast</span>
                <span className="inline-flex items-center gap-1.5"><Smartphone className="h-4 w-4" /> Android-ready</span>
              </div>
            </div>
            <div className="relative">
              <div className="mx-auto w-[340px] md:w-[380px] rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-soft-lg overflow-hidden p-4">
                <div className="rounded-[20px] bg-[#fbfaf8] dark:bg-zinc-950 p-6 flex flex-col items-center">
                  <div className="h-20 w-20 rounded-full bg-zinc-900 dark:bg-white grid place-items-center text-white dark:text-zinc-900 text-2xl font-bold">A</div>
                  <div className="mt-4 font-display font-semibold text-lg">Alex Rivera</div>
                  <div className="text-sm opacity-60">@alex</div>
                  <p className="mt-2 text-sm text-center opacity-80">Designer • Writer • Building soft internet</p>
                  <div className="mt-6 w-full space-y-3">
                    {['My portfolio','Latest essay','Follow on X','Book a call'].map(t=> (
                      <div key={t} className="w-full h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid place-items-center text-sm font-medium shadow-soft">{t}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 top-10 right-10 h-72 w-72 rounded-full bg-gradient-to-br from-violet-300 to-indigo-300 blur-[80px] opacity-60" />
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-3 gap-8">
            {[
              { icon: Link2, title: 'Unlimited links', desc: 'Add as many links as you want, group them, reorder with drag-and-drop, and toggle visibility.' },
              { icon: Palette, title: 'Beautiful themes', desc: 'Custom backgrounds, button shapes, colors, fonts, light/dark modes. Live preview.' },
              { icon: BarChart3, title: 'Privacy analytics', desc: 'Track views and clicks without IP storage or fingerprinting. Only you see the data.' },
            ].map(f=>(
              <div key={f.title} className="rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-6">
                <f.icon className="h-6 w-6 mb-3" />
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold">Free forever for core features</h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">No ads. No forced branding. No watermark on public pages. You own your profile. Data stays in your Supabase project.</p>
          <Button size="lg" className="mt-6" onClick={()=> navigate('/auth?mode=signup')}>Start building — it takes 60 seconds</Button>
        </section>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-xs text-zinc-500">
          LinkNest • Built for creators • Deployable on Cloudflare Workers + Supabase
        </footer>
      </main>
    </div>
  )
}
