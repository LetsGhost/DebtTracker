"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Coins, HandCoins, Shield, Trash2, UserCog, UserPlus, Users } from "lucide-react";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/frontend/shared/lib/api-client";
import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";
import { TextField } from "@/frontend/shared/components/TextField";

type Group = {
  id: string;
  name: string;
  baseCurrency: string;
};

type GroupPolicy = {
  canMembersInvite: boolean;
  canEditorsAddExpense: boolean;
  canModeratorsAddExpense: boolean;
  visibilityMode: "transparent" | "private" | "hybrid";
  canViewParticipatedExpenseDetails: boolean;
  requireReceiverConfirmationForSettlement: boolean;
  allowMemberRoleSelfLeave: boolean;
};

type GroupMember = {
  id: string;
  userId: string;
  role: "admin" | "moderator" | "editor" | "viewer";
  addedByUserId: string;
};

type GroupInvite = {
  _id: string;
  invitedUserId: string;
  invitedByUserId: string;
  status: "pending" | "accepted" | "rejected" | "revoked" | "expired";
};

type Settlement = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: "pending_receiver" | "confirmed" | "declined";
};

type WorkflowPanelsProps = {
  userId: string;
};

const parseList = (raw: string) =>
  raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const parseKeyValueLines = (raw: string) => {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [userId, value] = line.split(":").map((x) => x.trim());
      return { userId, value: Number(value) };
    })
    .filter((x) => x.userId && !Number.isNaN(x.value));
};

