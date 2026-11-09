-- Fictional demo data. All accounts share the public demo password: demo-portal-2026
-- Runs as postgres (bypasses RLS) on `supabase db reset`, or once in the SQL editor of a fresh project.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  extensions.crypt('demo-portal-2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(),
  '', '', '', ''
from (values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'anna.client@example.com'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'ben.client@example.com'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'maria.manager@example.com')
) as u (id, email);

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select id::text, id, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true), 'email', now(), now(), now()
from auth.users
where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- Profiles were created by the signup trigger; promote the manager.
update public.profiles set role = 'manager' where id = '33333333-3333-3333-3333-333333333333';

insert into public.tickets (owner_id, title, description, status, created_at) values
  ('11111111-1111-1111-1111-111111111111', 'Contact form does not send emails', 'Submissions from the contact page never reach our inbox since Monday.', 'in_progress', now() - interval '6 days'),
  ('11111111-1111-1111-1111-111111111111', 'Add Spanish version of the pricing page', 'We need the pricing page in Spanish before the trade show.', 'new', now() - interval '2 days'),
  ('11111111-1111-1111-1111-111111111111', 'Update team photos', 'New photos are in the shared folder, please replace the old ones.', 'done', now() - interval '14 days'),
  ('11111111-1111-1111-1111-111111111111', 'Checkout button overlaps footer on mobile', 'On iPhone SE the checkout button covers the footer links.', 'new', now() - interval '5 hours'),
  ('22222222-2222-2222-2222-222222222222', 'Invoice PDF shows wrong VAT', 'VAT on invoices is 20% but should be 21% for our region.', 'in_progress', now() - interval '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'Export orders to CSV', 'Monthly export of orders with date, customer and total.', 'new', now() - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Site is slow on the blog page', 'The blog page takes about 6 seconds to load.', 'done', now() - interval '10 days');
