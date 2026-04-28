"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Surface the error in server logs during development.
    // eslint-disable-next-line no-console
    console.error("Global app error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card>
        <div className="max-w-xl">
          <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
          <p className="mb-4 text-sm text-gray-600">An unexpected error occurred while loading this page.</p>

          {error?.message && (
            <pre className="mb-4 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-red-50 p-3 text-xs text-red-700">{error.message}</pre>
          )}

          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={() => reset()}>Try again</Button>
            <Link href="/dashboard" className="inline-block">
              <Button>Go to dashboard</Button>
            </Link>
          </div>
        </div>
      </Card>
    </main>
  );
}
