import { describe, expect, it, vi } from "vitest";
import { checkAvailability, malaysiaInput, saveConsultation, timeRange, updateEnquiry } from "../src/lib/bookings";

describe("booking times and management requests", () => {
  it("converts Malaysia wall times to UTC and preserves day boundaries", () => {
    expect(timeRange("2100-01-02T00:00", "2100-01-02T02:00")).toEqual({
      starts_at: "2100-01-01T16:00:00.000Z", ends_at: "2100-01-01T18:00:00.000Z",
    });
    expect(malaysiaInput("2100-01-01T16:00:00Z")).toBe("2100-01-02T00:00");
  });
  it.each([
    ["2100-02-30T10:00", "2100-03-01T10:00"], ["2100-01-01T12:00", "2100-01-01T12:00"],
    ["2100-01-01T13:00", "2100-01-01T12:00"], ["", "2100-01-01T12:00"],
  ])("rejects invalid or reversed time ranges", (start, end) => {
    expect(() => timeRange(start, end)).toThrow();
  });
  it("checks strict overlap and excludes the enquiry being rescheduled", async () => {
    const chain = { select: vi.fn().mockReturnThis(), lt: vi.fn().mockReturnThis(), gt: vi.fn().mockReturnThis(),
      neq: vi.fn().mockResolvedValue({ data: [] }) };
    await expect(checkAvailability({ from: () => chain }, "e1", "2100-01-01T10:00", "2100-01-01T12:00")).resolves.toEqual([]);
    expect(chain.lt).toHaveBeenCalledWith("starts_at", "2100-01-01T04:00:00.000Z");
    expect(chain.gt).toHaveBeenCalledWith("ends_at", "2100-01-01T02:00:00.000Z");
    expect(chain.neq).toHaveBeenCalledWith("enquiry_id", "e1");
  });
  it("never treats an availability error as an empty calendar", async () => {
    const chain = { select: () => chain, lt: () => chain, gt: () => chain,
      neq: vi.fn().mockResolvedValue({ error: { message: "Calendar unavailable" } }) };
    await expect(checkAvailability({ from: () => chain }, "e1", "2100-01-01T10:00", "2100-01-01T12:00")).rejects.toThrow("Calendar unavailable");
  });
  it("passes the review version and times to an atomic confirmation request", async () => {
    const rpc = vi.fn().mockReturnValue({ single: async () => ({ data: { id: "e1", status: "confirmed" } }) });
    await updateEnquiry({ rpc }, { id: "e1", review_version: 2 }, "confirmed", "2100-01-01T10:00", "2100-01-01T12:00");
    expect(rpc).toHaveBeenCalledWith("admin_update_enquiry", {
      p_id: "e1", p_expected_version: 2, p_status: "confirmed",
      p_starts_at: "2100-01-01T02:00:00.000Z", p_ends_at: "2100-01-01T04:00:00.000Z",
    });
  });
  it.each([["23P01", /overlaps/], ["40001", /changed/], ["42501", /admin access/]])("explains server rejection %s", async (code, message) => {
      const client = { rpc: () => ({ single: async () => ({ error: { code } }) }) };
      await expect(updateEnquiry(client, { id: "e1", review_version: 0 }, "under_review")).rejects.toThrow(message);
    });
  it("requires a valid online link or offline location before calling the server", async () => {
    const client = { rpc: vi.fn() };
    const values = { start: "2100-01-01T10:00", end: "2100-01-01T11:00", status: "scheduled" };
    await expect(saveConsultation(client, "e1", null, { ...values, mode: "online", meeting_link: "javascript:alert(1)" })).rejects.toThrow(/HTTPS/);
    await expect(saveConsultation(client, "e1", null, { ...values, mode: "offline", location: " " })).rejects.toThrow(/location/);
    expect(client.rpc).not.toHaveBeenCalled();
  });
  it("sends only the meeting details for the selected mode and preserves consultation version", async () => {
    const rpc = vi.fn().mockReturnValue({ single: async () => ({ data: { enquiry_id: "e1", version: 3 } }) });
    await saveConsultation({ rpc }, "e1", { version: 2 }, { start: "2100-01-01T10:00", end: "2100-01-01T11:00", mode: "offline", status: "scheduled", location: " Test studio ", meeting_link: "https://ignored.example" });
    expect(rpc.mock.calls[0][1]).toMatchObject({ p_expected_version: 2, p_location: "Test studio", p_meeting_link: null });
  });
});
