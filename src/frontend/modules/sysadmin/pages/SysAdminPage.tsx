"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Shield, Search, UserX, UserCheck, Trash2 } from "lucide-react";

import { Button } from "@/frontend/shared/components/Button";
import { useDialog } from "@/frontend/shared/hooks/useDialog";
import { useToast } from "@/frontend/shared/hooks/useToast";
import { apiDelete, apiGet, apiPatch } from "@/frontend/shared/lib/api-client";

type LoginAttempt = {
  id: string;
  userId: string | null;
  email: string;
  success: boolean;
  failureReason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

type Stats = {
  users: number;
  groups: number;
  activeMemberships: number;
  expenses: number;
  pendingSettlements: number;
  loginStats: {
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    last24hLogins: number;
    last7dLogins: number;
    recentAttempts: LoginAttempt[];
  };
};

type SysAdminUser = {
  id: string;
  email: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  emailVerifiedAt: string | null;
  suspendedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string | null;
};

type SysAdminPageProps = {
  initialStats: Stats;
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 16).replace("T", " ");
};

export const SysAdminPage = ({ initialStats }: SysAdminPageProps) => {
  const toast = useToast();
  const dialog = useDialog();

  const [stats, setStats] = useState<Stats>(initialStats);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SysAdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const loadStats = async () => {
    const result = await apiGet<Stats>("/api/sys-admin/stats");
    setStats(result);
  };

  const loadUsers = async (searchQuery = "") => {
    setIsLoadingUsers(true);
    try {
      const result = await apiGet<SysAdminUser[]>(`/api/sys-admin/users?query=${encodeURIComponent(searchQuery)}`);
      setUsers(result);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadUsers().catch((error) => {
      toast.error(error instanceof Error ? error.message : "Failed to load users");
    });
  }, [toast]);

  const statsCards = useMemo(
    () => [
      { label: "Users", value: stats.users },
      { label: "Groups", value: stats.groups },
      { label: "Active Memberships", value: stats.activeMemberships },
      { label: "Expenses", value: stats.expenses },
      { label: "Pending Settlements", value: stats.pendingSettlements },
      { label: "Logins (24h)", value: stats.loginStats.last24hLogins },
    ],
    [stats],
  );

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await loadUsers(query.trim());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed");
    }
  };

  const onToggleSuspension = async (user: SysAdminUser) => {
    const isSuspended = Boolean(user.suspendedAt);
    setBusyUserId(user.id);
    try {
      await apiPatch(`/api/sys-admin/users/${user.id}`, { suspended: !isSuspended });
      toast.success(isSuspended ? "User entsperrt" : "User gesperrt");
      await Promise.all([loadUsers(query.trim()), loadStats()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusyUserId(null);
    }
  };

  const onDeleteUser = async (user: SysAdminUser) => {
    const confirmed = await dialog.open({
      title: "Benutzer wirklich loeschen?",
      description: `Der Account ${user.email} wird dauerhaft entfernt.`,
      actions: [
        {
          label: "Loeschen",
          variant: "danger",
          onClick: () => undefined,
        },
      ],
    });

    if (!confirmed) return;

    setBusyUserId(user.id);
    try {
      await apiDelete(`/api/sys-admin/users/${user.id}`);
      toast.success("Benutzer geloescht");
      await Promise.all([loadUsers(query.trim()), loadStats()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <header className="rounded-2xl border border-black/10 bg-(--surface) p-6">
        <div className="flex items-center gap-3">
          <Shield size={24} />
          <h1 className="text-3xl font-bold">SysAdmin Dashboard</h1>
        </div>
        <p className="mt-2 text-sm text-(--text-muted)">
          Benutzerverwaltung, Login-Statistiken und operative Kennzahlen.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((item) => (
          <article key={item.label} className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-(--text-muted)">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-black/10 bg-(--surface) p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Benutzer</h2>
            <form className="flex items-center gap-2" onSubmit={onSearch}>
              <div className="flex items-center rounded-xl border border-black/15 bg-white px-3 py-2 text-sm">
                <Search size={14} className="mr-2 text-(--text-muted)" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Suche nach Email oder UserID"
                  className="w-52 bg-transparent outline-none"
                />
              </div>
              <Button type="submit" variant="ghost">Suchen</Button>
            </form>
          </div>

          <div className="space-y-3">
            {isLoadingUsers && <p className="text-sm text-(--text-muted)">Lade Benutzer...</p>}
            {!isLoadingUsers && users.length === 0 && <p className="text-sm text-(--text-muted)">Keine Benutzer gefunden.</p>}

            {users.map((user) => {
              const isBusy = busyUserId === user.id;
              const isSuspended = Boolean(user.suspendedAt);
              return (
                <div key={user.id} className="rounded-xl border border-black/10 bg-white p-4 text-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-xs text-(--text-muted)">{user.email}</p>
                      <p className="text-xs text-(--text-muted)">ID: {user.id}</p>
                      <p className="mt-1 text-xs text-(--text-muted)">
                        Erstellt: {formatDate(user.createdAt)} · Last Login: {formatDate(user.lastLoginAt)}
                      </p>
                      <p className="text-xs text-(--text-muted)">
                        Verifiziert: {user.emailVerifiedAt ? "ja" : "nein"} · Status: {isSuspended ? "gesperrt" : "aktiv"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="ghost" disabled={isBusy} onClick={() => onToggleSuspension(user)}>
                        {isSuspended ? <UserCheck size={15} className="mr-1" /> : <UserX size={15} className="mr-1" />}
                        {isSuspended ? "Entsperren" : "Sperren"}
                      </Button>
                      <Button type="button" variant="ghost" className="border border-red-300 text-red-700 hover:bg-red-50" disabled={isBusy} onClick={() => onDeleteUser(user)}>
                        <Trash2 size={15} className="mr-1" />
                        Loeschen
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-(--surface) p-5">
          <h2 className="mb-3 text-xl font-bold">Login-Statistiken</h2>
          <div className="mb-4 grid gap-2 text-sm">
            <p>Total: <strong>{stats.loginStats.totalLogins}</strong></p>
            <p>Erfolgreich: <strong>{stats.loginStats.successfulLogins}</strong></p>
            <p>Fehlgeschlagen: <strong>{stats.loginStats.failedLogins}</strong></p>
            <p>Letzte 24h: <strong>{stats.loginStats.last24hLogins}</strong></p>
            <p>Letzte 7 Tage: <strong>{stats.loginStats.last7dLogins}</strong></p>
          </div>

          <div className="space-y-2">
            {stats.loginStats.recentAttempts.length === 0 && (
              <p className="text-sm text-(--text-muted)">Noch keine Login-Versuche erfasst.</p>
            )}
            {stats.loginStats.recentAttempts.map((attempt) => (
              <div key={attempt.id} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs">
                <p className="font-semibold">{attempt.email}</p>
                <p className="text-(--text-muted)">
                  {attempt.success ? "Success" : `Failed: ${attempt.failureReason ?? "unknown"}`}
                </p>
                <p className="text-(--text-muted)">{formatDate(attempt.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
