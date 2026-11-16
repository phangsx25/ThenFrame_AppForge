-- Keep UUIDs for retry safety; expose an immutable, readable database reference.
alter table public.booking_enquiries
  add column reference_number bigint generated always as identity,
  add column reference text generated always as (
    'TF-ENQ-' || lpad(reference_number::text, greatest(6, length(reference_number::text)), '0')
  ) stored;
alter table public.booking_enquiries
  add constraint booking_enquiries_reference_key unique(reference);
comment on column public.booking_enquiries.reference is
  'Server-assigned enquiry reference. Monotonic sequence, not gapless; UUID remains the retry key.';

-- Normalize future submissions without rewriting existing customer contact data.
create function public.normalize_enquiry_phone() returns trigger
language plpgsql security invoker set search_path='' as $$
declare compact text;
begin
  compact := btrim(new.contact_phone);
  if compact = '' or length(compact) > 30 or compact !~ '^[+]?[0-9[:space:]().-]+$' then
    raise exception 'Invalid contact phone format' using errcode='23514';
  end if;
  compact := regexp_replace(compact, '[[:space:]().-]', '', 'g');
  if compact ~ '^1[0-9]{8,9}$' then
    compact := '+60' || compact;
  elsif compact ~ '^0[0-9]+$' then
    compact := '+60' || substr(compact, 2);
  elsif compact ~ '^60[0-9]{8,11}$' then
    compact := '+' || compact;
  end if;
  if compact !~ '^[+][1-9][0-9]{6,14}$' then
    raise exception 'Invalid contact phone format' using errcode='23514';
  end if;
  new.contact_phone := compact;
  return new;
end;
$$;
revoke all on function public.normalize_enquiry_phone() from public, anon, authenticated;
create trigger normalize_enquiry_phone before insert or update of contact_phone on public.booking_enquiries
for each row execute function public.normalize_enquiry_phone();

-- Existing column INSERT grants deliberately exclude both reference columns.
