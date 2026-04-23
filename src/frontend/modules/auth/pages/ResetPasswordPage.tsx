"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Card } from "@/frontend/shared/components/Card";
import { TextField } from "@/frontend/shared/components/TextField";
import { Button } from "@/frontend/shared/components/Button";
import { apiPost } from "@/frontend/shared/lib/api-client";

type ResetPasswordResponse = { reset: boolean };

type ResetPasswordPageProps = {
  token: string;
};

export const ResetPasswordPage = ({ token }: ResetPasswordPageProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await apiPost<ResetPasswordResponse>("/api/auth/password-reset/confirm", { token, password });
      setSuccess(true);
      event.currentTarget.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8">
      <div className="grid w-full gap-6 md:grid-cols-[1.1fr_1fr]">
        <section className="rounded-3xl border border-black/10 bg-(--surface-strong) p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">Password reset</p>
          <h1 className="text-4xl font-bold leading-tight">Choose a new password for your account.</h1>
        </section>
        <Card>
          <h2 className="mb-1 text-2xl font-bold">Set new password</h2>
          <p className="mb-5 text-sm text-(--text-muted)">Enter the new password you want to use.</p>

          <form className="flex w-full flex-col gap-4" onSubmit={onSubmit}>
            <TextField name="password" label="New password" type="password" required minLength={6} />
            <TextField name="confirmPassword" label="Confirm password" type="password" required minLength={6} />

            {error && <p className="rounded-xl bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">{error}</p>}
            {success && <p className="rounded-xl bg-green-500/10 px-3 py-2 text-sm text-green-700">Password updated. You can now sign in.</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Reset password"}
            </Button>

            <p className="text-sm text-(--text-muted)">
              <Link className="font-semibold text-(--brand)" href="/login">
                Back to login
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
};
