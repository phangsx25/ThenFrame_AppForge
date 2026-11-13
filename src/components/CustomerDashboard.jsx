import { useState } from "react";
import { accountName } from "../lib/account";
import { Workspace } from "./Layout";
import { Icon, LaterCard, Placeholder } from "./UI";
export default function CustomerDashboard({ auth }) {
  const [section, setSection] = useState("Overview");
  return (
    <Workspace auth={auth} active={section} onSection={setSection}>
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">YOUR ACCOUNT / THENFRAME</span>
          <h1>
            {section === "Overview"
              ? `Welcome back, ${accountName(auth.session.user, auth.profile)}.`
              : "Your private albums."}
          </h1>
          <p>
            A little planning, a few favourite frames, and your next beautiful
            chapter.
          </p>
        </div>
        <a className="primary" href="#/portfolio">
          Explore the portfolio
        </a>
      </div>
      {section === "Overview" && (
        <>
          <section className="account-welcome">
            <Placeholder label="[Your wedding-day portrait]" />
            <div>
              <span className="eyebrow">YOUR PHOTOGRAPHY JOURNEY</span>
              <h2>Your story starts here.</h2>
              <p>
                Your customer account is ready. Discover wedding collections and
                find your favourite photography style.
              </p>
              <a className="text-link" href="#/portfolio">
                Find inspiration <Icon name="arrow" size={16} />
              </a>
            </div>
          </section>
          <h2>Your bookings</h2>
          <LaterCard title="A little closer to the big day">
            Booking enquiries, schedules and status tracking are planned for a
            later sprint. There are no booking records connected to this screen
            yet.
          </LaterCard>
        </>
      )}
      <h2>
        Your private albums <Icon name="lock" size={18} />
      </h2>
      <LaterCard title="A place for your favourite memories">
        Private client assignments, proof selection and final delivery are
        planned for a later sprint. Public portfolio collections are not private
        client albums.
      </LaterCard>
      <p className="muted small-text">Signed in as {auth.session.user.email}</p>
    </Workspace>
  );
}
