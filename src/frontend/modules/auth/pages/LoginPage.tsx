import { Card } from "@/frontend/shared/components/Card";
import { AuthForm } from "@/frontend/modules/auth/components/AuthForm";

export const LoginPage = () => (
  <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8">
    <div className="grid w-full gap-6 md:grid-cols-[1.1fr_1fr]">
      <section className="rounded-3xl border border-black/10 bg-(--surface-strong) p-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">FinancTracker</p>
        <h1 className="text-4xl font-bold leading-tight">Collaborative money clarity, not spreadsheet chaos.</h1>
      </section>
      <Card>
        <h2 className="mb-1 text-2xl font-bold">Welcome back</h2>
        <p className="mb-5 text-sm text-(--text-muted)">Sign in to access your dashboard.</p>
        <AuthForm mode="login" />
      </Card>
    </div>
  </main>
);
