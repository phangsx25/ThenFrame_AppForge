import { describe, it, expect, vi } from "vitest";
import {
  accountName,
  updateAccountName,
  changeAccountPassword,
  changeAccountEmail,
} from "../src/lib/account";
describe("account identity and self-service requests", () => {
  it("uses the registered name instead of a generic Customer profile value", () => {
    expect(
      accountName(
        {
          email: "sx@example.test",
          user_metadata: { display_name: "Souh Xin" },
        },
        { display_name: "Customer" },
      ),
    ).toBe("Souh Xin");
    expect(
      accountName({ email: "sx@example.test" }, { display_name: "Customer" }),
    ).toBe("sx");
  });
  it("updates only editable name metadata and never sends a role", async () => {
    const client = {
      auth: {
        updateUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "u1" } }, error: null }),
      },
    };
    await updateAccountName(client, " Souh Xin ");
    expect(client.auth.updateUser).toHaveBeenCalledWith({
      data: { display_name: "Souh Xin" },
    });
    await expect(updateAccountName(client, " ")).rejects.toThrow(/name/);
    expect(client.auth.updateUser).toHaveBeenCalledTimes(1);
  });
  it("requires matching strong new passwords and passes current password to Supabase", async () => {
    const client = {
      auth: { updateUser: vi.fn().mockResolvedValue({ error: null }) },
    };
    await expect(
      changeAccountPassword(client, {
        currentPassword: "oldPassword123",
        password: "newPassword123",
        confirmation: "different123",
      }),
    ).rejects.toThrow(/match/);
    expect(client.auth.updateUser).not.toHaveBeenCalled();
    await changeAccountPassword(client, {
      currentPassword: "oldPassword123",
      password: "newPassword123",
      confirmation: "newPassword123",
      nonce: " 123456 ",
    });
    expect(client.auth.updateUser).toHaveBeenCalledWith({
      current_password: "oldPassword123",
      password: "newPassword123",
      nonce: "123456",
    });
  });
  it("does not claim a password change succeeded when Supabase rejects it", async () => {
    const client = {
      auth: {
        updateUser: vi.fn().mockResolvedValue({
          error: new Error("Current password is incorrect"),
        }),
      },
    };
    await expect(
      changeAccountPassword(client, {
        currentPassword: "wrongPassword123",
        password: "newPassword123",
        confirmation: "newPassword123",
      }),
    ).rejects.toThrow(/incorrect/);
  });
  it("requests an email change with a token-safe confirmation callback", async () => {
    const client = {
      auth: { updateUser: vi.fn().mockResolvedValue({ error: null }) },
    };
    await changeAccountEmail(
      client,
      " new@example.test ",
      "https://thenframe.example",
    );
    expect(client.auth.updateUser).toHaveBeenCalledWith(
      { email: "new@example.test" },
      { emailRedirectTo: "https://thenframe.example/?auth=confirmed" },
    );
  });
});
