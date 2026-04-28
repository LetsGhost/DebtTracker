"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";
import { TextField } from "@/frontend/shared/components/TextField";
import { apiGet, apiPost } from "@/frontend/shared/lib/api-client";

type Group = { id: string; name: string; baseCurrency: string };
type UserOption = { id: string; displayName: string; email: string };

export const GroupCreatePage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [selectedInvitees, setSelectedInvitees] = useState<UserOption[]>([]);

  const loadUserResults = async (query: string) => {
    if (query.trim().length < 2) {
      setUserResults([]);
      return;
    }

    try {
      const users = await apiGet<UserOption[]>(`/api/users?query=${encodeURIComponent(query)}`);
      setUserResults(users);
    } catch {
      setUserResults([]);
    }
  };

  const onUserQueryChange = (value: string) => {
    setUserQuery(value);
    void loadUserResults(value);
  };

  const addInvitee = (user: UserOption) => {
    setSelectedInvitees((current) => (current.some((x) => x.id === user.id) ? current : [...current, user]));
  };

  const removeInvitee = (userId: string) => {
    setSelectedInvitees((current) => current.filter((x) => x.id !== userId));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      const group = await apiPost<Group>("/api/groups", {
        name: String(form.get("name") ?? "").trim(),
        baseCurrency: String(form.get("baseCurrency") ?? "EUR").trim().toUpperCase(),
      });

      const invitedUserIds = selectedInvitees.map((user) => user.id);

      if (invitedUserIds.length > 0) {
        await apiPost(`/api/groups/${group.id}/batch-invites`, { invitedUserIds });
      }

      router.push(`/groups/${group.id}/edit`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create group");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-6 md:py-8">
      <header className="space-y-4 rounded-2xl border border-black/10 bg-(--surface) p-4 md:p-5">
        <div>
          <h1 className="text-2xl font-bold">Create Group</h1>
          <p className="text-sm text-(--text-muted)">Set initial info, invite users, then tune policy.</p>
        </div>
        <ModuleNav />
      </header>

      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          <TextField name="name" label="Group name" placeholder="Weekend City Trip" required />
          <TextField name="baseCurrency" label="Base currency" defaultValue="EUR" required />
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Invite users</span>
            <input
              value={userQuery}
              onChange={(event) => onUserQueryChange(event.target.value)}
              className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm"
              placeholder="Search by name or email"
            />
          </label>

          {userResults.length > 0 && (
            <div className="space-y-2 rounded-xl border border-black/10 bg-black/5 p-2">
              {userResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => addInvitee(user)}
                  className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm hover:bg-black/5"
                >
                  <span className="font-semibold">{user.displayName}</span>
                  <span className="text-xs text-(--text-muted)">{user.email}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {selectedInvitees.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => removeInvitee(user.id)}
                className="rounded-full bg-black/10 px-3 py-1 text-xs font-semibold"
              >
                {user.displayName} · remove
              </button>
            ))}
          </div>

          <Button type="submit" className="w-full">Create and continue</Button>
        </form>
      </Card>

      {error && <p className="rounded-xl bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">{error}</p>}
    </main>
  );
};
