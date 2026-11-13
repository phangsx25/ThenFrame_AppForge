const genericNames = new Set(["customer", "admin", "user", "studio member"]);
const cleanName = (value) => (typeof value === "string" ? value.trim() : "");
export function accountName(user, profile) {
  for (const value of [
    user?.user_metadata?.display_name,
    user?.user_metadata?.full_name,
    user?.user_metadata?.name,
    profile?.display_name,
  ]) {
    const name = cleanName(value);
    if (name && !genericNames.has(name.toLowerCase())) return name;
  }
  return user?.email?.split("@")[0] || "Your account";
}
export function validateName(value) {
  const name = cleanName(value);
  if (!name || name.length > 100)
    throw new Error("Enter your name using 1–100 characters.");
  return name;
}
export async function updateAccountName(client, value) {
  const display_name = validateName(value);
  // Auth metadata holds editable names. Authorization still comes only from profiles.role.
  const { data, error } = await client.auth.updateUser({
    data: { display_name },
  });
  if (error) throw error;
  return data.user;
}
export function validatePassword(password, confirmation) {
  if (password !== confirmation)
    throw new Error("Your passwords do not match.");
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    !/[A-Za-z]/.test(password) ||
    !/[0-9]/.test(password)
  )
    throw new Error(
      "Use at least 8 characters, including a letter and a number.",
    );
  return password;
}
export async function changeAccountPassword(
  client,
  { currentPassword, password, confirmation, nonce },
) {
  validatePassword(password, confirmation);
  if (!currentPassword) throw new Error("Enter your current password.");
  if (currentPassword === password)
    throw new Error("Choose a different password.");
  const input = { password, current_password: currentPassword };
  if (nonce?.trim()) input.nonce = nonce.trim();
  const { error } = await client.auth.updateUser(input);
  if (error) throw error;
}
export async function changeAccountEmail(client, email, origin) {
  const value = String(email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    throw new Error("Enter a valid email address.");
  const { error } = await client.auth.updateUser(
    { email: value },
    { emailRedirectTo: origin + "/?auth=confirmed" },
  );
  if (error) throw error;
}
