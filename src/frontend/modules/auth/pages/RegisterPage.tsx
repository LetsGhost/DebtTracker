import { Card } from "@/frontend/shared/components/Card";
import { AuthForm } from "@/frontend/modules/auth/components/AuthForm";

export const RegisterPage = () => (
  <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8">
    <div className="grid w-full gap-6 md:grid-cols-[1.1fr_1fr]">
      <section className="rounded-3xl border border-black/10 bg-(--surface-strong) p-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">Start Tracking</p>
        <h1 className="text-4xl font-bold leading-tight">Create your finance space in under a minute.</h1>
      </section>
      <Card>
        <h2 className="mb-1 text-2xl font-bold">Create account</h2>
        <p className="mb-5 text-sm text-(--text-muted)">Your workspace starts with local auth + JWT.</p>
        <AuthForm mode="register" />
      </Card>
    </div>
  </main>
);
