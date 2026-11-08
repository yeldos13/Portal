alter table public.profiles enable row level security;
alter table public.tickets enable row level security;

-- Security definer so policies can read profiles without recursing into profiles RLS.
create function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'manager'
  );
$$;

-- Column grants: clients may only send title/description; owner_id and status come from defaults.
-- Only status is updatable, and only managers pass the update policy. No delete at all.
revoke all on public.profiles, public.tickets from anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.tickets to authenticated;
grant insert (title, description) on public.tickets to authenticated;
grant update (status) on public.tickets to authenticated;

create policy "profiles: read own, managers read all"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_manager()));

create policy "tickets: read own, managers read all"
  on public.tickets for select to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_manager()));

create policy "tickets: clients create their own"
  on public.tickets for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "tickets: managers change status"
  on public.tickets for update to authenticated
  using ((select public.is_manager()))
  with check ((select public.is_manager()));
