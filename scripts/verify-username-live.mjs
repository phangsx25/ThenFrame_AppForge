// Explicit disposable fixture only. Never log credentials, session tokens or email.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { signInWithUsername, updateUsername } from '../src/lib/username.js';

const inputIndex = process.argv.indexOf('--fixture');
if (inputIndex === -1 || !process.argv[inputIndex + 1]) throw new Error('Provide --fixture with an ignored disposable-fixture JSON file.');
const fixture = JSON.parse(readFileSync(process.argv[inputIndex + 1], 'utf8'));
if (!fixture.username?.startsWith('probe_') || !fixture.email?.endsWith('@example.test')) {
  throw new Error('Use a dedicated probe_ fixture, never a real user account.');
}
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const makeClient = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const client = makeClient();
try {
  await assert.rejects(signInWithUsername(client, fixture.username, 'wrong-fixture-password'), /Invalid username or password/);
  await assert.rejects(signInWithUsername(client, 'unknown_' + Date.now(), 'wrong-fixture-password'), /Invalid username or password/);
  const signedIn = await signInWithUsername(client, fixture.username.toUpperCase(), fixture.password);
  assert.equal(signedIn.data.user.id, fixture.id);
  const own = await client.from('profiles').select('id,role,username').single();
  assert.ifError(own.error);
  assert.equal(own.data.id, fixture.id);
  assert.equal(own.data.role, 'customer');
  const denied = await client.rpc('resolve_username_login', { login_username: fixture.username });
  assert.ok(denied.error, 'Customer must not resolve email addresses');
  const anonymous = makeClient();
  const anonymousDenied = await anonymous.rpc('resolve_username_login', { login_username: fixture.username });
  assert.ok(anonymousDenied.error, 'Anonymous caller must not resolve email addresses');
  const changed = fixture.username + '_new';
  assert.equal(await updateUsername(client, changed.toUpperCase()), changed);
  const metadata = await client.auth.updateUser({ data: { username: 'untrusted_metadata_name', role: 'admin' } });
  assert.ifError(metadata.error);
  const preserved = await client.from('profiles').select('role,username').single();
  assert.ifError(preserved.error);
  assert.equal(preserved.data.role, 'customer');
  assert.equal(preserved.data.username, changed);
  await client.auth.signOut();
  await assert.rejects(signInWithUsername(client, fixture.username, fixture.password), /Invalid username or password/);
  assert.equal((await signInWithUsername(client, changed, fixture.password)).data.user.id, fixture.id);
  // Restore fixture username so the browser can use the same disposable record.
  await updateUsername(client, fixture.username);
  console.log('LIVE PASS: unknown/wrong credentials, case-insensitive username login, own-profile RLS, private email lookup denial, own username update, old/new username behavior, metadata role/username tamper resistance.');
} finally {
  await client.auth.signOut();
}
