
export interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  APP_URL: string
  APP_NAME: string
}

type AnalyticsBody = { profile_id: string; link_id?: string; referrer?: string | null }

function isBot(userAgent: string): boolean {
  const bots = ['bot','crawler','spider','curl','wget','facebookexternalhit','slurp','mediapartners','baidu','yandex']
  const ua = userAgent.toLowerCase()
  return bots.some(b => ua.includes(b))
}

function jsonResponse(data: any, status=200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }})
    }

    // Health check
    if (path === '/api/health') {
      return jsonResponse({ status: 'ok', app: env.APP_NAME || 'LinkNest', timestamp: new Date().toISOString() })
    }

    // Analytics view
    if (path === '/api/analytics/view' && request.method === 'POST') {
      try {
        const ua = request.headers.get('user-agent') || ''
        if (isBot(ua)) return jsonResponse({ ok: true, filtered: 'bot' })
        const body = await request.json() as AnalyticsBody
        if (!body.profile_id) return jsonResponse({ error: 'profile_id required' }, 400)
        // Basic rate limiting via in-memory? For production use KV
        const ip = request.headers.get('cf-connecting-ip') || 'unknown'
        // Do not store IP, just use for rate limiting hash then discard
        // Insert via Supabase service role
        const supabaseUrl = env.SUPABASE_URL
        const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !serviceKey) return jsonResponse({ error: 'server not configured' }, 500)

        const dateBucket = new Date().toISOString().slice(0,10)
        const payload = {
          profile_id: body.profile_id,
          event_type: 'profile_view',
          date_bucket: dateBucket,
          referrer: body.referrer ? body.referrer.slice(0, 500) : null
        }

        await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
          method: 'POST',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        })

        return jsonResponse({ ok: true })
      } catch (e:any) {
        return jsonResponse({ error: e.message }, 500)
      }
    }

    if (path === '/api/analytics/click' && request.method === 'POST') {
      try {
        const ua = request.headers.get('user-agent') || ''
        if (isBot(ua)) return jsonResponse({ ok: true, filtered: 'bot' })
        const body = await request.json() as AnalyticsBody
        if (!body.profile_id || !body.link_id) return jsonResponse({ error: 'profile_id and link_id required' }, 400)

        const supabaseUrl = env.SUPABASE_URL
        const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !serviceKey) return jsonResponse({ error: 'server not configured' }, 500)

        const dateBucket = new Date().toISOString().slice(0,10)
        const payload = {
          profile_id: body.profile_id,
          link_id: body.link_id,
          event_type: 'link_click',
          date_bucket: dateBucket
        }

        await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
          method: 'POST',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        })

        return jsonResponse({ ok: true })
      } catch (e:any) {
        return jsonResponse({ error: e.message }, 500)
      }
    }

    // Public profile metadata endpoint for OG tags (SSR for crawlers)
    if (path.startsWith('/@')) {
      // Let static asset handling serve index.html; but if crawler, we want OG
      const userAgent = request.headers.get('user-agent') || ''
      const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegram/i.test(userAgent)
      if (isCrawler && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
        const username = path.replace('/@','').split('/')[0].toLowerCase()
        try {
          const res = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?username=eq.${username}&select=display_name,bio,avatar_url,meta_title,meta_description&limit=1`, {
            headers: { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
          })
          const data = await res.json() as any[]
          if (data && data[0]) {
            const p = data[0]
            const title = p.meta_title || `${p.display_name} — ${env.APP_NAME || 'LinkNest'}`
            const desc = p.meta_description || p.bio || 'Personal profile on LinkNest'
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><meta name="description" content="${desc.replace(/"/g,'&quot;')}"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc.replace(/"/g,'&quot;')}"><meta property="og:image" content="${p.avatar_url||''}"><meta property="og:url" content="${env.APP_URL}/@${username}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${desc.replace(/"/g,'&quot;')}"></head><body><p>Redirecting...</p><script>window.location.href="/@${username}"</script></body></html>`
            return new Response(html, { headers: { 'Content-Type': 'text/html' } })
          }
        } catch {}
      }
      // fallthrough to assets
    }

    // For all other /api routes, 404
    if (path.startsWith('/api/')) {
      return jsonResponse({ error: 'not found' }, 404)
    }

    // Let Cloudflare Assets handle static files (SPA fallback configured in wrangler.toml)
    return new Response('Not found', { status: 404 })
  }
} as ExportedHandler<Env>
