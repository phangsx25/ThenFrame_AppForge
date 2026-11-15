-- Existing profiles, roles, emails and passwords are preserved.
alter table public.profiles add column username text;
update public.profiles set username = 'user_' || replace(id::text, '-', '');
alter table public.profiles alter column username set not null;
alter table public.profiles add constraint profiles_username_format
  check (username ~ '^[a-z][a-z0-9_]{2,39}$');
alter table public.profiles add constraint profiles_username_key unique (username);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  selected_username text := lower(btrim(new.raw_user_meta_data->>'username'));
begin
  if selected_username is null or selected_username = '' then
    selected_username := 'user_' || replace(new.id::text, '-', '');
  end if;
  if selected_username !~ '^[a-z][a-z0-9_]{2,39}$' then
    raise exception 'Invalid username format';
  end if;
  insert into public.profiles(id, display_name, username, role)
  values (new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'), ''), 'Customer'), 100),
    selected_username, 'customer');
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Authenticated users can change only their own username through this RPC.
-- Existing SELECT-only profile grants and RLS remain unchanged.
create function public.set_my_username(new_username text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  caller_id uuid := auth.uid();
  normalized text := lower(btrim(new_username));
begin
  if caller_id is null then raise exception 'Sign in to change your username'; end if;
  if normalized is null or normalized !~ '^[a-z][a-z0-9_]{2,39}$' then
    raise exception 'Use 3-40 characters: start with a letter, then letters, numbers or underscores';
  end if;
  update public.profiles set username = normalized where id = caller_id;
  if not found then raise exception 'Account profile not found'; end if;
  return normalized;
exception when unique_violation then
  raise exception 'This username is unavailable. Choose another one';
end;
$$;
revoke all on function public.set_my_username(text) from public, anon;
grant execute on function public.set_my_username(text) to authenticated;

-- Durable attempt limits apply before lookup, including unknown usernames.
create schema if not exists private;
create table private.username_login_attempts (
  username_hash text primary key,
  window_start timestamptz not null,
  attempts integer not null check (attempts > 0)
);
alter table private.username_login_attempts enable row level security;
revoke all on private.username_login_attempts from public, anon, authenticated;

create function public.resolve_username_login(login_username text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  normalized text := lower(btrim(login_username));
  attempt_count integer;
  login_email text;
begin
  if normalized is null or normalized !~ '^[a-z][a-z0-9_]{2,39}$' then return null; end if;
  delete from private.username_login_attempts where window_start < now() - interval '1 day';
  insert into private.username_login_attempts(username_hash, window_start, attempts)
  values (md5(normalized), now(), 1)
  on conflict (username_hash) do update set
    attempts = case when username_login_attempts.window_start < now() - interval '15 minutes'
      then 1 else username_login_attempts.attempts + 1 end,
    window_start = case when username_login_attempts.window_start < now() - interval '15 minutes'
      then now() else username_login_attempts.window_start end
  returning attempts into attempt_count;
  if attempt_count > 10 then raise exception 'username_login_rate_limited'; end if;
  select u.email into login_email from public.profiles p join auth.users u on u.id = p.id
    where p.username = normalized;
  return login_email;
end;
$$;
revoke all on function public.resolve_username_login(text) from public, anon, authenticated;
grant execute on function public.resolve_username_login(text) to service_role;

-- Rollback requires restoring the previous handle_new_user definition before
-- removing the username column. Do not drop profiles or auth.users.
