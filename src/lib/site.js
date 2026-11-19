// Shared public-site links used by the header menu, footer and pages.
export const INSTAGRAM_URL = "https://www.instagram.com/thenframe_/";
export const INSTAGRAM_HANDLE = "@thenframe_";
export const WHATSAPP_DISPLAY = "+60 19-955 0237";
const WHATSAPP_NUMBER = "60199550237";
export const whatsappLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
export const WHATSAPP_URL = whatsappLink(
  "Hi ThenFrame, I would like to ask about wedding photography.",
);
export const SITE_LINKS = [
  ["Home", "#/"],
  ["Portfolio", "#/portfolio"],
  ["Packages", "#/packages"],
  ["Heritage", "#/#heritage"],
  ["Our story", "#/#our-story"],
  ["Track booking", "#/track"],
  ["Contact", "#/contact"],
];

export const EVENT_OPTIONS = [
  "Wedding",
  "Engagement",
  "Pre/post wedding session",
  "Event",
  "Fashion",
  "Casual (just because)",
  "Production (Commercial work, Brand, etc.)",
  "Others",
];
export const HEARD_OPTIONS = [
  "Instagram / Instagram Ads",
  "TikTok",
  "Google search",
  "Friend referral",
  "Facebook",
  "Wedding fair",
  "Others",
];

// Builds the WhatsApp message sent from the contact form.
export function enquiryMessage(form) {
  return [
    "Hi ThenFrame, I would like to make an enquiry.",
    "",
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Email: ${form.email}`,
    `Event type: ${form.eventType}`,
    `Date of event(s): ${form.date}`,
    `Venue: ${form.venue}`,
    `How I heard about you: ${form.heard}`,
    form.message ? `Message: ${form.message}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");
}
