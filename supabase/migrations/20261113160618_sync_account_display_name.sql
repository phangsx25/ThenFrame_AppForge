-- Keep the existing profile and its role. Only sync a valid user-entered name.
create or replace function public.sync_account_display_name()
returns trigger language plpgsql security definer set search_path = '' as $$
declare account_name text := btrim(new.raw_user_meta_data->>'display_name');
begin
  if account_name is not null and char_length(account_name) between 1 and 100 then
    update public.profiles set display_name = account_name where id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function public.sync_account_display_name() from public, anon, authenticated;
create trigger on_auth_user_display_name_updated
after update of raw_user_meta_data on auth.users
for each row when (old.raw_user_meta_data is distinct from new.raw_user_meta_data)
execute function public.sync_account_display_name();
-- Rollback: drop trigger on_auth_user_display_name_updated on auth.users;
-- drop function public.sync_account_display_name(); Existing names/roles are retained.
