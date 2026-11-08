create type public.user_role as enum ('client', 'manager');
create type public.ticket_status as enum ('new', 'in_progress', 'done');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role public.user_role not null default 'client',
  created_at timestamptz not null default now()
);

create table public.tickets (
  id bigint generated always as identity primary key,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  status public.ticket_status not null default 'new',
  created_at timestamptz not null default now()
);

create index tickets_owner_id_idx on public.tickets (owner_id);

-- Every new auth user gets a client profile; managers are promoted by SQL only.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
