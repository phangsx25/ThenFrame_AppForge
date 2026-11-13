import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./components/AuthPage";
import PasswordPage from "./components/PasswordPage";
import AdminDashboard from "./components/AdminDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import { Home, PortfolioPage } from "./components/PublicPages";
import { Header } from "./components/Layout";
import { Notice } from "./components/UI";
import "./App.css";

function routeFromHash() {
  const hash = window.location.hash;
  // Supabase consumes recovery/confirmation tokens. Keep those out of routes/UI.
  if (/^#(?:access_token|error|type)=/.test(hash)) return "/password";
  if (!hash) {
    const callback = new URLSearchParams(window.location.search).get("auth");
    if (callback === "password") return "/password";
    if (callback === "confirmed") return "/login";
  }
  return (hash.slice(1) || "/").split("#")[0];
}
export default function App({ client = supabase }) {
  const auth = useAuth(client);
  const [route, setRoute] = useState(routeFromHash);
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
  if (route === "/admin" || route === "/dashboard" || route === "/album") {
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
          <a
            className="primary"
            href={route === "/admin" ? "#/admin/login" : "#/login"}
          >
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
          <a href="#/login">Return to login</a>
          <button
            className="button-outline"
            onClick={() => void auth.logout().catch(() => {})}
          >
            Sign out
          </button>
        </main>
      );
    else if (route === "/admin" && !auth.isAdmin)
      page = (
        <main className="page-width route-message">
          <h1>Studio access only.</h1>
          <p>Your account does not have admin permissions.</p>
          <a className="primary" href="#/dashboard">
            Go to your customer space
          </a>
        </main>
      );
    else
      page =
        route === "/admin" ? (
          <AdminDashboard
            key={auth.session.user.id}
            client={client}
            auth={auth}
          />
        ) : (
          <CustomerDashboard auth={auth} />
        );
  } else if (["/login", "/register", "/admin/login", "/reset"].includes(route))
    page = (
      <AuthPage
        key={route}
        client={client}
        auth={auth}
        mode={route === "/admin/login" ? "admin" : route.slice(1)}
      />
    );
  else if (route === "/password")
    page = <PasswordPage client={client} auth={auth} />;
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
