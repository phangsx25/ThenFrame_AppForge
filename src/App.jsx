import { useCallback, useEffect, useState } from "react";
import { initialAuthCallback, supabase } from "./lib/supabase";
import { readAuthCallback } from "./lib/authCallback";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./components/AuthPage";
import PasswordPage from "./components/PasswordPage";
import AccountSettings from "./components/AccountSettings";
import AdminSetup from "./components/AdminSetup";
import AdminDashboard from "./components/AdminDashboard";
import { Home, PackagesPage, PortfolioPage } from "./components/PublicPages";
import { ContactPage } from "./components/ContactPage";
import { Header, Workspace } from "./components/Layout";
import { LaterCard, Notice } from "./components/UI";
import "./App.css";

// Public placeholder for features planned after the current sprint.
function ComingSoon({ auth, eyebrow, action, children }) {
  return (
    <>
      <Header auth={auth} />
      <main id="main-content" className="page-width route-message">
        <span className="eyebrow">{eyebrow}</span>
        <h1>Coming soon.</h1>
        <p>{children}</p>
        <a className="primary" href={action[0]}>
          {action[1]}
        </a>
      </main>
    </>
  );
}
function routeFromHash() {
  const hash = window.location.hash;
  const callback = readAuthCallback(window.location);
  if (callback.route) return callback.route;
  return (hash.slice(1) || "/").split("#")[0];
}
export default function App({ client = supabase }) {
  const [callback, setCallback] = useState(() => {
    const current = readAuthCallback(window.location);
    return current.route ? current : client === supabase ? initialAuthCallback : current;
  });
  const [route, setRoute] = useState(() => callback.route || routeFromHash());
  const handlePasswordRecovery = useCallback(() => {
    // This event fires after the SDK has consumed the tokens. Persist a clean
    // route so refreshes and Site URL fallbacks still show the password form.
    const url = new URL(window.location.href);
    url.searchParams.set("auth", "password");
    url.hash = "/password";
    window.history.replaceState(window.history.state, "", url);
    setCallback({ route: "/password", error: "" });
    setRoute("/password");
  }, []);
  const auth = useAuth(client, handlePasswordRecovery);
  useEffect(() => {
    function change() {
      setRoute(routeFromHash());
      const target = window.location.hash.split("#")[2];
      requestAnimationFrame(() => {
        if (target) document.getElementById(target)?.scrollIntoView();
        else window.scrollTo(0, 0);
      });
    }
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    const target = window.location.hash.split("#")[2];
    if (target) document.getElementById(target)?.scrollIntoView();
  }, [route]);
  let page;
  if (
    ["/admin", "/account", "/heritage", "/booking"].includes(route)
  ) {
    if (!client)
      page = (
        <main className="page-width route-message">
          <h1>A little connection is needed.</h1>
          <Notice error>
            Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the
            environment, then restart or rebuild the app.
          </Notice>
          <a href="#/">Return home</a>
        </main>
      );
    else if (auth.loading)
      page = (
        <main className="page-width route-message" role="status">
          Checking your account…
        </main>
      );
    else if (!auth.session)
      page = (
        <main className="page-width route-message">
          <h1>Your space, securely kept.</h1>
          <p>Please log in to continue.</p>
          <a className="primary" href="#/admin/login">
            Go to login
          </a>
        </main>
      );
    else if (auth.error || !auth.profile)
      page = (
        <main className="page-width route-message">
          <h1>We couldn’t verify your profile.</h1>
          <Notice error>
            {auth.error || "Contact the studio owner for help."}
          </Notice>
          <a href="#/admin/login">Return to login</a>
          <button
            className="button-outline"
            onClick={() => void auth.logout().catch(() => {})}
          >
            Sign out
          </button>
        </main>
      );
    else if (!auth.isAdmin)
      page = (
        <main className="page-width route-message">
          <h1>Studio access only.</h1>
          <p>
            This website does not have customer accounts. Browse the portfolio
            or send a booking enquiry without logging in.
          </p>
          <button
            className="primary"
            onClick={() =>
              void auth
                .logout()
                .then(() => {
                  window.location.hash = "/";
                })
                .catch(() => {})
            }
          >
            Sign out
          </button>
        </main>
      );
    else
      page =
        ["/heritage", "/booking"].includes(route) ? (
          <Workspace
            auth={auth}
            admin
            active={route === "/heritage" ? "Heritage" : "Booking"}
            onSection={() => {
              window.location.hash = "/admin";
            }}
          >
            <div className="dashboard-heading">
              <h1>{route === "/heritage" ? "Heritage" : "Booking"}</h1>
            </div>
            <LaterCard title={route === "/heritage" ? "Malay wedding heritage" : "Wedding bookings"}>
              {route === "/heritage"
                ? "Explore Malay wedding traditions and stories. This feature is planned for a later sprint."
                : "Booking enquiries, schedules and status tracking are planned for a later sprint."}
            </LaterCard>
          </Workspace>
        ) : route === "/account" ? (
          <AccountSettings client={client} auth={auth} />
        ) : (
          <AdminDashboard
            key={auth.session.user.id}
            client={client}
            auth={auth}
          />
        );
  } else if (["/login", "/admin/login", "/reset"].includes(route))
    page = (
      <AuthPage
        key={route}
        client={client}
        auth={auth}
        mode={route === "/reset" ? "reset" : "admin"}
      />
    );
  else if (route === "/admin/setup") page = <AdminSetup />;
  else if (route === "/password")
    page = <PasswordPage client={client} auth={auth}
      linkError={readAuthCallback(window.location).error || callback.error} />;
  else if (route === "/portfolio" || route.startsWith("/portfolio/"))
    page = (
      <PortfolioPage
        key={route}
        client={client}
        auth={auth}
        selectedId={route.split("/")[2] || null}
      />
    );
  else if (route === "/") page = <Home client={client} auth={auth} />;
  else if (route === "/packages") page = <PackagesPage auth={auth} />;
  else if (route === "/contact") page = <ContactPage auth={auth} />;
  else if (route === "/enquire")
    page = (
      <ComingSoon auth={auth} eyebrow="BOOK YOUR DATE"
        action={["#/portfolio", "Explore the portfolio"]}>
        Online booking enquiries are still in development. Please check back
        soon.
      </ComingSoon>
    );
  else
    page = (
      <>
        <Header auth={auth} />
        <main className="page-width route-message">
          <h1>This story isn’t here.</h1>
          <a className="primary" href="#/">
            Return home
          </a>
        </main>
      </>
    );
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main-content");
          main?.setAttribute("tabindex", "-1");
          main?.focus();
        }}
      >
        Skip to content
      </a>
      {page}
    </>
  );
}
