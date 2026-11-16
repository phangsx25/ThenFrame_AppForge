import { parsePhoneNumberFromString } from "libphonenumber-js/min";

export function normalizeContactPhone(value) {
  const raw = String(value || "").trim();
  if (!raw || raw.length > 30 || !/^\+?[\d\s().-]+$/.test(raw))
    throw new Error("Enter a valid phone number, for example 0181234567.");
  let compact = raw.replace(/[\s().-]/g, "");
  // Accept a Malaysian mobile number without its leading national zero.
  if (/^1\d{8,9}$/.test(compact)) compact = `0${compact}`;
  if (/^60\d{8,11}$/.test(compact)) compact = `+${compact}`;
  const phone = parsePhoneNumberFromString(compact, "MY");
  if (!phone?.isValid())
    throw new Error("Check your phone number. You can enter it without spaces, for example 0181234567.");
  return phone.number;
}

export function displayContactPhone(value) {
  try {
    const phone = parsePhoneNumberFromString(normalizeContactPhone(value));
    return phone.countryCallingCode === "60" ? `0${phone.nationalNumber}` : phone.number;
  } catch {
    // A legacy number must not prevent the customer from viewing their history.
    return String(value || "");
  }
}
