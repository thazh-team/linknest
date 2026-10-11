
# LinkNest — Free Personal Profile Platform

Build a beautiful personal profile and link-in-bio page. Free, no ads, no watermark, privacy-focused.

**Stack:** React + TypeScript + Vite, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), Cloudflare Workers, Wrangler, Zod, React Router, Lucide, Vitest.

> Inspired by OwnBio, MyLinks.page, Solo.to, Linktree but with original branding and implementation.

## Features

- 🔐 Supabase Auth: register, login, email verification, password reset, persistent sessions
- 👤 Public profiles at `/@username` with avatar, cover, bio, location, contact, status, SEO
- 🔗 Unlimited links (within free-tier limits) with title, URL, description, icon, grouping, ordering, active toggle
- 🎨 Appearance: themes, custom colors, button styles (pill/rounded/sharp/soft), live preview, light/dark
- 📊 Privacy analytics: profile views, link clicks, daily totals, top links — no IP storage, no fingerprinting
- 📱 Mobile-first, Android-optimized, responsive, accessible (keyboard, focus, alt text, reduced-motion)
- 🔗 Sharing: copy URL, Web Share API, QR code
- 🛡️ Security: RLS, safe URL validation, XSS protection, rate limiting, bot filtering, reserved usernames
- 🚀 Deploy via Cloudflare Workers + static assets
- 🧪 Tests: Vitest

## Project Structure

```
linknest/
├── public/                # static assets
├── supabase/migrations/   # SQL migrations (profiles, links, groups, analytics, reports, RLS, storage)
├── src/
│   ├── components/ui/     # Button, Input, Card, Toast
│   ├── components/layout/ # Navbar, DashboardLayout
│   ├── components/profile/ # ProfileCard, QRShare
│   ├── context/           # AuthContext
│   ├── hooks/             # useProfile
│   ├── lib/               # supabase client, utils, validation, constants, analytics
│   ├── pages/             # Home, Auth, PublicProfile, NotFound, dashboard/* 
│   ├── App.tsx
│   └── main.tsx
├── worker/                # Cloudflare Worker API (analytics, OG SSR, health)
├── wrangler.toml
├── vite.config.ts
├── tailwind.config.js
└── tests/
```

## Quick Start

1. **Clone & install**
```bash
npm install
```

2. **Supabase setup**
- Create project at supabase.com
- Run migrations: copy `supabase/migrations/*.sql` into Supabase SQL editor and run in order (0001, 0002, 0003)
- Create Storage buckets `avatars` and `covers` as public (migration does it via SQL, but also check Dashboard > Storage)
- Auth settings:
  - Enable Email provider
  - Set Site URL: `https://yourdomain.com`
  - Add Redirect URLs: `https://yourdomain.com/*`, `http://localhost:5173/*`
  - Enable email confirmation

3. **Env**
```bash
cp .env.example .env
# fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_APP_URL
cp .dev.vars.example .dev.vars
# fill SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, APP_URL
```

4. **Dev**
```bash
npm run dev
# frontend at http://localhost:5173
# worker dev (optional):
npm run dev:worker
```

5. **Build & deploy**
```bash
npm run build
npm run deploy
# set secrets:
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put SUPABASE_ANON_KEY
```

## Database Schema

- `profiles`: id (uuid fk auth.users), username unique normalized, display_name, bio, avatar_url, cover_url, location, contact_email, contact_email_public bool, visibility enum, theme_config jsonb, meta_title, meta_description, status_text, timestamps
- `links`: id uuid, profile_id fk, title, url, description, icon, sort_order, is_active, is_public, group_id fk, timestamps
- `link_groups`: id, profile_id, title, sort_order, timestamps
- `analytics_events`: id, profile_id, link_id nullable, event_type enum (profile_view, link_click), date_bucket date, country_code, referrer, created_at
- `analytics_daily`: aggregated counts (optional)
- `profile_reports`: id, reported_profile_id, reporter_user_id nullable, category enum, description, status enum, created_at

All tables have RLS enabled. See migration 0002 for policies.

## Security

- RLS: users edit only own profiles/links/groups. Analytics readable only by owner. Reports not publicly readable.
- Public data via views `public_profiles` and `public_links` that filter by visibility and active status and hide private email.
- Safe URL validation: only http/https, reject javascript:, data:
- Username normalization + reserved list
- File type & size limits on avatars (2MB) and covers (4MB), folder-per-user storage policies
- Worker analytics: bot filtering, no IP storage, referrer trimmed
- Never expose service_role key in frontend

## Cloudflare Workers

Worker (`worker/index.ts`) provides:
- `GET /api/health` — health check
- `POST /api/analytics/view` — track profile view (bot filtered, service_role insert)
- `POST /api/analytics/click` — track link click
- Crawler OG SSR for `/@username` when user-agent matches bots — returns minimal HTML with OG tags fetched via service role

Static assets served via `[assets]` binding in wrangler.toml with SPA fallback.

Secrets via `wrangler secret put` and `.dev.vars` for local.

## Deployment Checklist

- [ ] Supabase project created, migrations applied
- [ ] Storage buckets `avatars`, `covers` public
- [ ] Auth redirect URLs set
- [ ] `.env` and `.dev.vars` filled (no secrets committed)
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] `wrangler deploy` succeeds
- [ ] Custom domain connected in Cloudflare dashboard, HTTPS enabled
- [ ] Test public profile, OG preview (https://www.opengraph.xyz/), QR, analytics

## Costs & Limits

Core features work on free tiers:
- Supabase free: 500MB DB, 1GB storage, 50k monthly active users, 2GB bandwidth
- Cloudflare Workers free: 100k requests/day, 10ms CPU, assets up to 25MB per file
- Use pagination, limit image sizes, and consider pruning `analytics_events` after 90 days (keep daily aggregates)

Document limits in your deployment; do not promise unlimited.

## License

MIT — Build your own LinkNest instance.
