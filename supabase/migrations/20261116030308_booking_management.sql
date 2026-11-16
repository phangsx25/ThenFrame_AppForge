-- US06: admin-only management and atomic, single-capacity event reservations.
alter table public.booking_enquiries
  add column review_version integer not null default 0,
  add column reviewed_at timestamptz,
  add column reviewed_by uuid references public.profiles(id) on delete set null;

create table public.booking_reservations (
  enquiry_id uuid primary key references public.booking_enquiries(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint booking_time_order check (isfinite(starts_at) and isfinite(ends_at) and ends_at > starts_at),
  constraint no_overlapping_bookings exclude using gist
    (tstzrange(starts_at, ends_at, '[)') with &&)
);
create table public.booking_consultations (
  enquiry_id uuid primary key references public.booking_enquiries(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  mode text not null check (mode in ('online','offline')),
  meeting_link text,
  location text,
  status text not null check (status in ('scheduled','completed','cancelled')),
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint consultation_time_order check (isfinite(starts_at) and isfinite(ends_at) and ends_at > starts_at),
  constraint consultation_meeting_details check (
    (mode='online' and meeting_link is not null and meeting_link ~ '^https://[^/?#[:space:]]+([/?#][^[:space:]]*)?$' and length(meeting_link) <= 2048 and location is null)
    or (mode='offline' and meeting_link is null and location is not null and char_length(btrim(location)) between 1 and 300)
  )
);
create index booking_consultations_time_idx on public.booking_consultations(starts_at);
alter table public.booking_reservations enable row level security;
alter table public.booking_consultations enable row level security;
revoke all on public.booking_reservations, public.booking_consultations from anon, authenticated;
grant select on public.booking_reservations, public.booking_consultations to authenticated;
grant all on public.booking_reservations, public.booking_consultations to service_role;

create policy "Read permitted bookings" on public.booking_reservations for select to authenticated using (
  (select public.is_admin()) or exists (
    select 1 from public.booking_enquiries e where e.id=enquiry_id and e.customer_id=(select auth.uid())
  )
);
create policy "Read permitted consultations" on public.booking_consultations for select to authenticated using (
  (select public.is_admin()) or exists (
    select 1 from public.booking_enquiries e where e.id=enquiry_id and e.customer_id=(select auth.uid())
  )
);

-- The definer boundary is intentional: authenticated users have no direct write
-- grants. Each entry point verifies the current profile's admin role explicitly.
create function public.admin_update_enquiry(
  p_id uuid, p_expected_version integer, p_status text,
  p_starts_at timestamptz default null, p_ends_at timestamptz default null
) returns setof public.booking_enquiries
language plpgsql security definer set search_path='' as $$
declare enquiry public.booking_enquiries%rowtype;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Studio admin access required' using errcode='42501';
  end if;
  select * into enquiry from public.booking_enquiries where id=p_id for update;
  if not found then raise exception 'Enquiry not found' using errcode='P0002'; end if;
  if p_expected_version is distinct from enquiry.review_version then
    raise exception 'This enquiry changed. Refresh before saving.' using errcode='40001';
  end if;
  if p_status is null or p_status not in ('pending','under_review','confirmed','rejected') then
    raise exception 'Invalid enquiry status' using errcode='22023';
  end if;
  if enquiry.status='confirmed' and p_status <> 'confirmed' then
    raise exception 'Confirmed bookings cannot be reopened or rejected through review.' using errcode='22023';
  end if;
  if p_status='confirmed' then
    if p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at
       or p_starts_at <= statement_timestamp() then
      raise exception 'Choose a future booking start and a later end time.' using errcode='22023';
    end if;
    begin
      insert into public.booking_reservations(enquiry_id,starts_at,ends_at,updated_by)
      values(p_id,p_starts_at,p_ends_at,auth.uid())
      on conflict(enquiry_id) do update set starts_at=excluded.starts_at,
        ends_at=excluded.ends_at,updated_at=now(),updated_by=auth.uid();
    exception when exclusion_violation then
      raise exception 'This time overlaps another confirmed booking.' using errcode='23P01';
    end;
  end if;
  return query update public.booking_enquiries set status=p_status,
    review_version=review_version+1,reviewed_at=now(),reviewed_by=auth.uid()
    where id=p_id returning *;
end;
$$;

create function public.admin_save_consultation(
  p_id uuid, p_expected_version integer, p_starts_at timestamptz, p_ends_at timestamptz,
  p_mode text, p_meeting_link text, p_location text, p_status text
) returns setof public.booking_consultations
language plpgsql security definer set search_path='' as $$
declare enquiry public.booking_enquiries%rowtype; current_version integer;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Studio admin access required' using errcode='42501';
  end if;
  select * into enquiry from public.booking_enquiries where id=p_id for update;
  if not found then raise exception 'Enquiry not found' using errcode='P0002'; end if;
  select version into current_version from public.booking_consultations where enquiry_id=p_id;
  if p_expected_version is distinct from coalesce(current_version,0) then
    raise exception 'This consultation changed. Refresh before saving.' using errcode='40001';
  end if;
  if p_status is null or p_status not in ('scheduled','completed','cancelled')
     or p_mode is null or p_mode not in ('online','offline')
     or p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at then
    raise exception 'Check the consultation status, mode and times.' using errcode='22023';
  end if;
  if (current_version is null and p_status <> 'scheduled')
     or (enquiry.status='rejected' and p_status <> 'cancelled') then
    raise exception 'Schedule a valid enquiry before updating its consultation.' using errcode='22023';
  end if;
  if (p_status='scheduled' and p_starts_at <= statement_timestamp())
     or (p_status='completed' and p_starts_at > statement_timestamp()) then
    raise exception 'Check the consultation time for this status.' using errcode='22023';
  end if;
  return query insert into public.booking_consultations
    (enquiry_id,starts_at,ends_at,mode,meeting_link,location,status,version,updated_by)
    values(p_id,p_starts_at,p_ends_at,p_mode,
      case when p_mode='online' then nullif(btrim(p_meeting_link),'') else null end,
      case when p_mode='offline' then nullif(btrim(p_location),'') else null end,
      p_status,coalesce(current_version,0)+1,auth.uid())
    on conflict(enquiry_id) do update set starts_at=excluded.starts_at,ends_at=excluded.ends_at,
      mode=excluded.mode,meeting_link=excluded.meeting_link,location=excluded.location,
      status=excluded.status,version=excluded.version,updated_at=now(),updated_by=auth.uid()
    returning *;
end;
$$;
revoke all on function public.admin_update_enquiry(uuid,integer,text,timestamptz,timestamptz) from public,anon,authenticated;
revoke all on function public.admin_save_consultation(uuid,integer,timestamptz,timestamptz,text,text,text,text) from public,anon,authenticated;
grant execute on function public.admin_update_enquiry(uuid,integer,text,timestamptz,timestamptz) to authenticated;
grant execute on function public.admin_save_consultation(uuid,integer,timestamptz,timestamptz,text,text,text,text) to authenticated;
