export async function accountAdminRequest(client, action, input = {}) {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) throw new Error("Please sign in again.");
  const result = await client.functions.invoke("account-admin", {
    body: { action, ...input },
    headers: { Authorization: `Bearer ${data.session.access_token}` },
  });
  if (result.error) {
    let payload;
    try {
      payload = await result.error.context?.json();
    } catch {
      /* Fall back to the SDK error. */
    }
    throw new Error(
      payload?.error ||
        result.error.message ||
        "Account service is unavailable.",
    );
  }
  return result.data;
}
