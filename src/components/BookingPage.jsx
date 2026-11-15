import { useEffect, useRef, useState } from "react";
import { accountName } from "../lib/account";
import { COLOUR_STYLES, ENQUIRY_EVENTS, SERVICES, listMyEnquiries, submitEnquiry, todayInMalaysia } from "../lib/enquiries";
import { Workspace } from "./Layout";
import { Notice } from "./UI";

export default function BookingPage({ client, auth }) {
  return (
    <Workspace auth={auth} admin={auth.isAdmin} active="Booking"
      onSection={(section) => { window.location.hash = auth.isAdmin ? "/admin" : section === "My albums" ? "/album" : "/dashboard"; }}>
      <div className="dashboard-heading">
        <div><span className="eyebrow">YOUR CELEBRATION / THENFRAME</span><h1>Tell us your plans.</h1>
          <p>Share your event and photography preferences with the studio.</p></div>
      </div>
      {auth.isAdmin ? <Notice>Enquiry submission is for customer accounts. Studio enquiry management will follow in US06.</Notice>
        : <CustomerEnquiries key={auth.session.user.id} client={client} auth={auth} />}
    </Workspace>
  );
}

export function CustomerEnquiries({ client, auth }) {
  const [rows, setRows] = useState([]), [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(""), [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [saved, setSaved] = useState(null);
  const requestId = useRef(null), submitting = useRef(false);
  useEffect(() => {
    let active = true;
    listMyEnquiries(client).then((data) => { if (active) setRows(data); })
      .catch((e) => { if (active) setLoadError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [client, refresh]);

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    requestId.current ||= crypto.randomUUID();
    submitting.current = true;
    setBusy(true); setError(""); setSaved(null);
    try {
      const row = await submitEnquiry(client, values, requestId.current, auth.session.user.id);
      setSaved(row);
      setRows((previous) => [row, ...previous.filter((item) => item.id !== row.id)]);
      requestId.current = null;
      form.reset();
    } catch (e) { setError(e.message); }
    finally { submitting.current = false; setBusy(false); }
  }

  return (
    <div className="enquiry-layout">
      <section className="enquiry-panel" aria-labelledby="enquiry-form-title">
        <h2 id="enquiry-form-title">Service enquiry</h2>
        <p>Submitting an enquiry does not reserve your date or confirm a booking.</p>
        {saved && <div role="status"><Notice>Enquiry saved. Reference: {saved.id}. Status: Pending. Your request has been recorded.</Notice></div>}
        {error && <Notice error>{error}</Notice>}
        <form onSubmit={submit} onChange={() => { requestId.current = null; setSaved(null); }}>
          <fieldset disabled={busy || loading} className="enquiry-fields">
            <div className="enquiry-form-grid">
              <label>Contact name<input name="contact_name" autoComplete="name" required maxLength={120}
                defaultValue={accountName(auth.session.user, auth.profile)} /></label>
              <label>Contact phone<input name="contact_phone" type="tel" autoComplete="tel" required minLength={7} maxLength={30} placeholder="e.g. +60 12 345 6789" /></label>
              <Choice label="Service" name="service" options={SERVICES} />
              <Choice label="Event type" name="event_type" options={ENQUIRY_EVENTS} />
              <label>Preferred event date<input name="event_date" type="date" required min={todayInMalaysia()} /><small>Malaysia time. For a two-day event, enter the first date and include the second date below.</small></label>
              <Choice label="Preferred colour/style" name="colour_style" options={COLOUR_STYLES} />
            </div>
            <label>Additional requirements (optional)<textarea name="additional_requirements" rows={5} maxLength={3000}
              placeholder="Tell us about your venue, a second event date, preferred style or package requirements." /></label>
            <p className="muted small-text">All fields except additional requirements are required. Package options are subject to confirmation with the studio.</p>
            <button className="primary" type="submit">{busy ? "Submitting…" : "Submit enquiry"}</button>
          </fieldset>
        </form>
      </section>
      <section className="enquiry-panel" aria-labelledby="enquiry-history-title">
        <div className="section-heading"><h2 id="enquiry-history-title">Your enquiries</h2>
          <button className="text-button" type="button" disabled={loading} onClick={() => { setLoadError(""); setLoading(true); setRefresh((n) => n + 1); }}>Refresh</button></div>
        {loading ? <p role="status">Loading your enquiries…</p> : loadError ? <Notice error>{loadError}</Notice>
          : rows.length === 0 ? <p>No enquiries yet. Start by telling us about your celebration.</p>
          : rows.map((row) => <article className="enquiry-record" key={row.id}>
            <span className="pill">{row.status === "pending" ? "Pending" : row.status}</span>
            <h3>{row.service}</h3><p>{row.event_type} · {row.event_date}</p>
            <dl><dt>Colour/style</dt><dd>{row.colour_style}</dd><dt>Contact</dt><dd>{row.contact_name} · {row.contact_phone}</dd>
              <dt>Additional requirements</dt><dd className="enquiry-notes">{row.additional_requirements || "None provided."}</dd>
              <dt>Reference</dt><dd className="small-text">{row.id}</dd></dl>
          </article>)}
      </section>
    </div>
  );
}

function Choice({ label, name, options }) {
  return <label>{label}<select name={name} required defaultValue="">
    <option value="" disabled>Choose an option</option>
    {options.map((option) => <option key={option} value={option}>{option}</option>)}
  </select></label>;
}
