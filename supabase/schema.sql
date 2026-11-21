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

-- =====================================================================
-- 7. Program de ambasadori (coduri de recomandare) – migrare idempotentă
--    Codul este pseudonim (ex. AMB-7K2QXP), generat în browser; nu conține
--    date personale și NU oferă recompense – măsoară doar distribuirea.
-- =====================================================================
alter table public.simulated_pledges add column if not exists referral_code text;
alter table public.simulated_pledges drop constraint if exists simulated_pledges_referral_code_check;
alter table public.simulated_pledges add constraint simulated_pledges_referral_code_check
  check (referral_code is null or referral_code ~ '^AMB-[A-Z0-9]{6}$');
create index if not exists simulated_pledges_referral_idx on public.simulated_pledges (referral_code)
  where referral_code is not null;
create index if not exists simulated_pledges_created_idx on public.simulated_pledges (created_at desc);

create table if not exists public.referral_visits (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  referral_code text not null check (referral_code ~ '^AMB-[A-Z0-9]{6}$')
);
create index if not exists referral_visits_code_idx on public.referral_visits (referral_code);

alter table public.referral_visits enable row level security;
drop policy if exists "referral_visits_public_insert" on public.referral_visits;
create policy "referral_visits_public_insert" on public.referral_visits
  for insert to anon, authenticated with check (true);

-- 8. RPC: analiză detaliată (agregate + flux anonimizat) ---------------
create or replace function public.get_funnel_insights()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'by_channel', coalesce((
      select json_object_agg(channel, json_build_object('count', c, 'total', s))
      from (select channel, count(*) c, sum(amount_ron) s from public.simulated_pledges group by channel) x
    ), '{}'::json),
    'by_segment', coalesce((
      select json_object_agg(segment, json_build_object('count', c, 'total', s))
      from (select segment, count(*) c, sum(amount_ron) s from public.simulated_pledges group by segment) x
    ), '{}'::json),
    'by_industry', coalesce((
      select json_object_agg(industry, json_build_object('count', c, 'total', s))
      from (select industry, count(*) c, sum(estimated_ron) s from public.corporate_inquiries
            where industry is not null group by industry) x
    ), '{}'::json),
    'daily', coalesce((
      select json_agg(json_build_object('day', d.day, 'count', coalesce(p.c, 0), 'total', coalesce(p.s, 0)) order by d.day)
      from (
        select gs::date as day
        from generate_series((now() at time zone 'Europe/Bucharest')::date - 13,
                             (now() at time zone 'Europe/Bucharest')::date, interval '1 day') gs
      ) d
      left join (
        select (created_at at time zone 'Europe/Bucharest')::date as day, count(*) c, sum(amount_ron) s
        from public.simulated_pledges group by 1
      ) p on p.day = d.day
    ), '[]'::json),
    -- Flux recent: doar inițiala numelui (fictiv), canal, segment, sumă, moment.
    'recent', coalesce((
      select json_agg(r)
      from (
        select upper(left(btrim(donor_name), 1)) || '.' as initials, channel, segment, amount_ron, created_at
        from public.simulated_pledges order by created_at desc limit 8
      ) r
    ), '[]'::json),
    'referral_visits',  (select count(*) from public.referral_visits),
    'referred_pledges', (select count(*) from public.simulated_pledges where referral_code is not null),
    'referred_total',   coalesce((select sum(amount_ron) from public.simulated_pledges where referral_code is not null), 0),
    'leaderboard', coalesce((
      select json_agg(l)
      from (
        select p.referral_code as code,
               (select count(*) from public.referral_visits v where v.referral_code = p.referral_code) as visits,
               count(*) as pledges,
               sum(p.amount_ron) as total
        from public.simulated_pledges p
        where p.referral_code is not null
        group by p.referral_code
        order by sum(p.amount_ron) desc, count(*) desc
        limit 5
      ) l
    ), '[]'::json)
  );
$$;

-- 9. RPC: impactul unui singur cod de ambasador -------------------------
create or replace function public.get_ambassador_stats(p_code text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_visits bigint;
  v_pledges bigint;
  v_total numeric;
  v_rank bigint;
begin
  if p_code is null or p_code !~ '^AMB-[A-Z0-9]{6}$' then
    return json_build_object('valid', false);
  end if;
  select count(*) into v_visits from public.referral_visits where referral_code = p_code;
  select count(*), coalesce(sum(amount_ron), 0) into v_pledges, v_total
    from public.simulated_pledges where referral_code = p_code;
  select count(*) + 1 into v_rank from (
    select referral_code from public.simulated_pledges
    where referral_code is not null and referral_code <> p_code
    group by referral_code having sum(amount_ron) > v_total
  ) better;
  return json_build_object('valid', true, 'visits', v_visits, 'pledges', v_pledges, 'total', v_total,
                           'rank', case when v_pledges > 0 then v_rank else null end);
end;
$$;

revoke all on function public.get_funnel_insights()        from public;
revoke all on function public.get_ambassador_stats(text)   from public;
grant execute on function public.get_funnel_insights()      to anon, authenticated;
grant execute on function public.get_ambassador_stats(text) to anon, authenticated;
