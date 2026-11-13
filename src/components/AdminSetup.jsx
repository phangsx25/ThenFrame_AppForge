import { Footer, Notice, Wordmark } from "./UI";
export default function AdminSetup() {
  return (
    <>
      <header className="auth-header">
        <Wordmark />
        <a href="#/admin/login">← Admin login</a>
      </header>
      <main id="main-content" className="page-width admin-setup">
        <span className="eyebrow">STUDIO OWNER / FIRST ACCOUNT</span>
        <h1>Set up your studio access.</h1>
        <p>
          There is no shared or hidden admin password. An admin uses their own
          Supabase email/password account, with an admin role assigned by the
          project owner.
        </p>
        <ol className="setup-steps">
          <li>
            <h2>Create your account</h2>
            <p>
              <a href="#/register">Register with your own email and name</a>,
              confirm the email if required, and keep your password private.
            </p>
          </li>
          <li>
            <h2>Ask the project owner to assign Admin</h2>
            <p>
              In the existing Supabase project, the owner matches your Auth user
              ID to its profiles row and assigns role admin. Use only an
              explicitly authorized account. The application never promotes
              users automatically.
            </p>
          </li>
          <li>
            <h2>Sign in to the studio</h2>
            <p>
              Choose Admin on the login screen and use that same email and
              password. If you do not know the password,{" "}
              <a href="#/reset">request a reset email</a>.
            </p>
          </li>
        </ol>
        <Notice>
          The owner must explicitly designate the first admin account. Selecting
          Admin on the login page never grants that role.
        </Notice>
        <section className="dashboard-card">
          <h2>Secure account administration</h2>
          <p>
            Account management runs in the Supabase account-admin Edge Function.
            It verifies your sign-in and database admin role on every request.
            Server credentials remain in Supabase; they are never sent to the
            browser.
          </p>
          <p>
            The owner must allow the deployed site’s account-confirmation
            callback URLs in Supabase Auth.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
