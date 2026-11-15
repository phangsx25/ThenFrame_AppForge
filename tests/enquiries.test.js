import { describe, expect, it, vi } from "vitest";
import { enquiryValues, submitEnquiry } from "../src/lib/enquiries";

const input = { contact_name: " Test customer ", contact_phone: "+60 12 345 6789", service: "Photography",
  event_type: "Reception", event_date: "2100-12-01", colour_style: "Moody / Dark", additional_requirements: " Venue details " };
describe("enquiry validation and retry handling", () => {
  it("whitelists customer fields and trims text without accepting ownership or status", () => {
    const result = enquiryValues({ ...input, status: "confirmed", customer_id: "other" });
    expect(result.contact_name).toBe("Test customer");
    expect(result.additional_requirements).toBe("Venue details");
    expect(result).not.toHaveProperty("status");
    expect(result).not.toHaveProperty("customer_id");
  });
  it.each([
    { event_date: "2026-02-30" }, { event_date: "2000-01-01" },
    { service: "unsupported" }, { event_type: "unsupported" }, { colour_style: "unsupported" },
    { contact_phone: "call me" }, { contact_name: " " }, { additional_requirements: "x".repeat(3001) },
  ])("rejects invalid fields before storage: %j", (change) => {
    expect(() => enquiryValues({ ...input, ...change })).toThrow();
  });
  it("recovers the same saved enquiry after a lost response and duplicate retry", async () => {
    const row = { ...enquiryValues(input), id: "request-id", customer_id: "customer-id" };
    const chain = { insert: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ error: { code: "23505" } }).mockResolvedValueOnce({ data: row }) };
    const client = { from: vi.fn(() => chain) };
    await expect(submitEnquiry(client, input, "request-id", "customer-id")).resolves.toEqual(row);
    expect(chain.insert).toHaveBeenCalledTimes(1);
    expect(chain.eq).toHaveBeenCalledWith("customer_id", "customer-id");
  });
  it("does not treat a duplicate reference with different details as success", async () => {
    const chain = { insert: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ error: { code: "23505" } })
        .mockResolvedValueOnce({ data: { ...enquiryValues(input), service: "Videography" } }) };
    await expect(submitEnquiry({ from: () => chain }, input, "request-id", "customer-id")).rejects.toThrow(/could not confirm/);
  });
});
