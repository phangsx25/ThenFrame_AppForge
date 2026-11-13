-- Read-only inspection. Run in the existing project's Supabase SQL Editor.
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns where table_schema = 'public'
  and table_name in ('profiles', 'gallery_collections', 'gallery_photos')
order by table_name, ordinal_position;
select n.nspname as schema, c.relname as table_name, c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('profiles', 'gallery_collections', 'gallery_photos');
select * from pg_policies where schemaname in ('public', 'storage');
select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid) as definition
from pg_constraint where conrelid in ('public.profiles'::regclass, 'public.gallery_collections'::regclass, 'public.gallery_photos'::regclass);
select p.proname, p.prosecdef as security_definer, p.proconfig, pg_get_functiondef(p.oid)
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('is_admin', 'handle_new_user');
select tgname, pg_get_triggerdef(oid) from pg_trigger
where tgrelid = 'auth.users'::regclass and not tgisinternal;
select id, name, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'gallery';
select grantee, table_name, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('profiles', 'gallery_collections', 'gallery_photos');
