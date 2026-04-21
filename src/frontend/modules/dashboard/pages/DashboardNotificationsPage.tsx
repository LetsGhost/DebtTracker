"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, Check, CheckCheck, ArrowLeft, Trash2 } from "lucide-react";

import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";
import { apiGet, apiPost, apiDelete } from "@/frontend/shared/lib/api-client";
import { useToast } from "@/frontend/shared/hooks/useToast";
import { useDialog } from "@/frontend/shared/hooks/useDialog";

type DashboardNotificationsPageProps = {
  user: {
    id: string;
    displayName: string;
    email: string;
  };
};

type Notification = { _id: string; type: string; payload: Record<string, unknown>; createdAt: string; readAt?: string };
type InvitePayload = {
  inviteId?: string;
  groupId?: string;
  groupName?: string;
  invitedByDisplayName?: string;
  invitedByEmail?: string;
  message?: string | null;
};

type DebtDuePayload = {
  groupId?: string;
  groupName?: string;
  toUserDisplayName?: string;
  amount?: number;
};

type SettlementPendingPayload = {
  settlementId?: string;
  groupId?: string;
  groupName?: string;
  fromUserDisplayName?: string;
  amount?: number;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 16).replace("T", " ");
};

export const DashboardNotificationsPage = ({ user }: DashboardNotificationsPageProps) => {
  const toast = useToast();
  const dialog = useDialog();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [busyNotificationId, setBusyNotificationId] = useState<string | null>(null);

  const load = async () => {
    const result = await apiGet<Notification[]>("/api/notifications");
    setNotifications(result);
  };

  useEffect(() => {
    void load().catch((e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to load notifications"));
  }, [toast]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.readAt).length, [notifications]);

  const markRead = async (notificationId: string) => {
    setBusyNotificationId(notificationId);
    try {
      await apiPost(`/api/notifications/${notificationId}/read`, {});
      toast.success("Marked as read.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to mark notification as read");
    } finally {
      setBusyNotificationId(null);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setBusyNotificationId(notificationId);
    try {
      await apiPost(`/api/notifications/${notificationId}/delete`, {});
      toast.success("Notification deleted.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete notification");
    } finally {
      setBusyNotificationId(null);
    }
  };

  const clearAllNotifications = async () => {
    await dialog.open({
      title: "Clear All Notifications?",
      description: "This action will delete all your notifications permanently.",
      actions: [
        {
          label: "Clear",
          onClick: async () => {
            try {
              await apiDelete("/api/notifications/clear");
              toast.success("All notifications cleared.");
              await load();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed to clear notifications");
            }
          },
          variant: "danger",
        },
      ],
    });
  };

  const acceptInvite = async (notification: Notification) => {
    const payload = notification.payload as InvitePayload;
    if (!payload.inviteId) {
      toast.error("This invite notification is missing invite details.");
      return;
    }

    setBusyNotificationId(notification._id);

    try {
      await apiPost(`/api/invites/${payload.inviteId}/accept`, {});
      if (!notification.readAt) {
        await apiPost(`/api/notifications/${notification._id}/read`, {});
      }
      toast.success(`Invite accepted${payload.groupName ? ` for ${payload.groupName}` : ""}.`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to accept invite");
    } finally {
      setBusyNotificationId(null);
    }
  };

  const confirmSettlement = async (notification: Notification) => {
    const payload = notification.payload as SettlementPendingPayload;

    if (!payload.groupId || !payload.settlementId) {
      toast.error("This settlement notification is missing details.");
      return;
    }

    setBusyNotificationId(notification._id);

    try {
      await apiPost(`/api/groups/${payload.groupId}/settlements/${payload.settlementId}/confirm-received`, {});
      if (!notification.readAt) {
        await apiPost(`/api/notifications/${notification._id}/read`, {});
      }
      toast.success(`Payment confirmed${payload.groupName ? ` in ${payload.groupName}` : ""}.`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to confirm settlement");
    } finally {
      setBusyNotificationId(null);
    }
  };

  const declineSettlement = async (notification: Notification) => {
    const payload = notification.payload as SettlementPendingPayload;

    if (!payload.groupId || !payload.settlementId) {
      toast.error("This settlement notification is missing details.");
      return;
    }

    setBusyNotificationId(notification._id);

    try {
      await apiPost(`/api/groups/${payload.groupId}/settlements/${payload.settlementId}/decline`, { reason: "Not received" });
      if (!notification.readAt) {
        await apiPost(`/api/notifications/${notification._id}/read`, {});
      }
      toast.success(`Payment declined${payload.groupName ? ` in ${payload.groupName}` : ""}.`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to decline settlement");
    } finally {
      setBusyNotificationId(null);
    }
  };

  const renderTitle = (notification: Notification) => {
    if (notification.type === "invite") {
      const payload = notification.payload as InvitePayload;
      const groupName = payload.groupName ?? "a group";
      return `Invite to ${groupName}`;
    }

    if (notification.type === "debt_due") {
      const payload = notification.payload as DebtDuePayload;
      const amount = typeof payload.amount === "number" ? payload.amount.toFixed(2) : "0.00";
      return `You owe ${amount}`;
    }

    if (notification.type === "settlement_pending") {
      const payload = notification.payload as SettlementPendingPayload;
      const amount = typeof payload.amount === "number" ? payload.amount.toFixed(2) : "0.00";
      return `Payment awaiting your confirmation (${amount})`;
    }

    if (notification.type === "settlement_confirmed") return "Your payment was confirmed";
    if (notification.type === "settlement_declined") return "Your payment confirmation was declined";
    return notification.type;
  };

  const renderSubtitle = (notification: Notification) => {
    if (notification.type === "invite") {
      const payload = notification.payload as InvitePayload;
      const invitedBy = payload.invitedByDisplayName ?? payload.invitedByEmail ?? "someone";
      const inviterEmail = payload.invitedByEmail ? ` (${payload.invitedByEmail})` : "";
      const inviteMessage = payload.message ? ` · ${payload.message}` : "";
      return `From ${invitedBy}${inviterEmail}${inviteMessage}`;
    }

    if (notification.type === "debt_due") {
      const payload = notification.payload as DebtDuePayload;
      const toUser = payload.toUserDisplayName ?? "someone";
      const groupName = payload.groupName ?? "group";
      return `Pay ${toUser} in ${groupName}`;
    }

    if (notification.type === "settlement_pending") {
      const payload = notification.payload as SettlementPendingPayload;
      const fromUser = payload.fromUserDisplayName ?? "someone";
      const groupName = payload.groupName ?? "group";
      return `${fromUser} marked a debt as paid in ${groupName}`;
    }

    return "";
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 md:py-8">
      <header className="space-y-4 rounded-2xl border border-black/10 bg-(--surface) p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-(--text-muted)">{user.displayName} · {user.email}</p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/15">
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>
        <ModuleNav />
      </header>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} />
            <h2 className="text-lg font-semibold">All Notifications</h2>
          </div>
          {notifications.length > 0 && (
            <Button type="button" variant="ghost" onClick={clearAllNotifications}>
              <Trash2 size={16} className="mr-1" />
              Clear All
            </Button>
          )}
        </div>
        <p className="mb-4 text-sm text-(--text-muted)">Unread: {unreadCount} · Total: {notifications.length}</p>

        <div className="space-y-3">
          {notifications.length === 0 && <p className="text-sm text-(--text-muted)">No notifications yet.</p>}

          {notifications.map((notification) => {
            const isInvite = notification.type === "invite";
            const isDebtDue = notification.type === "debt_due";
            const isSettlementPending = notification.type === "settlement_pending";
            const isBusy = busyNotificationId === notification._id;
            const debtPayload = notification.payload as DebtDuePayload;

            return (
              <div key={notification._id} className="rounded-xl border border-black/10 bg-white p-4 text-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{renderTitle(notification)}</p>
                    <p className="text-xs text-(--text-muted)">{formatDateTime(notification.createdAt)}</p>
                    {renderSubtitle(notification) && <p className="mt-1 text-sm text-(--text-muted)">{renderSubtitle(notification)}</p>}
                    {!notification.readAt ? (
                      <p className="mt-1 text-xs font-semibold text-(--brand)">Unread</p>
                    ) : (
                      <p className="mt-1 text-xs text-(--text-muted)">Read</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isInvite && (
                      <Button type="button" onClick={() => acceptInvite(notification)} disabled={isBusy}>
                        <span className="inline-flex items-center gap-1">
                          <Check size={14} />
                          Accept Invite
                        </span>
                      </Button>
                    )}

                    {isDebtDue && debtPayload.groupId && (
                      <Link
                        href={`/groups/${debtPayload.groupId}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                      >
                        Open debt in group
                      </Link>
                    )}

                    {isSettlementPending && (
                      <>
                        <Button type="button" onClick={() => confirmSettlement(notification)} disabled={isBusy}>
                          <span className="inline-flex items-center gap-1">
                            <Check size={14} />
                            Confirm payment
                          </span>
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => declineSettlement(notification)} disabled={isBusy}>
                          Decline
                        </Button>
                      </>
                    )}

                    {!notification.readAt && (
                      <Button type="button" variant="ghost" onClick={() => markRead(notification._id)} disabled={isBusy}>
                        <span className="inline-flex items-center gap-1">
                          <CheckCheck size={14} />
                          Mark read
                        </span>
                      </Button>
                    )}

                    <Button type="button" variant="ghost" onClick={() => deleteNotification(notification._id)} disabled={isBusy}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </main>
  );
};
