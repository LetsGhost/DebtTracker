"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card } from "@/frontend/shared/components/Card";
import { apiPost } from "@/frontend/shared/lib/api-client";

type VerifyEmailResponse = { verified: boolean };

type VerifyEmailPageProps = {
  token: string;
};

export const VerifyEmailPage = ({ token }: VerifyEmailPageProps) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        await apiPost<VerifyEmailResponse>("/api/auth/verify-email", { token });
        setSuccess(true);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Verification failed");
      } finally {
        setLoading(false);
      }
    };

    void verify();
  }, [token]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8">
      <div className="grid w-full gap-6 md:grid-cols-[1.1fr_1fr]">
        <section className="rounded-3xl border border-black/10 bg-(--surface-strong) p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">Email verification</p>
          <h1 className="text-4xl font-bold leading-tight">Confirming your email address.</h1>
        </section>
        <Card>
          <h2 className="mb-1 text-2xl font-bold">Verify email</h2>
          <p className="mb-5 text-sm text-(--text-muted)">We are validating your verification link.</p>

          {loading && <p className="rounded-xl bg-black/5 px-3 py-2 text-sm text-(--text-muted)">Verifying...</p>}
          {success && <p className="rounded-xl bg-green-500/10 px-3 py-2 text-sm text-green-700">Email verified. You can now continue to login.</p>}
          {error && <p className="rounded-xl bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">{error}</p>}

          <div className="mt-4">
            <Link className="font-semibold text-(--brand)" href="/login">
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
};
