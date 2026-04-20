"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, History, Users } from "lucide-react";
import Link from "next/link";

import { Card } from "@/frontend/shared/components/Card";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";
import { apiGet } from "@/frontend/shared/lib/api-client";

type DashboardTimelinePageProps = {
  user: {
    id: string;
    displayName: string;
    email: string;
  };
};

type Group = { id: string; name: string; baseCurrency: string };
type Expense = { _id: string; title: string; totalAmount: number; paidByUserId: string; expenseDate: string; groupId: string };
type Settlement = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: "pending_receiver" | "confirmed" | "declined";
  groupId: string;
  createdAt?: string;
};
type Notification = { _id: string; type: string; payload: Record<string, unknown>; createdAt: string; readAt?: string };

type TimelineItem =
  | { id: string; kind: "expense"; groupName: string; title: string; amount: number; date: string; subtitle: string }
  | { id: string; kind: "settlement"; groupName: string; title: string; amount: number; date: string; subtitle: string };

export const DashboardTimelinePage = ({ user }: DashboardTimelinePageProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const groupList = await apiGet<Group[]>("/api/groups");
      setGroups(groupList);

      const [notificationsResult, groupActivity] = await Promise.all([
        apiGet<Notification[]>("/api/notifications"),
        Promise.all(
          groupList.map(async (group) => {
            const [expenses, settlements] = await Promise.all([
              apiGet<Expense[]>(`/api/groups/${group.id}/expenses`),
              apiGet<Settlement[]>(`/api/groups/${group.id}/settlements`),
            ]);

            const expenseItems: TimelineItem[] = expenses.map((expense) => ({
              id: `expense-${expense._id}`,
              kind: "expense",
              groupName: group.name,
              title: expense.title,
              amount: expense.totalAmount,
              date: expense.expenseDate,
              subtitle:
                expense.paidByUserId === user.id
                  ? "You paid upfront"
                  : `Paid by ${expense.paidByUserId}`,
            }));

            const settlementItems: TimelineItem[] = settlements.map((settlement) => ({
              id: `settlement-${settlement._id}`,
              kind: "settlement",
              groupName: group.name,
              title: settlement.fromUserId === user.id ? "You sent a settlement" : "Settlement update",
              amount: settlement.amount,
              date: settlement.createdAt ?? new Date().toISOString(),
              subtitle:
                settlement.toUserId === user.id
                  ? `Incoming from ${settlement.fromUserId} (${settlement.status})`
                  : `To ${settlement.toUserId} (${settlement.status})`,
            }));

            return [...expenseItems, ...settlementItems];
          }),
        ),
      ]);

      setNotifications(notificationsResult);
      setTimeline(groupActivity.flat().sort((a, b) => +new Date(b.date) - +new Date(a.date)));
    };

    void load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load dashboard"));
  }, [user.id]);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.readAt),
    [notifications],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 md:py-8">
      <header className="space-y-4 rounded-2xl border border-black/10 bg-(--surface) p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hi {user.displayName}</h1>
            <p className="text-sm text-(--text-muted)">{user.email}</p>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-xl bg-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/15" type="submit">
              Logout
            </button>
          </form>
        </div>
        <ModuleNav />
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <History size={18} />
            <h2 className="text-lg font-semibold">Your Expense & Debt History</h2>
          </div>

          <div className="space-y-3">
            {timeline.length === 0 && <p className="text-sm text-(--text-muted)">No activity yet.</p>}
            {timeline.map((item) => (
              <div key={item.id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="font-semibold">{item.amount.toFixed(2)}</p>
                </div>
                <p className="text-xs text-(--text-muted)">{item.groupName} · {new Date(item.date).toLocaleString()}</p>
                <p className="mt-1 text-sm text-(--text-muted)">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Bell size={18} />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <p className="mb-3 text-sm text-(--text-muted)">Unread: {unreadNotifications.length}</p>
            <div className="space-y-2">
              {notifications.length === 0 && <p className="text-sm text-(--text-muted)">No notifications.</p>}
              {notifications.slice(0, 8).map((notification) => (
                <div key={notification._id} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm">
                  <p className="font-semibold">{notification.type}</p>
                  <p className="text-xs text-(--text-muted)">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Users size={18} />
              <h2 className="text-lg font-semibold">Groups</h2>
            </div>
            <p className="mb-3 text-sm text-(--text-muted)">You are currently in {groups.length} groups.</p>
            <Link href="/groups" className="text-sm font-semibold text-(--brand)">Open Groups</Link>
          </Card>
        </div>
      </section>

      {error && <p className="rounded-xl bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">{error}</p>}
    </main>
  );
};
