import { useState } from "react";
import { Footer, Icon, PhotoSlot } from "./UI";
import { Header } from "./Layout";
import {
  EVENT_OPTIONS,
  HEARD_OPTIONS,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
  enquiryMessage,
  whatsappLink,
} from "../lib/site";

// Client photograph still pending. Set to an image URL to replace the banner.
const CONTACT_BANNER_IMAGE = null;

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  eventType: "",
  date: "",
  venue: "",
  heard: "",
  message: "",
};

function TextField({ label, name, form, onChange, type = "text", placeholder, required = true }) {
  return (
    <label className="tf-field">
      <span>
        {label}
        {required && " *"}
      </span>
      <input
        name={name}
        type={type}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

// Enquiry form: collects the details first, then hands them to WhatsApp as a
// ready-to-send message. Nothing is stored on the server.
export function ContactPage({ auth }) {
  const [form, setForm] = useState(EMPTY);
  const [sentUrl, setSentUrl] = useState("");
  const change = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  function submit(event) {
    event.preventDefault();
    const url = whatsappLink(enquiryMessage(form));
    setSentUrl(url);
    window.open(url, "_blank", "noopener");
  }
  return (
    <>
      <Header auth={auth} overlay />
      <main id="main-content" className="tf-contact">
        <section className="tf-contact-banner">
          <PhotoSlot
            image={CONTACT_BANNER_IMAGE}
            label="[Contact banner photograph]"
            tone={2}
          />
          <h1>Let’s start your journey</h1>
        </section>
        <section className="tf-contact-intro page-width">
          <p>
            <em>“We’re ready to book. What’s next?”</em> Wonderful! We are
            delighted you are thinking of ThenFrame for your celebration. Share
            a few details below and your enquiry will open in WhatsApp, ready
            to send to the studio. We usually reply within a day.
          </p>
        </section>
        <section className="tf-contact-form-wrap">
          <form className="tf-contact-form" onSubmit={submit}>
            <TextField
              label="Your name"
              name="name"
              form={form}
              onChange={change}
              placeholder="Your first and last name"
            />
            <TextField
              label="Phone number"
              name="phone"
              type="tel"
              form={form}
              onChange={change}
              placeholder="e.g. 012-345 6789"
            />
            <TextField
              label="Email address"
              name="email"
              type="email"
              form={form}
              onChange={change}
              placeholder="you@example.com"
            />
            <fieldset className="tf-field tf-radios">
              <legend>What type of event are you hosting? *</legend>
              {EVENT_OPTIONS.map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="eventType"
                    value={option}
                    checked={form.eventType === option}
                    onChange={change}
                    required
                  />
                  {option}
                </label>
              ))}
            </fieldset>
            <TextField
              label="Date of event(s)"
              name="date"
              form={form}
              onChange={change}
              placeholder="You can list more than one date"
            />
            <TextField
              label="Venue of the event(s)"
              name="venue"
              form={form}
              onChange={change}
              placeholder="Can be anywhere!"
            />
            <label className="tf-field">
              <span>How did you hear about us? *</span>
              <select name="heard" value={form.heard} onChange={change} required>
                <option value="" disabled>
                  Select option
                </option>
                {HEARD_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="tf-field">
              <span>Message</span>
              <textarea
                name="message"
                rows={4}
                value={form.message}
                onChange={change}
                placeholder="Drop us a message here"
              />
            </label>
            <div className="tf-form-actions">
              <button className="tf-pill" type="submit">
                Send via WhatsApp
              </button>
            </div>
            {sentUrl && (
              <p className="tf-form-status" role="status">
                Thank you, {form.name.split(" ")[0] || "friend"}! WhatsApp has
                opened with your enquiry. Just press send. If it did not open,{" "}
                <a href={sentUrl} target="_blank" rel="noreferrer">
                  tap here
                </a>
                .
              </p>
            )}
          </form>
        </section>
        <section className="tf-contact-direct page-width">
          <p>
            Prefer to chat straight away? Message the studio directly on
            WhatsApp at {WHATSAPP_DISPLAY}.
          </p>
          <a
            className="tf-pill tf-pill-outline"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="whatsapp" size={18} />
            WhatsApp us directly
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
