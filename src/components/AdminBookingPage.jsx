import { useEffect, useRef, useState } from "react";
import { ENQUIRY_STATUSES, checkAvailability, listBookingManagement, malaysiaInput, malaysiaTime, saveConsultation, updateEnquiry } from "../lib/bookings";
import { displayContactPhone } from "../lib/phone";
import { Workspace } from "./Layout";
import { Notice } from "./UI";

export default function AdminBookingPage({ client, auth }) {
  const [data, setData] = useState({ enquiries: [], reservations: [], consultations: [] });
  const [loading, setLoading] = useState(true), [error, setError] = useState(""), [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState(""), [status, setStatus] = useState(""), [date, setDate] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    listBookingManagement(client).then((value) => { if (active) setData(value); })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [client, refresh]);
  function reload() { setLoading(true); setError(""); setRefresh((n) => n + 1); }
  const selected = data.enquiries.find((item) => item.id === selectedId);
  const shown = data.enquiries.filter((item) => (!status || item.status === status) && (!date || item.event_date === date) &&
    `${item.reference} ${item.contact_name} ${item.contact_phone} ${item.service} ${item.event_type}`.toLowerCase().includes(query.toLowerCase()));
  const dayStart = date ? Date.parse(`${date}T00:00:00+08:00`) : null;
  const reservations = data.reservations.filter((item) => !date ||
    (Date.parse(item.starts_at) < dayStart + 86400000 && Date.parse(item.ends_at) > dayStart));

  return <Workspace auth={auth} admin active="Booking" onSection={() => { window.location.hash = "/admin"; }}>
    <div className="dashboard-heading"><div><span className="eyebrow">STUDIO / BOOKINGS & CONSULTATIONS</span>
      <h1>Plan the next story.</h1><p>Review enquiries, check event times and arrange consultations. All times are Malaysia time.</p></div>
      <button className="button-outline" onClick={reload} disabled={loading}>Refresh bookings</button></div>
    {message && <Notice>{message}</Notice>}
    {loading ? <p role="status">Loading studio bookings…</p> : error ? <Notice error>{error} <button className="text-button" onClick={reload}>Try again</button></Notice> : <>
      <section className="booking-panel" aria-labelledby="enquiries-title">
        <h2 id="enquiries-title">Customer enquiries</h2>
        <div className="booking-filters">
          <label>Search enquiries<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Reference, customer or service" /></label>
          <label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>
            {Object.entries(ENQUIRY_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Event date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        </div>
        {shown.length ? <div className="booking-list">{shown.map((item) => <button key={item.id} className={`booking-list-item ${selectedId === item.id ? "selected" : ""}`}
          aria-pressed={selectedId === item.id} onClick={() => setSelectedId(item.id)}>
          <span><strong>{item.reference}</strong><small>{item.contact_name} · {item.service} · {item.event_date}</small></span>
          <span className="pill">{ENQUIRY_STATUSES[item.status]}</span>
        </button>)}</div> : <p>No enquiries match these filters.</p>}
      </section>
      {selected && <EnquiryReview key={`${selected.id}-${selected.review_version}-${refresh}`} client={client} enquiry={selected}
        reservation={data.reservations.find((r) => r.enquiry_id === selected.id)}
        consultation={data.consultations.find((r) => r.enquiry_id === selected.id)}
        onSaved={(enquiry, consultation) => { if (enquiry) setMessage(enquiry.status === "confirmed" ? `${enquiry.reference}: booking confirmed.` : `${enquiry.reference}: status saved.`); setData((previous) => ({ ...previous,
          enquiries: enquiry ? previous.enquiries.map((item) => item.id === enquiry.id ? enquiry : item) : previous.enquiries,
          consultations: consultation ? [consultation, ...previous.consultations.filter((item) => item.enquiry_id !== consultation.enquiry_id)] : previous.consultations,
        })); }} onReload={reload} />}
      <section className="booking-panel" aria-labelledby="schedule-title"><h2 id="schedule-title">Confirmed event schedule</h2>
        <p>Only confirmed event bookings reserve a time slot. Pending enquiries and consultations do not reserve event capacity.</p>
        {reservations.length ? reservations.map((item) => {
          const enquiry = data.enquiries.find((entry) => entry.id === item.enquiry_id);
          return <article className="booking-schedule-item" key={item.enquiry_id}><strong>{enquiry?.reference} · {enquiry?.contact_name}</strong>
            <p>{malaysiaTime(item.starts_at)} → {malaysiaTime(item.ends_at)}</p>
            <button className="text-button" onClick={() => setSelectedId(item.enquiry_id)}>Open enquiry</button></article>;
        }) : <p>No confirmed bookings{date ? " overlap this day" : " yet"}.</p>}
      </section>
    </>}
  </Workspace>;
}

function EnquiryReview({ client, enquiry, reservation, consultation, onSaved, onReload }) {
  const [status, setStatus] = useState(enquiry.status);
  const [start, setStart] = useState(malaysiaInput(reservation?.starts_at)), [end, setEnd] = useState(malaysiaInput(reservation?.ends_at));
  const [mode, setMode] = useState(consultation?.mode || "online");
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  const [availability, setAvailability] = useState(null);
  const running = useRef(false);
  async function run(action) {
    if (running.current) return;
    running.current = true; setBusy(true); setError(""); setMessage("");
    try { await action(); } catch (e) { setError(e.message); }
    finally { running.current = false; setBusy(false); }
  }
  async function saveStatus(event) {
    event.preventDefault();
    await run(async () => {
      const result = await updateEnquiry(client, enquiry, status, start, end);
      onSaved(result);
      // The schedule is reloaded from the server after a reservation changes.
      onReload();
    });
  }
  async function schedule(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    await run(async () => {
      const result = await saveConsultation(client, enquiry.id, consultation, values);
      onSaved(null, result); setMessage("Consultation saved. The customer can view the current details in their account.");
    });
  }
  return <section className="booking-panel" aria-labelledby="review-title">
    <h2 id="review-title">{enquiry.reference}</h2>
    <dl className="booking-details"><dt>Customer</dt><dd>{enquiry.contact_name} · {displayContactPhone(enquiry.contact_phone)}</dd>
      <dt>Requested event</dt><dd>{enquiry.event_type} · {enquiry.event_date}</dd><dt>Service</dt><dd>{enquiry.service}</dd>
      <dt>Colour/style</dt><dd>{enquiry.colour_style}</dd><dt>Requirements</dt><dd className="enquiry-notes">{enquiry.additional_requirements || "None provided."}</dd></dl>
    {error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
    <form onSubmit={saveStatus}><fieldset disabled={busy} className="enquiry-fields">
      <h3>Review and booking</h3>
      <label>Enquiry status<select value={status} onChange={(e) => setStatus(e.target.value)}>
        {Object.entries(ENQUIRY_STATUSES).filter(([key]) => enquiry.status !== "confirmed" || key === "confirmed").map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <div className="enquiry-form-grid">
        <label>Event start<input type="datetime-local" value={start} required={status === "confirmed"} onChange={(e) => { setStart(e.target.value); setAvailability(null); }} /></label>
        <label>Event end<input type="datetime-local" value={end} required={status === "confirmed"} onChange={(e) => { setEnd(e.target.value); setAvailability(null); }} /></label>
      </div>
      <p className="small-text muted">Enter the full reserved time window, including all days for a multi-day booking. Times must not overlap another confirmed event. Confirm the agreed details with the customer before confirming a booking.</p>
      <div className="button-row"><button type="button" className="button-outline" onClick={() => run(async () => {
        const conflicts = await checkAvailability(client, enquiry.id, start, end); setAvailability(conflicts);
      })}>Check availability</button>
        <button type="submit" className="primary">{busy ? "Saving…" : status === "confirmed" ? "Confirm booking / save times" : "Save status"}</button></div>
      {availability && <Notice error={availability.length > 0}>{availability.length ? "This time overlaps a confirmed booking. Choose another time." : "No confirmed booking overlaps this time. Availability is checked again when confirming."}</Notice>}
    </fieldset></form>
    <form onSubmit={schedule} className="consultation-form"><fieldset disabled={busy} className="enquiry-fields">
      <h3>Consultation</h3><p>Arrange a meeting with the customer. Meeting links are entered manually.</p>
      <div className="enquiry-form-grid">
        <label>Consultation start<input name="start" type="datetime-local" required defaultValue={malaysiaInput(consultation?.starts_at)} /></label>
        <label>Consultation end<input name="end" type="datetime-local" required defaultValue={malaysiaInput(consultation?.ends_at)} /></label>
        <label>Mode<select name="mode" value={mode} onChange={(e) => setMode(e.target.value)}><option value="online">Online</option><option value="offline">Offline</option></select></label>
        <label>Consultation status<select name="status" defaultValue={consultation?.status || "scheduled"}>
          <option value="scheduled">Scheduled</option>{consultation && <><option value="completed">Completed</option><option value="cancelled">Cancelled</option></>}
        </select></label>
      </div>
      {mode === "online" ? <label>Meeting link<input name="meeting_link" type="url" required maxLength={2048} placeholder="https://…" defaultValue={consultation?.meeting_link || ""} /></label>
        : <label>Meeting location<input name="location" required maxLength={300} defaultValue={consultation?.location || ""} /></label>}
      <button type="submit" className="primary">{busy ? "Saving…" : "Save consultation"}</button>
    </fieldset></form>
  </section>;
}
