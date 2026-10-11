
import { Profile, Link as LinkType, LinkGroup, ThemeConfig } from '../../lib/supabase'
import { ExternalLink, MapPin, Mail, Share2 } from 'lucide-react'
import { trackLinkClick } from '../../lib/analytics'
import { useState } from 'react'

export function ProfileCard({ profile, links, groups, isPreview }: { profile: Profile; links: LinkType[]; groups: LinkGroup[]; isPreview?: boolean }) {
  const theme = profile.theme_config || {}
  const buttonStyle = theme.buttonStyle || 'rounded'
  const radiusMap: Record<string,string> = { rounded: 'rounded-2xl', pill: 'rounded-full', sharp: 'rounded-none', soft: 'rounded-xl' }
  const radius = radiusMap[buttonStyle] || 'rounded-2xl'

  const grouped = groups.length ? groups.sort((a,b)=> a.sort_order-b.sort_order).map(g => ({
    group: g,
    links: links.filter(l => l.group_id===g.id).sort((a,b)=> a.sort_order-b.sort_order)
  })) : []
  const ungrouped = links.filter(l => !l.group_id).sort((a,b)=> a.sort_order-b.sort_order)

  const bgStyle: any = {}
  if (theme.background?.startsWith('linear-gradient') || theme.background?.startsWith('radial')) {
    bgStyle.background = theme.background
  } else if (theme.background) {
    bgStyle.backgroundColor = theme.background
  }
  if (theme.backgroundImage) {
    bgStyle.backgroundImage = `url(${theme.backgroundImage})`
    bgStyle.backgroundSize = 'cover'
    bgStyle.backgroundPosition = 'center'
  }

  const textColor = theme.textColor

  const [showShare, setShowShare] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: profile.display_name, url }); return } catch {}
    }
    await navigator.clipboard.writeText(url)
    setShowShare(true)
    setTimeout(()=> setShowShare(false), 2000)
  }

  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-8 md:py-12" style={bgStyle}>
      <div className="w-full max-w-[680px] flex flex-col items-center" style={textColor ? { color: textColor } : undefined}>
        {/* Cover */}
        {profile.cover_url && (
          <div className="w-full h-[160px] md:h-[200px] rounded-[24px] overflow-hidden mb-6 bg-zinc-100 dark:bg-zinc-800">
            <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}

        {/* Avatar */}
        <div className="relative">
          <div className="h-24 w-24 md:h-28 md:w-28 rounded-full overflow-hidden ring-4 ring-white dark:ring-zinc-900 shadow-soft-lg bg-zinc-100">
            {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center text-3xl">✦</div>}
          </div>
          {profile.status_text && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs px-3 py-1 rounded-full shadow">{profile.status_text}</div>
          )}
        </div>

        <h1 className="mt-6 font-display text-[28px] md:text-[32px] font-semibold tracking-tight text-center leading-tight">{profile.display_name}</h1>
        <p className="text-sm opacity-70">@{profile.username}</p>
        {profile.bio && <p className="mt-3 text-[15px] leading-relaxed text-center max-w-[520px] whitespace-pre-wrap opacity-90">{profile.bio}</p>}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm opacity-70">
          {profile.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.location}</span>}
          {profile.contact_email && profile.contact_email_public && <a href={"mailto:"+profile.contact_email} className="inline-flex items-center gap-1 hover:underline"><Mail className="h-4 w-4" /> Contact</a>}
        </div>

        <button onClick={handleShare} className="mt-5 inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition">
          <Share2 className="h-4 w-4" /> Share {showShare && <span className="ml-1 text-xs">Copied!</span>}
        </button>

        {/* Links */}
        <div className="mt-8 w-full space-y-6">
          {grouped.length === 0 && ungrouped.length === 0 && (
            <div className="text-center py-12 rounded-[20px] border border-dashed border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50">
              <p className="text-sm opacity-60">No links yet</p>
            </div>
          )}

          {grouped.map(({ group, links: glinks }) => glinks.length > 0 && (
            <div key={group.id} className="space-y-3">
              <h2 className="font-medium text-[13px] uppercase tracking-widest opacity-60 px-1">{group.title}</h2>
              <div className="space-y-3">
                {glinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noreferrer"
                    onClick={()=> !isPreview && trackLinkClick(profile.id, link.id)}
                    className={"group flex items-center justify-between gap-3 w-full px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-soft hover:shadow-soft-lg hover:-translate-y-[1px] transition-all text-left " + radius}
                    style={theme.buttonColor ? { backgroundColor: theme.buttonColor, color: theme.buttonTextColor || undefined, borderColor: theme.buttonBorder || undefined } : undefined}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-[15px] truncate">{link.title}</div>
                      {link.description && <div className="text-[13px] opacity-70 truncate">{link.description}</div>}
                    </div>
                    <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          ))}

          {ungrouped.length > 0 && (
            <div className="space-y-3">
              {grouped.length > 0 && <h2 className="font-medium text-[13px] uppercase tracking-widest opacity-60 px-1">Links</h2>}
              {ungrouped.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer"
                  onClick={()=> !isPreview && trackLinkClick(profile.id, link.id)}
                  className={"group flex items-center justify-between gap-3 w-full px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-soft hover:shadow-soft-lg hover:-translate-y-[1px] transition-all text-left " + radius}
                  style={theme.buttonColor ? { backgroundColor: theme.buttonColor, color: theme.buttonTextColor || undefined, borderColor: theme.buttonBorder || undefined } : undefined}
                >
                  <div className="min-w-0">
                    <div className="font-medium text-[15px] truncate">{link.title}</div>
                    {link.description && <div className="text-[13px] opacity-70 truncate">{link.description}</div>}
                  </div>
                  <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 text-[11px] opacity-40 text-center">
          Built with LinkNest • Free • No ads
        </div>
      </div>
    </div>
  )
}
