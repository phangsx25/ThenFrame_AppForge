-- US05 initial increment: customer-owned enquiries, no management updates yet.
create table public.booking_enquiries (
  id uuid primary key,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  service text not null check (service in ('Photography','Videography','Combo Photo & Video')),
  event_type text not null check (event_type in ('Akad & Reception (1 Day)','Akad','Reception','Akad & Reception (2 Days)','Pre/Post Wedding','Engagement','Others')),
  event_date date not null,
  colour_style text not null check (colour_style in ('Colourful / Bright','Moody / Dark','Others')),
  contact_name text not null check (char_length(btrim(contact_name)) between 1 and 120),
  contact_phone text not null check (contact_phone ~ '^[+()0-9[:space:].-]{7,30}$' and char_length(regexp_replace(contact_phone, '[^0-9]', '', 'g')) >= 7),
  additional_requirements text not null default '' check (char_length(additional_requirements) <= 3000),
  status text not null default 'pending' check (status in ('pending','under_review','confirmed','rejected')),
  created_at timestamptz not null default now()
);
create index booking_enquiries_customer_created_idx on public.booking_enquiries(customer_id, created_at desc);
alter table public.booking_enquiries enable row level security;
revoke all on public.booking_enquiries from anon, authenticated;
grant select on public.booking_enquiries to authenticated;
grant insert (id,customer_id,service,event_type,event_date,colour_style,contact_name,contact_phone,additional_requirements) on public.booking_enquiries to authenticated;
grant all on public.booking_enquiries to service_role;
create policy "Customers read own enquiries" on public.booking_enquiries
for select to authenticated using ((select auth.uid()) = customer_id);
create policy "Admins read enquiries" on public.booking_enquiries
for select to authenticated using ((select public.is_admin()));
create policy "Customers submit own enquiries" on public.booking_enquiries
for insert to authenticated with check ((select auth.uid()) = customer_id and not (select public.is_admin()) and status='pending');
create function public.check_enquiry_date() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if new.event_date < (statement_timestamp() at time zone 'Asia/Kuala_Lumpur')::date then
    raise exception 'Event date must be today or later (Malaysia time)' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function public.check_enquiry_date() from public, anon, authenticated;
create trigger check_enquiry_date before insert on public.booking_enquiries
for each row execute function public.check_enquiry_date();
