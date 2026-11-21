-- =====================================================================
-- SYSUPE013CM · Prototip demonstrativ · Schema Supabase
-- Rulați acest script o singură dată în Supabase → SQL Editor.
-- Toate datele sunt FICTIVE / SIMULATE. Nu se stochează date de plată,
-- CNP sau date reale ale beneficiarilor.
-- =====================================================================

-- 1. Contor vizitatori (un singur rând) --------------------------------
create table if not exists public.site_metrics (
  id              smallint primary key default 1 check (id = 1),
  unique_visitors bigint      not null default 0 check (unique_visitors >= 0),
  updated_at      timestamptz not null default now()
);

insert into public.site_metrics (id, unique_visitors)
values (1, 0)
on conflict (id) do nothing;

-- 2. Angajamente individuale simulate ----------------------------------
create table if not exists public.simulated_pledges (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  donor_name  text        not null check (char_length(btrim(donor_name)) between 2 and 60),
  segment     text        not null check (segment in ('alumni', 'parent_academic', 'general_public')),
  channel     text        not null check (channel in ('sms', 'iban_ron', 'iban_eur')),
  amount      numeric(12,2) not null check (amount > 0 and amount <= 100000),
  currency    text        not null check (currency in ('RON', 'EUR')),
  amount_ron  numeric(14,2) not null check (amount_ron > 0 and amount_ron <= 500000),
  is_simulated boolean    not null default true check (is_simulated = true),
  -- coerență canal / monedă
  constraint pledge_channel_currency check (
    (channel in ('sms', 'iban_ron') and currency = 'RON') or
    (channel = 'iban_eur' and currency = 'EUR')
  )
);

-- 3. Cereri de discuție sponsorizare corporate -------------------------
create table if not exists public.corporate_inquiries (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  company_name   text not null check (char_length(btrim(company_name)) between 2 and 80),
  contact_person text not null check (char_length(btrim(contact_person)) between 2 and 60),
  work_email     text not null check (work_email ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' and char_length(work_email) <= 120),
  csr_focus      text not null check (csr_focus in ('education_access', 'stem_infrastructure', 'sustainable_campus')),
  tier           text not null,
  estimated_ron  numeric(14,2) not null,
  is_simulated   boolean not null default true check (is_simulated = true)
);

-- 3b. Migrare idempotentă (sigur de rulat și pe o bază existentă):
--     sectorul de recrutare (cele 5 domenii țintă) și nivelul personalizat.
alter table public.corporate_inquiries add column if not exists industry text;
alter table public.corporate_inquiries drop constraint if exists corporate_inquiries_industry_check;
alter table public.corporate_inquiries add constraint corporate_inquiries_industry_check
  check (industry is null or industry in ('it', 'engineering', 'automotive', 'energy', 'construction'));
alter table public.corporate_inquiries drop constraint if exists corporate_inquiries_tier_check;
alter table public.corporate_inquiries add constraint corporate_inquiries_tier_check
  check (tier in ('10000', '25000', '50000_plus', 'custom'));
alter table public.corporate_inquiries drop constraint if exists corporate_inquiries_estimated_ron_check;
alter table public.corporate_inquiries add constraint corporate_inquiries_estimated_ron_check
  check (
    (tier = '10000' and estimated_ron = 10000) or
    (tier = '25000' and estimated_ron = 25000) or
    (tier = '50000_plus' and estimated_ron = 50000) or
    (tier = 'custom' and estimated_ron between 1000 and 1250000)
  );

-- 4. Row Level Security ------------------------------------------------
alter table public.site_metrics        enable row level security;
alter table public.simulated_pledges   enable row level security;
alter table public.corporate_inquiries enable row level security;

-- Contorul de vizitatori poate fi citit public.
drop policy if exists "site_metrics_public_read" on public.site_metrics;
create policy "site_metrics_public_read" on public.site_metrics
  for select to anon, authenticated using (true);

-- Angajamentele și cererile pot fi DOAR inserate de public (nu citite
-- rând cu rând – totalurile se obțin prin funcția agregată de mai jos,
-- astfel încât numele/e-mailurile introduse nu sunt expuse).
drop policy if exists "pledges_public_insert" on public.simulated_pledges;
create policy "pledges_public_insert" on public.simulated_pledges
  for insert to anon, authenticated with check (is_simulated = true);

drop policy if exists "inquiries_public_insert" on public.corporate_inquiries;
create policy "inquiries_public_insert" on public.corporate_inquiries
  for insert to anon, authenticated with check (is_simulated = true);

-- 5. RPC: incrementare vizitatori (apelat o dată pe sesiune) -----------
create or replace function public.increment_visitors()
returns bigint
language sql
security definer
set search_path = public
as $$
  update public.site_metrics
     set unique_visitors = unique_visitors + 1,
         updated_at = now()
   where id = 1
  returning unique_visitors;
$$;

-- 6. RPC: totaluri agregate pentru panoul de analiză --------------------
create or replace function public.get_funnel_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'visitors',            coalesce((select unique_visitors from public.site_metrics where id = 1), 0),
    'pledge_count',        (select count(*) from public.simulated_pledges),
    'pledge_total_ron',    coalesce((select sum(amount_ron) from public.simulated_pledges), 0),
    'sms_count',           (select count(*) from public.simulated_pledges where channel = 'sms'),
    'sms_total_ron',       coalesce((select sum(amount_ron) from public.simulated_pledges where channel = 'sms'), 0),
    'corporate_count',     (select count(*) from public.corporate_inquiries),
    'corporate_total_ron', coalesce((select sum(estimated_ron) from public.corporate_inquiries), 0)
  );
$$;

revoke all on function public.increment_visitors() from public;
revoke all on function public.get_funnel_stats()   from public;
grant execute on function public.increment_visitors() to anon, authenticated;
grant execute on function public.get_funnel_stats()   to anon, authenticated;
