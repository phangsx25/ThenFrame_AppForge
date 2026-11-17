import { normalizeContactPhone } from "./phone";

export const SERVICES = ["Photography", "Videography", "Combo Photo & Video"];
export const ENQUIRY_EVENTS = [
  "Akad & Reception (1 Day)", "Akad", "Reception",
  "Akad & Reception (2 Days)", "Pre/Post Wedding", "Engagement", "Others",
];
export const COLOUR_STYLES = ["Colourful / Bright", "Moody / Dark", "Others"];

export function todayInMalaysia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

export function enquiryValues(input, today = todayInMalaysia()) {
  const text = (key, max, required = true) => {
    const value = String(input[key] || "").trim();
    if ((required && !value) || value.length > max)
      throw new Error(`Check ${key.replaceAll("_", " ")}: ${required ? "required, " : ""}maximum ${max} characters.`);
    return value;
  };
  const service = text("service", 40), event_type = text("event_type", 60);
  const colour_style = text("colour_style", 40), event_date = text("event_date", 10);
  const parsed = new Date(`${event_date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event_date) || Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== event_date || event_date < today)
    throw new Error("Choose a valid event date today or later (Malaysia time).");
  if (!SERVICES.includes(service) || !ENQUIRY_EVENTS.includes(event_type) || !COLOUR_STYLES.includes(colour_style))
    throw new Error("Choose a valid service, event type and colour/style.");
  const contact_phone = normalizeContactPhone(text("contact_phone", 30));
  return {
    service, event_type, event_date, colour_style,
    contact_name: text("contact_name", 120), contact_phone,
    additional_requirements: text("additional_requirements", 3000, false),
  };
}

export async function submitEnquiry(client, input, requestId, customerId) {
  const values = enquiryValues(input);
  const result = await client.from("booking_enquiries")
    .insert({ ...values, id: requestId, customer_id: customerId }).select().single();
  if (!result.error) return savedEnquiry(result.data);
  // A retry can follow a successful save whose response was lost. RLS still
  // scopes this lookup to the current customer; other errors are never success.
  if (result.error.code === "23505") {
    const existing = await client.from("booking_enquiries").select("*")
      .eq("id", requestId).eq("customer_id", customerId).single();
    if (!existing.error && Object.entries(values).every(([key, value]) =>
      key === "contact_phone" ? normalizeContactPhone(existing.data[key]) === value : existing.data[key] === value))
      return savedEnquiry(existing.data);
  }
  throw new Error("We could not confirm your enquiry. Your entries are kept; retry without changing them to avoid a duplicate.");
}

function savedEnquiry(row) {
  if (!/^TF-ENQ-\d{6,}$/.test(row?.reference || ""))
    throw new Error("Your enquiry reference could not be confirmed. Please retry without changing your entries.");
  return row;
}

export async function listMyEnquiries(client) {
  const { data, error } = await client.from("booking_enquiries")
    .select("*").order("created_at", { ascending: false });
  if (error) throw new Error("Your enquiries could not be loaded. Please try again.");
  return data;
}
