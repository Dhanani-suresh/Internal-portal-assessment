import { AnnouncementsPanel } from "@/components/announcements-panel";
import { LogoutButton } from "@/components/logout-button";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  return (
    <main className="portal-shell">
      <header className="topbar">
        <a className="wordmark" href="/dashboard"><span>A</span> ACME</a>
        <div className="account-actions">
          <span className="user-email">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <div className="dashboard-content">
        <section className="dashboard-intro">
          <div>
            <p className="eyebrow">Team communications</p>
            <h1>Keep everyone in the loop.</h1>
            <p>A simple, shared space for the updates that matter most.</p>
          </div>
          <div className="hero-summary" aria-label="Portal overview">
            <span className="summary-dot" aria-hidden="true" />
            <div><strong>Team pulse</strong><small>Live announcements</small></div>
          </div>
        </section>
        <AnnouncementsPanel currentUserEmail={user.email} />
      </div>
    </main>
  );
}
