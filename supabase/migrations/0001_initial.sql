-- 0001_initial.sql - LinkNest core tables
create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  cover_url text,
  location text,
  contact_email text,
  contact_email_public boolean not null default false,
  visibility text not null default 'public' check (visibility in ('public','unlisted','disabled')),
  theme_config jsonb not null default '{}'::jsonb,
  meta_title text,
  meta_description text,
  status_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add constraint username_format check (username ~* '^[a-z0-9_]{3,30}$');

create table public.link_groups (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.links (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  url text not null,
  description text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  is_public boolean not null default true,
  group_id uuid references public.link_groups(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  link_id uuid references public.links(id) on delete set null,
  event_type text not null check (event_type in ('profile_view','link_click')),
  date_bucket date not null default current_date,
  country_code text,
  referrer text,
  created_at timestamptz not null default now()
);

create table public.analytics_daily (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  link_id uuid references public.links(id) on delete set null,
  event_type text not null,
  date_bucket date not null,
  count int not null default 1
);

create table public.profile_reports (
  id uuid primary key default uuid_generate_v4(),
  reported_profile_id uuid not null references public.profiles(id) on delete cascade,
  reporter_user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('spam','abuse','impersonation','inappropriate','other')),
  description text,
  status text not null default 'pending' check (status in ('pending','reviewed','dismissed','actioned')),
  created_at timestamptz not null default now()
);

create index idx_profiles_username on public.profiles (lower(username));
create index idx_links_profile_id_sort on public.links (profile_id, sort_order);
create index idx_links_group on public.links (group_id);
create index idx_link_groups_profile on public.link_groups (profile_id, sort_order);
create index idx_analytics_profile_date on public.analytics_events (profile_id, date_bucket);
create index idx_analytics_link_date on public.analytics_events (link_id, date_bucket);
create index idx_analytics_daily_profile on public.analytics_daily (profile_id, date_bucket);

create or replace function public.handle_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.handle_updated_at();
create trigger trg_links_updated before update on public.links for each row execute function public.handle_updated_at();
create trigger trg_groups_updated before update on public.link_groups for each row execute function public.handle_updated_at();
