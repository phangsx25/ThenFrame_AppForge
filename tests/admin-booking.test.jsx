import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AdminBookingPage from "../src/components/AdminBookingPage";
import { checkAvailability, listBookingManagement, saveConsultation, updateEnquiry } from "../src/lib/bookings";
vi.mock("../src/lib/bookings", async (original) => ({ ...await original(),
  listBookingManagement: vi.fn(), checkAvailability: vi.fn(), updateEnquiry: vi.fn(), saveConsultation: vi.fn(),
}));
const auth = { isAdmin: true, session: { user: { id: "admin" } }, profile: { display_name: "Test admin" }, logout: vi.fn() };
const enquiry = { id: "e1", reference: "TF-ENQ-000001", contact_name: "Test customer", contact_phone: "+60181234567",
  service: "Photography", event_type: "Reception", colour_style: "Moody / Dark", event_date: "2100-01-01",
  additional_requirements: "A garden ceremony", status: "pending", review_version: 0 };
async function open() {
  listBookingManagement.mockResolvedValue({ enquiries: [enquiry], reservations: [], consultations: [] });
  render(<AdminBookingPage client={{}} auth={auth} />);
  fireEvent.click(await screen.findByRole("button", { name: /TF-ENQ-000001/ }));
}
describe("admin booking page (mocked transport)", () => {
  it("reloads a successful confirmation and displays the reserved event time", async () => {
    await open();
    const confirmed = { ...enquiry, status: "confirmed", review_version: 1 };
    updateEnquiry.mockImplementation(async () => {
      listBookingManagement.mockResolvedValue({ enquiries: [confirmed], consultations: [], reservations: [
        { enquiry_id: "e1", starts_at: "2100-01-01T02:00:00Z", ends_at: "2100-01-01T04:00:00Z" },
      ] });
      return confirmed;
    });
    fireEvent.change(screen.getByLabelText("Enquiry status"), { target: { value: "confirmed" } });
    fireEvent.change(screen.getByLabelText("Event start"), { target: { value: "2100-01-01T10:00" } });
    fireEvent.change(screen.getByLabelText("Event end"), { target: { value: "2100-01-01T12:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm booking / save times" }));
    await screen.findByText("TF-ENQ-000001: booking confirmed.");
    await screen.findByText("2100-01-01 10:00 → 2100-01-01 12:00");
    expect(screen.getByLabelText("Enquiry status")).toHaveValue("confirmed");
  });
  it("shows the saved enquiry details and reports a conflicting confirmation without success", async () => {
    await open();
    expect(screen.getByText("A garden ceremony")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Enquiry status"), { target: { value: "confirmed" } });
    fireEvent.change(screen.getByLabelText("Event start"), { target: { value: "2100-01-01T10:00" } });
    fireEvent.change(screen.getByLabelText("Event end"), { target: { value: "2100-01-01T12:00" } });
    checkAvailability.mockResolvedValue([{ enquiry_id: "other" }]);
    fireEvent.click(screen.getByRole("button", { name: "Check availability" }));
    await screen.findByText(/This time overlaps a confirmed booking/);
    updateEnquiry.mockRejectedValue(new Error("This time overlaps another confirmed booking."));
    fireEvent.click(screen.getByRole("button", { name: "Confirm booking / save times" }));
    expect(await screen.findByText("This time overlaps another confirmed booking.")).toBeInTheDocument();
    expect(screen.queryByText(/booking confirmed\./)).not.toBeInTheDocument();
  });
  it("saves and reschedules an offline consultation with the latest version", async () => {
    await open();
    saveConsultation.mockImplementation(async (_client, id, existing) => ({ enquiry_id: id, version: (existing?.version || 0) + 1,
      starts_at: "2100-01-01T02:00:00Z", ends_at: "2100-01-01T03:00:00Z", mode: "offline", location: "Test studio", status: "scheduled" }));
    fireEvent.change(screen.getByLabelText("Consultation start"), { target: { value: "2100-01-01T10:00" } });
    fireEvent.change(screen.getByLabelText("Consultation end"), { target: { value: "2100-01-01T11:00" } });
    fireEvent.change(screen.getByLabelText("Mode"), { target: { value: "offline" } });
    fireEvent.change(screen.getByLabelText("Meeting location"), { target: { value: "Test studio" } });
    fireEvent.click(screen.getByRole("button", { name: "Save consultation" }));
    await screen.findByText(/Consultation saved/);
    expect(saveConsultation.mock.calls.at(-1)[2]).toBeUndefined();
    fireEvent.change(screen.getByLabelText("Consultation end"), { target: { value: "2100-01-01T12:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Save consultation" }));
    await screen.findByText(/Consultation saved/);
    expect(saveConsultation.mock.calls.at(-1)[2].version).toBe(1);
  });
});
