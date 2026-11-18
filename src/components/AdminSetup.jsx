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
          There is no shared or hidden admin password, and the website has no
          sign-up page. Each studio admin has their own account, created by the
          project owner.
        </p>
        <ol className="setup-steps">
          <li>
            <h2>The owner creates your account</h2>
            <p>
              In the Supabase dashboard, the project owner adds a user with your
              email address and gives you your username.
            </p>
          </li>
          <li>
            <h2>The owner assigns Admin</h2>
            <p>
              The owner matches your Auth user ID to its profiles row and
              assigns role admin. Use only an explicitly authorized account.
              The application never promotes users automatically.
            </p>
          </li>
          <li>
            <h2>Sign in to the studio</h2>
            <p>
              Use your username and password on the studio login. To set or
              change your password,{" "}
              <a href="#/reset">request a reset email</a>.
            </p>
          </li>
        </ol>
        <Notice>
          Only the owner can create studio accounts. Opening the studio login
          never grants admin access.
        </Notice>
      </main>
      <Footer />
    </>
  );
}
