-- 0002_rls.sql
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.link_groups enable row level security;
alter table public.analytics_events enable row level security;
alter table public.analytics_daily enable row level security;
alter table public.profile_reports enable row level security;

create policy "Public profiles are viewable" on public.profiles for select using (visibility in ('public','unlisted'));
create policy "Owners can manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Public can view active links of public profiles" on public.links for select using (
  is_active = true and is_public = true and exists (select 1 from public.profiles p where p.id = profile_id and p.visibility in ('public','unlisted'))
);
create policy "Owners can manage own links" on public.links for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "Public can view groups of public profiles" on public.link_groups for select using (
  exists (select 1 from public.profiles p where p.id = profile_id and p.visibility in ('public','unlisted'))
);
create policy "Owners can manage own groups" on public.link_groups for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "Owners can view own analytics" on public.analytics_events for select using (auth.uid() = profile_id);
create policy "Allow insert analytics from anyone for public profiles" on public.analytics_events for insert with check (
  exists (select 1 from public.profiles p where p.id = profile_id and p.visibility in ('public','unlisted'))
);

create policy "Owners can view daily" on public.analytics_daily for select using (auth.uid() = profile_id);
create policy "Allow insert daily from public" on public.analytics_daily for insert with check (true);
create policy "Allow update daily" on public.analytics_daily for update using (true) with check (true);

create policy "Anyone can report" on public.profile_reports for insert with check (true);
create policy "No public read reports" on public.profile_reports for select using (false);

create or replace view public.public_profiles as
select id, username, display_name, bio, avatar_url, cover_url, location,
case when contact_email_public then contact_email else null end as contact_email,
contact_email_public, visibility, theme_config, meta_title, meta_description, status_text, created_at
from public.profiles where visibility in ('public','unlisted');

create or replace view public.public_links as
select l.id, l.profile_id, l.title, l.url, l.description, l.icon, l.sort_order, l.group_id, l.created_at
from public.links l join public.profiles p on p.id = l.profile_id
where l.is_active = true and l.is_public = true and p.visibility in ('public','unlisted');

grant select on public.public_profiles to anon, authenticated;
grant select on public.public_links to anon, authenticated;
