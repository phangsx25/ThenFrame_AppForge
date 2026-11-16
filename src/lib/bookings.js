export const ENQUIRY_STATUSES = {
  pending: "Pending", under_review: "Under review", confirmed: "Confirmed", rejected: "Rejected",
};
const clock = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
export function malaysiaInput(value) {
  if (!value) return "";
  const parts = Object.fromEntries(clock.formatToParts(new Date(value)).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
export function malaysiaTime(value) {
  return value ? malaysiaInput(value).replace("T", " ") : "Not scheduled";
}
export function timeRange(start, end) {
  function parse(value) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value || "")) throw new Error("Enter valid start and end times.");
    const date = new Date(`${value}:00+08:00`);
    if (!Number.isFinite(date.getTime()) || malaysiaInput(date) !== value) throw new Error("Enter valid start and end times.");
    return date.toISOString();
  }
  const starts_at = parse(start), ends_at = parse(end);
  if (ends_at <= starts_at) throw new Error("End time must be after start time.");
  return { starts_at, ends_at };
}
function check(result) {
  if (result.error) {
    if (result.error.code === "23P01") throw new Error("This time overlaps another confirmed booking. Choose a different time.");
    if (result.error.code === "40001") throw new Error("This record changed. Refresh before saving again.");
    if (result.error.code === "42501") throw new Error("Studio admin access is required.");
    throw new Error(result.error.message || "The booking operation failed. Please retry.");
  }
  return result.data;
}
export async function listBookingManagement(client) {
  const [enquiries, reservations, consultations] = await Promise.all([
    client.from("booking_enquiries").select("*").order("created_at", { ascending: false }),
    client.from("booking_reservations").select("*").order("starts_at"),
    client.from("booking_consultations").select("*").order("starts_at"),
  ]);
  return { enquiries: check(enquiries), reservations: check(reservations), consultations: check(consultations) };
}
export async function checkAvailability(client, id, start, end) {
  const range = timeRange(start, end);
  if (Date.parse(range.starts_at) <= Date.now()) throw new Error("Choose a future event time.");
  return check(await client.from("booking_reservations").select("enquiry_id,starts_at,ends_at")
    .lt("starts_at", range.ends_at).gt("ends_at", range.starts_at).neq("enquiry_id", id));
}
export async function updateEnquiry(client, enquiry, status, start, end) {
  if (!Object.hasOwn(ENQUIRY_STATUSES, status)) throw new Error("Choose a valid enquiry status.");
  const range = status === "confirmed" ? timeRange(start, end) : {};
  return check(await client.rpc("admin_update_enquiry", {
    p_id: enquiry.id, p_expected_version: enquiry.review_version, p_status: status,
    p_starts_at: range.starts_at || null, p_ends_at: range.ends_at || null,
  }).single());
}
export async function saveConsultation(client, enquiryId, existing, input) {
  const range = timeRange(input.start, input.end);
  if (!["online", "offline"].includes(input.mode) || !["scheduled", "completed", "cancelled"].includes(input.status))
    throw new Error("Choose a valid consultation mode and status.");
  const link = String(input.meeting_link || "").trim(), location = String(input.location || "").trim();
  if (input.mode === "online") {
    let valid = false;
    try { valid = new URL(link).protocol === "https:" && link.length <= 2048; } catch { /* Invalid URL. */ }
    if (!valid) throw new Error("Enter a valid HTTPS meeting link.");
  } else if (!location || location.length > 300) throw new Error("Enter an offline meeting location, up to 300 characters.");
  return check(await client.rpc("admin_save_consultation", {
    p_id: enquiryId, p_expected_version: existing?.version || 0,
    p_starts_at: range.starts_at, p_ends_at: range.ends_at,
    p_mode: input.mode, p_status: input.status,
    p_meeting_link: input.mode === "online" ? link : null,
    p_location: input.mode === "offline" ? location : null,
  }).single());
}
