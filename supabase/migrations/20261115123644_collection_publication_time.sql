-- Track when a collection becomes public; ordinary edits do not promote it.
alter table public.gallery_collections add column published_at timestamptz;
-- Historical publication dates were not recorded. Preserve their creation order.
update public.gallery_collections set published_at = created_at where visibility = 'public';

create function public.set_collection_publication_time()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    new.published_at := case when new.visibility = 'public' then statement_timestamp() else null end;
  elsif new.visibility = 'public' and old.visibility is distinct from 'public' then
    new.published_at := statement_timestamp();
  else
    new.published_at := old.published_at;
  end if;
  return new;
end;
$$;
revoke all on function public.set_collection_publication_time() from public, anon, authenticated;
create trigger set_collection_publication_time
before insert or update on public.gallery_collections
for each row execute function public.set_collection_publication_time();
