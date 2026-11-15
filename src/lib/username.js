export function validateUsername(value) {
  const username = String(value || "").trim().toLowerCase();
  if (!/^[a-z][a-z0-9_]{2,39}$/.test(username)) {
    throw new Error("Use 3–40 characters: start with a letter, then letters, numbers or underscores.");
  }
  return username;
}

export async function signInWithUsername(client, value, password) {
  const username = validateUsername(value);
  const { data, error } = await client.functions.invoke("username-login", {
    body: { username, password },
  });
  if (error) {
    let message = "Sign-in is unavailable. Please try again or use email login.";
    if (error.context?.status === 401) message = "Invalid username or password.";
    if (error.context?.status === 429) message = "Too many sign-in attempts. Try again in 15 minutes.";
    throw new Error(message);
  }
  if (!data?.session?.access_token || !data.session.refresh_token) {
    throw new Error("Sign-in could not be completed. Please try again.");
  }
  // Supabase verifies and persists the normal user session; no elevated key is
  // ever returned to the browser.
  const result = await client.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
  if (result.error) throw result.error;
  return result;
}

export async function updateUsername(client, value) {
  const username = validateUsername(value);
  const { data, error } = await client.rpc("set_my_username", { new_username: username });
  if (error) throw error;
  return data;
}
