import { LoginForm } from "@/components/login-form";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (await currentUser()) redirect("/dashboard");

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true">A</div>
        <p className="eyebrow">Acme internal</p>
        <h1 id="login-title">Welcome</h1>
        <p className="muted">Sign in to read and share announcements with the team.</p>
        <LoginForm />
      </section>
    </main>
  );
}