export const WorkflowPanels = ({ userId }: WorkflowPanelsProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [policy, setPolicy] = useState<GroupPolicy | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const refreshGroups = async () => {
    const result = await apiGet<Group[]>("/api/groups");
    setGroups(result);

    if (result.length > 0 && !selectedGroupId) {
      setSelectedGroupId(result[0].id);
    }
  };

  const refreshPolicy = async (groupId: string) => {
    const result = await apiGet<GroupPolicy>(`/api/groups/${groupId}/policy`);
    setPolicy(result);
  };

  const refreshSettlements = async (groupId: string) => {
    const result = await apiGet<Settlement[]>(`/api/groups/${groupId}/settlements`);
    setSettlements(result);
  };

  const refreshMembers = async (groupId: string) => {
    const result = await apiGet<GroupMember[]>(`/api/groups/${groupId}/members`);
    setMembers(result);
  };

  const refreshInvites = async (groupId: string) => {
    const result = await apiGet<GroupInvite[]>(`/api/groups/${groupId}/invites`);
    setInvites(result);
  };

  useEffect(() => {
    void refreshGroups().catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load groups"));
  }, []);

  useEffect(() => {
    if (!selectedGroupId) {
      return;
    }

    void refreshPolicy(selectedGroupId).catch((e: unknown) =>
      setError(e instanceof Error ? e.message : "Failed to load policy"),
    );

    void refreshSettlements(selectedGroupId).catch((e: unknown) =>
      setError(e instanceof Error ? e.message : "Failed to load settlements"),
    );

    void refreshMembers(selectedGroupId).catch((e: unknown) =>
      setError(e instanceof Error ? e.message : "Failed to load members"),
    );

    void refreshInvites(selectedGroupId).catch((e: unknown) =>
      setError(e instanceof Error ? e.message : "Failed to load invites"),
    );
  }, [selectedGroupId]);

  const onCreateGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const baseCurrency = String(form.get("baseCurrency") ?? "EUR").trim().toUpperCase();

    try {
      const created = await apiPost<Group>("/api/groups", { name, baseCurrency });
      await refreshGroups();
      setSelectedGroupId(created.id);
      setSuccess("Group created successfully.");
      event.currentTarget.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create group");
    }
  };

  const onSavePolicy = async () => {
    if (!selectedGroupId || !policy) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await apiPatch(`/api/groups/${selectedGroupId}/policy`, policy);
      setSuccess("Policy updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update policy");
    }
  };

  const onCreateExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGroupId) {
      setError("Select a group first.");
      return;
    }

    setError("");
    setSuccess("");

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const paidByUserId = String(form.get("paidByUserId") ?? "").trim();
    const totalAmount = Number(form.get("totalAmount") ?? 0);
    const splitType = String(form.get("splitType") ?? "equal") as "equal" | "percentage" | "custom";
    const equalParticipants = String(form.get("equalParticipants") ?? "");
    const advancedSplit = String(form.get("advancedSplit") ?? "");

    const participants =
      splitType === "equal"
        ? parseList(equalParticipants).map((user) => ({ userId: user }))
        : parseKeyValueLines(advancedSplit).map((entry) =>
            splitType === "percentage"
              ? { userId: entry.userId, sharePercent: entry.value }
              : { userId: entry.userId, shareAmount: entry.value },
          );

    try {
      await apiPost(`/api/groups/${selectedGroupId}/expenses`, {
        title,
        paidByUserId,
        totalAmount,
        splitType,
        expenseDate: new Date().toISOString(),
        participants,
      });
      setSuccess("Expense created.");
      event.currentTarget.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create expense");
    }
  };

  const onSettlementAction = async (settlementId: string, action: "confirm" | "decline") => {
    if (!selectedGroupId) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      if (action === "confirm") {
        await apiPost(`/api/groups/${selectedGroupId}/settlements/${settlementId}/confirm-received`, {});
      } else {
        await apiPost(`/api/groups/${selectedGroupId}/settlements/${settlementId}/decline`, { reason: "Not received yet" });
      }

      await refreshSettlements(selectedGroupId);
      setSuccess(action === "confirm" ? "Settlement confirmed." : "Settlement declined.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process settlement");
    }
  };

  const onInviteSingle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGroupId) {
      setError("Select a group first.");
      return;
    }

    setError("");
    setSuccess("");

    const form = new FormData(event.currentTarget);
    const invitedUserId = String(form.get("invitedUserId") ?? "").trim();

    try {
      await apiPost(`/api/groups/${selectedGroupId}/invites`, { invitedUserId });
      await refreshInvites(selectedGroupId);
      setSuccess("Invite sent.");
      event.currentTarget.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send invite");
    }
  };

  const onInviteBatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGroupId) {
      setError("Select a group first.");
      return;
    }

    setError("");
    setSuccess("");

    const form = new FormData(event.currentTarget);
    const invitedUserIds = parseList(String(form.get("batchUserIds") ?? ""));

    try {
      await apiPost(`/api/groups/${selectedGroupId}/batch-invites`, { invitedUserIds });
      await refreshInvites(selectedGroupId);
      setSuccess("Batch invites sent.");
      event.currentTarget.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send batch invites");
    }
  };

  const onRevokeInvite = async (inviteId: string) => {
    setError("");
    setSuccess("");

    try {
      await apiPost(`/api/invites/${inviteId}/revoke`, {});
      if (selectedGroupId) {
        await refreshInvites(selectedGroupId);
      }
      setSuccess("Invite revoked.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke invite");
    }
  };

  const onChangeRole = async (targetUserId: string, role: GroupMember["role"]) => {
    if (!selectedGroupId) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await apiPatch(`/api/groups/${selectedGroupId}/members/${targetUserId}/role`, { role });
      await refreshMembers(selectedGroupId);
      setSuccess("Role updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    }
  };

  const onRemoveMember = async (targetUserId: string) => {
    if (!selectedGroupId) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await apiDelete(`/api/groups/${selectedGroupId}/members/${targetUserId}`);
      await refreshMembers(selectedGroupId);
      setSuccess("Member removed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove member");
    }
  };

  const pendingForMe = settlements.filter((entry) => entry.status === "pending_receiver" && entry.toUserId === userId);

  return (
    <section className="grid gap-5 lg:grid-cols-3">
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} />
          <h3 className="text-lg font-semibold">Groups and Policy</h3>
        </div>

        <form className="space-y-3" onSubmit={onCreateGroup}>
          <TextField name="name" label="New group name" placeholder="Summer Trip 2026" required />
          <TextField name="baseCurrency" label="Currency" defaultValue="EUR" required />
          <Button type="submit" className="w-full">
            Create group
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Active group</label>
          <select
            value={selectedGroupId}
            onChange={(event) => setSelectedGroupId(event.target.value)}
            className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.baseCurrency})
              </option>
            ))}
          </select>
        </div>

        {policy && selectedGroup && (
          <div className="mt-4 space-y-3 rounded-xl bg-black/5 p-3 text-sm">
            <label className="flex items-center justify-between gap-3">
              <span>Members can invite</span>
              <input
                type="checkbox"
                checked={policy.canMembersInvite}
                onChange={(event) => setPolicy({ ...policy, canMembersInvite: event.target.checked })}
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Editors can add expenses</span>
              <input
                type="checkbox"
                checked={policy.canEditorsAddExpense}
                onChange={(event) => setPolicy({ ...policy, canEditorsAddExpense: event.target.checked })}
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Moderators can add expenses</span>
              <input
                type="checkbox"
                checked={policy.canModeratorsAddExpense}
                onChange={(event) => setPolicy({ ...policy, canModeratorsAddExpense: event.target.checked })}
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Visibility mode</span>
              <select
                className="rounded-md border border-black/15 bg-white px-2 py-1"
                value={policy.visibilityMode}
                onChange={(event) =>
                  setPolicy({
                    ...policy,
                    visibilityMode: event.target.value as GroupPolicy["visibilityMode"],
                  })
                }
              >
                <option value="transparent">Transparent</option>
                <option value="hybrid">Hybrid</option>
                <option value="private">Private</option>
              </select>
            </label>
            <Button className="w-full" onClick={onSavePolicy}>
              <Shield size={16} className="mr-2" />
              Save policy
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <UserPlus size={18} />
          <h3 className="text-lg font-semibold">Invites</h3>
        </div>

        <form className="space-y-3" onSubmit={onInviteSingle}>
          <TextField name="invitedUserId" label="Invite one user (id)" placeholder="user-id" required />
          <Button type="submit" className="w-full">
            Send invite
          </Button>
        </form>

        <form className="mt-4 space-y-3" onSubmit={onInviteBatch}>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Batch user ids (comma separated)</span>
            <textarea
              name="batchUserIds"
              className="min-h-16 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm"
              placeholder="userA,userB,userC"
            />
          </label>
          <Button type="submit" variant="ghost" className="w-full">
            Send batch invites
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold">Pending invites</p>
          {invites.filter((x) => x.status === "pending").length === 0 && (
            <p className="text-sm text-(--text-muted)">No pending invites.</p>
          )}
          {invites
            .filter((x) => x.status === "pending")
            .map((invite) => (
              <div key={invite._id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
                <p>
                  <strong>{invite.invitedUserId}</strong> invited by {invite.invitedByUserId}
                </p>
                <Button className="mt-2" variant="ghost" onClick={() => onRevokeInvite(invite._id)}>
                  Revoke
                </Button>
              </div>
            ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Coins size={18} />
          <h3 className="text-lg font-semibold">Create Expense</h3>
        </div>

        <form className="space-y-3" onSubmit={onCreateExpense}>
          <TextField name="title" label="Title" placeholder="Dinner" required />
          <TextField name="paidByUserId" label="Paid by user id" placeholder="user-id" required />
          <TextField name="totalAmount" label="Total amount" type="number" step="0.01" required />

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Split type</span>
            <select name="splitType" className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm">
              <option value="equal">Equal</option>
              <option value="percentage">Percentage</option>
              <option value="custom">Custom amount</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Equal participants (comma separated user ids)</span>
            <textarea
              name="equalParticipants"
              className="min-h-16 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm"
              placeholder="userA,userB,userC"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Advanced split lines for percentage/custom</span>
            <textarea
              name="advancedSplit"
              className="min-h-24 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm"
              placeholder={"userA:40\nuserB:35\nuserC:25"}
            />
          </label>

          <Button type="submit" className="w-full">
            Create expense
          </Button>
        </form>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <UserCog size={18} />
          <h3 className="text-lg font-semibold">Members and Roles</h3>
        </div>

        <div className="space-y-3">
          {members.length === 0 && <p className="text-sm text-(--text-muted)">No members loaded.</p>}

          {members.map((member) => (
            <div key={member.id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
              <p>
                <strong>{member.userId}</strong>
              </p>
              <p className="text-xs text-(--text-muted)">added by {member.addedByUserId}</p>

              <div className="mt-3 flex items-center gap-2">
                <select
                  className="rounded-md border border-black/15 bg-white px-2 py-1"
                  value={member.role}
                  onChange={(event) => onChangeRole(member.userId, event.target.value as GroupMember["role"])}
                >
                  <option value="admin">admin</option>
                  <option value="moderator">moderator</option>
                  <option value="editor">editor</option>
                  <option value="viewer">viewer</option>
                </select>

                <Button
                  variant="ghost"
                  onClick={() => onRemoveMember(member.userId)}
                  disabled={member.userId === userId}
                >
                  <Trash2 size={16} className="mr-2" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <HandCoins size={18} />
          <h3 className="text-lg font-semibold">Settlement Inbox</h3>
        </div>

        <p className="mb-3 text-sm text-(--text-muted)">
          Pending confirmations for you: {pendingForMe.length}
        </p>

        <div className="space-y-3">
          {pendingForMe.length === 0 && <p className="text-sm text-(--text-muted)">No pending confirmations.</p>}

          {pendingForMe.map((item) => (
            <div key={item._id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
              <p>
                <strong>{item.fromUserId}</strong> says they sent <strong>{item.amount.toFixed(2)}</strong>
              </p>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => onSettlementAction(item._id, "confirm")}>
                  <CheckCircle2 size={16} className="mr-2" /> Confirm
                </Button>
                <Button variant="ghost" onClick={() => onSettlementAction(item._id, "decline")}>
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {(error || success) && (
        <div className="lg:col-span-3">
          {error && <p className="rounded-xl bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">{error}</p>}
          {success && <p className="rounded-xl bg-(--brand)/10 px-3 py-2 text-sm text-(--brand)">{success}</p>}
        </div>
      )}
    </section>
  );
};
