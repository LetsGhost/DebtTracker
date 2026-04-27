"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/frontend/shared/components/Button";
import { TextField } from "@/frontend/shared/components/TextField";
import { apiPost } from "@/frontend/shared/lib/api-client";

type AuthFormProps = {
  mode: "login" | "register";
};

type AuthResponse = {
  id: string;
  email: string;
  displayName: string;
};

export const AuthForm = ({ mode }: AuthFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const urlError =
    mode === "login" && searchParams.get("error") === "verify-email"
      ? "Please verify your email before using the app."
      : null;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
    };

    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { email: payload.email, password: payload.password } : payload;
      await apiPost<AuthResponse>(path, body);
      router.push(mode === "login" ? "/dashboard" : "/login");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const onResendVerification = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const formElement = event.currentTarget.form;
    if (!formElement) {
      setError("Unable to read form state. Please try again.");
      return;
    }

    const email = String(new FormData(formElement).get("email") ?? "").trim();

    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    setResending(true);

    try {
      await apiPost<{ emailSent: boolean }>("/api/auth/verify-email/resend", { email });
      setInfo("Verification email sent. Please check your inbox.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={onSubmit}>
      {mode === "register" && (
        <TextField name="displayName" label="Display name" placeholder="Jane Doe" required minLength={2} />
      )}

      <TextField name="email" label="Email" type="email" placeholder="you@mail.com" required />
      <TextField name="password" label="Password" type="password" required minLength={6} />

      {(error ?? urlError) && <p className="rounded-xl bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">{error ?? urlError}</p>}
      {info && <p className="rounded-xl bg-green-500/10 px-3 py-2 text-sm text-green-700">{info}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
      </Button>

      {mode === "login" && (
        <button
          type="button"
          className="text-left text-sm font-semibold text-(--brand)"
          disabled={resending}
          onClick={onResendVerification}
        >
          {resending ? "Sending verification email..." : "Resend verification email"}
        </button>
      )}

      <p className="text-sm text-(--text-muted)">
        {mode === "login" ? "No account yet? " : "Already registered? "}
        <Link className="font-semibold text-(--brand)" href={mode === "login" ? "/register" : "/login"}>
          {mode === "login" ? "Create one" : "Sign in"}
        </Link>
      </p>

      {mode === "login" && (
        <p className="text-sm text-(--text-muted)">
          <Link className="font-semibold text-(--brand)" href="/forgot-password">
            Forgot your password?
          </Link>
        </p>
      )}
    </form>
  );
};
