import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CustomerEnquiries } from "../src/components/BookingPage";
import { listMyEnquiries, submitEnquiry } from "../src/lib/enquiries";
vi.mock("../src/lib/enquiries", async (original) => ({
  ...await original(), listMyEnquiries: vi.fn(), submitEnquiry: vi.fn(),
}));
const auth = { session: { user: { id: "customer-id", user_metadata: { display_name: "Test customer" } } }, profile: { display_name: "Test customer" } };
describe("customer enquiry form (mocked transport)", () => {
  it("keeps entered details on failure, retries the same request and shows saved history", async () => {
    listMyEnquiries.mockResolvedValue([]);
    submitEnquiry.mockRejectedValueOnce(new Error("Network error; retry."))
      .mockImplementationOnce(async (_client, values, id) => ({ ...values, id, status: "pending" }));
    render(<CustomerEnquiries client={{}} auth={auth} />);
    await screen.findByText(/No enquiries yet/);
    fireEvent.change(screen.getByLabelText("Contact phone"), { target: { value: "+60 12 345 6789" } });
    for (const [name, value] of [["Service", "Photography"], ["Event type", "Reception"], ["Preferred colour/style", "Moody / Dark"]])
      fireEvent.change(screen.getByLabelText(name), { target: { value } });
    fireEvent.change(screen.getByLabelText(/Preferred event date/), { target: { value: "2100-12-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit enquiry" }));
    await screen.findByRole("alert");
    expect(screen.getByLabelText("Contact phone")).toHaveValue("+60 12 345 6789");
    expect(screen.queryByText(/Enquiry saved/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Submit enquiry" }));
    await screen.findByText(/Enquiry saved/);
    expect(submitEnquiry.mock.calls[0][2]).toBe(submitEnquiry.mock.calls[1][2]);
    expect(screen.getByText("Pending", { selector: ".pill" })).toBeInTheDocument();
    expect(screen.getByLabelText("Contact phone")).toHaveValue("");
  });
  it("shows a history error without claiming that no enquiries exist", async () => {
    listMyEnquiries.mockRejectedValueOnce(new Error("History unavailable"));
    render(<CustomerEnquiries client={{}} auth={auth} />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("History unavailable"));
    expect(screen.queryByText(/No enquiries yet/)).not.toBeInTheDocument();
  });
});
