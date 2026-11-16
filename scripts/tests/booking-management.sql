-- Development assertions for an already migrated test database.
-- Requires a privileged SQL test connection and existing customer/admin profiles.
-- No fixtures are committed, and identity counters are not consumed.
begin;
create temporary table us06_context as select
 (select id from public.profiles where role='customer' limit 1) as customer_id,
 (select id from public.profiles where role='admin' limit 1) as admin_id,
 gen_random_uuid() as a,gen_random_uuid() as b,
 ((current_date+60)::timestamp at time zone 'Asia/Kuala_Lumpur') as day;
grant select on us06_context to authenticated,anon;
insert into public.booking_enquiries
 (id,customer_id,service,event_type,event_date,colour_style,contact_name,contact_phone,reference_number)
 overriding system value
 select c.a,c.customer_id,'Photography','Reception',current_date+60,'Moody / Dark','US06 rollback fixture','+60181234567',
 (select coalesce(max(reference_number),0)+1000 from public.booking_enquiries) from us06_context c;
insert into public.booking_enquiries
 (id,customer_id,service,event_type,event_date,colour_style,contact_name,contact_phone,reference_number)
 overriding system value
 select c.b,c.customer_id,'Photography','Reception',current_date+60,'Moody / Dark','US06 rollback fixture','+60181234567',
 (select coalesce(max(reference_number),0)+1000 from public.booking_enquiries) from us06_context c;
set local role authenticated;
select set_config('request.jwt.claim.sub',(select admin_id::text from us06_context),true);
do $$ declare c record; begin
 select * into c from us06_context;
 if c.customer_id is null or c.admin_id is null then raise exception 'Missing test roles'; end if;
 perform public.admin_update_enquiry(c.a,0,'under_review');
 begin
  perform public.admin_update_enquiry(c.a,0,'rejected');
  raise exception 'Stale write accepted';
 exception when serialization_failure then null; end;
 begin
  perform public.admin_update_enquiry(c.a,1,'confirmed',null,null);
  raise exception 'Missing times accepted';
 exception when invalid_parameter_value then null; end;
 perform public.admin_update_enquiry(c.a,1,'confirmed',c.day+interval '10 hours',c.day+interval '12 hours');
 begin
  perform public.admin_update_enquiry(c.b,0,'confirmed',c.day+interval '11 hours',c.day+interval '13 hours');
  raise exception 'Overlap accepted';
 exception when exclusion_violation then null; end;
 if exists(select 1 from public.booking_reservations where enquiry_id=c.b) or
    (select status from public.booking_enquiries where id=c.b) <> 'pending' then raise exception 'Partial booking committed'; end if;
 perform public.admin_update_enquiry(c.b,0,'confirmed',c.day+interval '12 hours',c.day+interval '13 hours');
 begin
  perform public.admin_update_enquiry(c.a,2,'confirmed',c.day+interval '11 hours',c.day+interval '12 hours 30 minutes');
  raise exception 'Conflicting reschedule accepted';
 exception when exclusion_violation then null; end;
 if (select starts_at from public.booking_reservations where enquiry_id=c.a) <> c.day+interval '10 hours' then raise exception 'Failed reschedule changed original booking'; end if;
 begin
  perform public.admin_update_enquiry(c.a,2,'rejected');
  raise exception 'Confirmed booking reopened';
 exception when invalid_parameter_value then null; end;
 begin
  perform public.admin_save_consultation(c.a,0,c.day-interval '1 day',c.day-interval '23 hours','online',null,null,'scheduled');
  raise exception 'Missing online link accepted';
 exception when check_violation then null; end;
 perform public.admin_save_consultation(c.a,0,c.day-interval '1 day',c.day-interval '23 hours','online','https://example.com/meeting',null,'scheduled');
 begin
  perform public.admin_save_consultation(c.a,0,c.day-interval '1 day',c.day-interval '23 hours','offline',null,'Test studio','scheduled');
  raise exception 'Stale consultation overwrite accepted';
 exception when serialization_failure then null; end;
 perform public.admin_save_consultation(c.a,1,c.day-interval '1 day',c.day-interval '23 hours','offline',null,'Test studio','scheduled');
 perform public.admin_save_consultation(c.a,2,c.day-interval '1 day',c.day-interval '23 hours','offline',null,'Test studio','cancelled');
 if (select version from public.booking_consultations where enquiry_id=c.a) <> 3 then raise exception 'Consultation changes not saved'; end if;
end $$;
select set_config('request.jwt.claim.sub',(select customer_id::text from us06_context),true);
do $$ declare c record; begin
 select * into c from us06_context;
 if (select count(*) from public.booking_reservations where enquiry_id in (c.a,c.b)) <> 2 then raise exception 'Own booking not visible'; end if;
 if not exists(select 1 from public.booking_consultations where enquiry_id=c.a and status='cancelled') then raise exception 'Own consultation not visible'; end if;
 begin perform public.admin_update_enquiry(c.a,2,'rejected'); raise exception 'Customer management accepted'; exception when insufficient_privilege then null; end;
 begin perform public.admin_save_consultation(c.a,3,c.day,c.day+interval '1 hour','offline',null,'Forgery','scheduled'); raise exception 'Customer consultation mutation accepted'; exception when insufficient_privilege then null; end;
 begin update public.booking_reservations set ends_at=ends_at+interval '1 hour' where enquiry_id=c.a; raise exception 'Direct reservation update accepted'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
do $$ begin
 if exists(select 1 from public.booking_reservations where enquiry_id in (select a from us06_context union all select b from us06_context)) then raise exception 'Cross-customer booking leak'; end if;
 if exists(select 1 from public.booking_consultations where enquiry_id=(select a from us06_context)) then raise exception 'Cross-customer consultation leak'; end if;
end $$;
set local role anon;
do $$ begin
 begin perform count(*) from public.booking_reservations; raise exception 'Anonymous bookings readable'; exception when insufficient_privilege then null; end;
 begin perform public.admin_update_enquiry((select a from us06_context),0,'under_review'); raise exception 'Anonymous management accepted'; exception when insufficient_privilege then null; end;
end $$;
rollback;
