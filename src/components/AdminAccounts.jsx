import { useEffect, useState } from "react";
import { Workspace } from "./Layout";
import { Modal, Notice } from "./UI";
import { accountName } from "../lib/account";
import { accountAdminRequest } from "../lib/adminAccounts";
export default function AdminAccounts({ auth, client }) {
  const [users, setUsers] = useState([]),
    [page, setPage] = useState(1),
    [hasMore, setHasMore] = useState(false),
    [query, setQuery] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [setupRequired, setSetupRequired] = useState(false),
    [modal, setModal] = useState(null);
  useEffect(() => {
    let active = true;
    accountAdminRequest(client, "list", { page })
      .then((data) => {
        if (active) {
          setUsers(data.users);
          setHasMore(data.hasMore);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setSetupRequired(Boolean(e.setupRequired));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [client, page]);
  async function refresh() {
    const data = await accountAdminRequest(client, "list", { page });
    setUsers(data.users);
    setHasMore(data.hasMore);
  }
  async function run(action) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (e) {
      setError(e.message);
      setSetupRequired(Boolean(e.setupRequired));
    } finally {
      setBusy(false);
    }
  }
  async function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    await run(async () => {
      const result = await accountAdminRequest(client, modal.action, {
        ...data,
        userId: modal.user?.id,
      });
      setModal(null);
      setMessage(result.message);
      await refresh();
    });
  }
  return (
    <Workspace
      auth={auth}
      admin
      active="Accounts"
      onSection={(section) => {
        window.location.hash =
          section === "Account settings" ? "/account" : "/admin";
      }}
    >
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">STUDIO / ACCOUNT MANAGEMENT</span>
          <h1>Your people, in one place.</h1>
          <p>Manage real customer accounts. Passwords are never visible.</p>
        </div>
        <button
          className="primary"
          disabled={busy || setupRequired}
          onClick={() => setModal({ action: "invite" })}
        >
          Invite customer
        </button>
      </div>
      <Notice error>{error}</Notice>
      <Notice>{message}</Notice>
      {setupRequired && (
        <section className="dashboard-card">
          <h2>Server configuration is required</h2>
          <p>
            The account service needs owner configuration. Customer self-service
            profile/password/email settings remain available.
          </p>
          <a href="#/admin/setup" className="button-outline">
            Admin setup instructions
          </a>
        </section>
      )}
      <section className="dashboard-card">
        <div className="section-heading">
          <h2>Accounts</h2>
          <button
            disabled={busy}
            className="button-outline small"
            onClick={() => run(refresh)}
          >
            Refresh accounts
          </button>
        </div>
        <label>
          Search this page
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or email"
          />
        </label>
        {loading ? (
          <p role="status">Loading accounts…</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name / email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((user) =>
                    `${user.display_name} ${user.email}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>
                          {accountName({
                            email: user.email,
                            user_metadata: { display_name: user.display_name },
                          })}
                        </strong>
                        <span className="account-email">{user.email}</span>
                      </td>
                      <td>
                        <span className="pill">{user.role}</span>
                      </td>
                      <td>
                        {user.disabled
                          ? "Disabled"
                          : user.confirmed
                            ? "Active"
                            : "Email pending"}
                      </td>
                      <td>
                        <div className="account-row-actions">
                          <button
                            disabled={busy}
                            className="text-button"
                            onClick={() => setModal({ action: "name", user })}
                          >
                            Edit name
                          </button>
                          <button
                            disabled={busy}
                            className="text-button"
                            onClick={() =>
                              run(async () => {
                                const result = await accountAdminRequest(
                                  client,
                                  "reset",
                                  { userId: user.id },
                                );
                                setMessage(result.message);
                              })
                            }
                          >
                            Reset email
                          </button>
                          {user.role !== "admin" &&
                            user.id !== auth.session.user.id && (
                              <>
                                <button
                                  disabled={busy}
                                  className="text-button"
                                  onClick={() =>
                                    setModal({
                                      action: user.disabled
                                        ? "enable"
                                        : "disable",
                                      user,
                                    })
                                  }
                                >
                                  {user.disabled ? "Enable" : "Disable"}
                                </button>
                                <button
                                  disabled={busy}
                                  className="text-button danger"
                                  onClick={() =>
                                    setModal({ action: "delete", user })
                                  }
                                >
                                  Delete
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!users.length && !setupRequired && (
              <p>No account records returned.</p>
            )}
          </div>
        )}
        <div className="button-row account-pagination">
          <button
            disabled={busy || page === 1}
            className="button-outline small"
            onClick={() => {
              setLoading(true);
              setPage((n) => n - 1);
            }}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={busy || !hasMore}
            className="button-outline small"
            onClick={() => {
              setLoading(true);
              setPage((n) => n + 1);
            }}
          >
            Next
          </button>
        </div>
      </section>
      <p className="small-text muted">
        Admin roles are assigned by the project owner in Supabase. The
        application does not promote customers or expose passwords. Disabling a
        login does not instantly invalidate existing access tokens.
      </p>
      {modal && (
        <Modal
          title={
            modal.action === "invite"
              ? "Invite a customer"
              : modal.action === "name"
                ? "Edit account name"
                : `${modal.action.charAt(0).toUpperCase() + modal.action.slice(1)} account?`
          }
          onClose={() => {
            if (!busy) setModal(null);
          }}
        >
          <form onSubmit={submit}>
            {["invite", "name"].includes(modal.action) ? (
              <>
                <label>
                  Full name
                  <input
                    name="name"
                    required
                    maxLength={100}
                    defaultValue={modal.user?.display_name || ""}
                  />
                </label>
                {modal.action === "invite" && (
                  <label>
                    Email address
                    <input name="email" type="email" required />
                  </label>
                )}
              </>
            ) : (
              <>
                <p>
                  {modal.action === "delete"
                    ? "This permanently removes this customer’s Auth account. Existing database constraints may block deletion when linked records exist."
                    : "This changes whether this customer can sign in."}
                </p>
                <label>
                  Type {modal.user.email} to confirm
                  <input name="confirmEmail" required autoComplete="off" />
                </label>
              </>
            )}
            <Notice error>{error}</Notice>
            <button disabled={busy} className="primary full">
              {busy
                ? "Working…"
                : modal.action === "invite"
                  ? "Send invitation"
                  : modal.action === "name"
                    ? "Save name"
                    : `Confirm ${modal.action}`}
            </button>
          </form>
        </Modal>
      )}
    </Workspace>
  );
}
