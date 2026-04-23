"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
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
      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={onSubmit}>
      {mode === "register" && (
        <TextField name="displayName" label="Display name" placeholder="Jane Doe" required minLength={2} />
      )}

      <TextField name="email" label="Email" type="email" placeholder="you@mail.com" required />
      <TextField name="password" label="Password" type="password" required minLength={6} />

      {error && <p className="rounded-xl bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
      </Button>

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
