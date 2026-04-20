"use client";

import { FormEvent, useEffect, useState } from "react";
import { Shield, Trash2, UserCog, UserPlus, Users } from "lucide-react";

import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";
import { TextField } from "@/frontend/shared/components/TextField";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/frontend/shared/lib/api-client";

type Group = { id: string; name: string; baseCurrency: string };
type GroupMember = { id: string; userId: string; role: "admin" | "moderator" | "editor" | "viewer"; addedByUserId: string };
type GroupInvite = { _id: string; invitedUserId: string; invitedByUserId: string; status: "pending" | "accepted" | "rejected" | "revoked" | "expired" };
type GroupPolicy = {
  canMembersInvite: boolean;
  canEditorsAddExpense: boolean;
  canModeratorsAddExpense: boolean;
  visibilityMode: "transparent" | "private" | "hybrid";
};

const parseList = (raw: string) => raw.split(",").map((x) => x.trim()).filter(Boolean);

export const GroupsPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [policy, setPolicy] = useState<GroupPolicy | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refreshGroups = async () => {
    const result = await apiGet<Group[]>("/api/groups");
    setGroups(result);
    if (result.length > 0 && !selectedGroupId) {
      setSelectedGroupId(result[0].id);
    }
  };

  const refreshGroupData = async (groupId: string) => {
    const [membersResult, invitesResult, policyResult] = await Promise.all([
      apiGet<GroupMember[]>(`/api/groups/${groupId}/members`),
      apiGet<GroupInvite[]>(`/api/groups/${groupId}/invites`),
      apiGet<GroupPolicy>(`/api/groups/${groupId}/policy`),
    ]);

    setMembers(membersResult);
    setInvites(invitesResult);
    setPolicy(policyResult);
  };

  useEffect(() => {
    void refreshGroups().catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load groups"));
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;
    void refreshGroupData(selectedGroupId).catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load group data"));
  }, [selectedGroupId]);

  const onCreateGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const created = await apiPost<Group>("/api/groups", {
        name: String(form.get("name") ?? "").trim(),
        baseCurrency: String(form.get("baseCurrency") ?? "EUR").trim().toUpperCase(),
      });
      await refreshGroups();
      setSelectedGroupId(created.id);
      setMessage("Group created.");
      event.currentTarget.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create group");
    }
  };

  const onInviteOne = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGroupId) return;

    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await apiPost(`/api/groups/${selectedGroupId}/invites`, { invitedUserId: String(form.get("invitedUserId") ?? "").trim() });
      await refreshGroupData(selectedGroupId);
      setMessage("Invite sent.");
      event.currentTarget.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send invite");
    }
  };

  const onInviteBatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGroupId) return;

    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await apiPost(`/api/groups/${selectedGroupId}/batch-invites`, {
        invitedUserIds: parseList(String(form.get("batchUserIds") ?? "")),
      });
      await refreshGroupData(selectedGroupId);
      setMessage("Batch invites sent.");
      event.currentTarget.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send batch invites");
    }
  };

  const onRevokeInvite = async (inviteId: string) => {
    if (!selectedGroupId) return;
    setError("");
    try {
      await apiPost(`/api/invites/${inviteId}/revoke`, {});
      await refreshGroupData(selectedGroupId);
      setMessage("Invite revoked.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke invite");
    }
  };

  const onRoleChange = async (targetUserId: string, role: GroupMember["role"]) => {
    if (!selectedGroupId) return;
    setError("");
    try {
      await apiPatch(`/api/groups/${selectedGroupId}/members/${targetUserId}/role`, { role });
      await refreshGroupData(selectedGroupId);
      setMessage("Role updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    }
  };

  const onRemoveMember = async (targetUserId: string) => {
    if (!selectedGroupId) return;
    setError("");
    try {
      await apiDelete(`/api/groups/${selectedGroupId}/members/${targetUserId}`);
      await refreshGroupData(selectedGroupId);
      setMessage("Member removed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove member");
    }
  };

  const onSavePolicy = async () => {
    if (!selectedGroupId || !policy) return;
    setError("");

    try {
      await apiPatch(`/api/groups/${selectedGroupId}/policy`, policy);
      setMessage("Policy updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update policy");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="space-y-4 rounded-2xl border border-black/10 bg-(--surface) p-5">
        <div>
          <h1 className="text-2xl font-bold">Groups Module</h1>
          <p className="text-sm text-(--text-muted)">Manage groups, invites, members, and permissions.</p>
        </div>
        <ModuleNav />
      </header>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <div className="mb-4 flex items-center gap-2"><Users size={18} /><h3 className="text-lg font-semibold">Create Group</h3></div>
          <form className="space-y-3" onSubmit={onCreateGroup}>
            <TextField name="name" label="Group name" placeholder="Trip Friends" required />
            <TextField name="baseCurrency" label="Currency" defaultValue="EUR" required />
            <Button type="submit" className="w-full">Create group</Button>
          </form>

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Active group</label>
            <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm">
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.baseCurrency})</option>)}
            </select>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2"><UserPlus size={18} /><h3 className="text-lg font-semibold">Invites</h3></div>
          <form className="space-y-3" onSubmit={onInviteOne}>
            <TextField name="invitedUserId" label="Invite one user id" placeholder="user-id" required />
            <Button type="submit" className="w-full">Send invite</Button>
          </form>
          <form className="mt-4 space-y-3" onSubmit={onInviteBatch}>
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>Batch user ids</span>
              <textarea name="batchUserIds" className="min-h-16 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm" placeholder="user1,user2,user3" />
            </label>
            <Button type="submit" variant="ghost" className="w-full">Send batch invites</Button>
          </form>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold">Pending invites</p>
            {invites.filter((x) => x.status === "pending").map((invite) => (
              <div key={invite._id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
                <p><strong>{invite.invitedUserId}</strong></p>
                <Button className="mt-2" variant="ghost" onClick={() => onRevokeInvite(invite._id)}>Revoke</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2"><Shield size={18} /><h3 className="text-lg font-semibold">Policy</h3></div>
          {policy && (
            <div className="space-y-3 rounded-xl bg-black/5 p-3 text-sm">
              <label className="flex items-center justify-between"><span>Members can invite</span><input type="checkbox" checked={policy.canMembersInvite} onChange={(e) => setPolicy({ ...policy, canMembersInvite: e.target.checked })} /></label>
              <label className="flex items-center justify-between"><span>Editors can add expenses</span><input type="checkbox" checked={policy.canEditorsAddExpense} onChange={(e) => setPolicy({ ...policy, canEditorsAddExpense: e.target.checked })} /></label>
              <label className="flex items-center justify-between"><span>Moderators can add expenses</span><input type="checkbox" checked={policy.canModeratorsAddExpense} onChange={(e) => setPolicy({ ...policy, canModeratorsAddExpense: e.target.checked })} /></label>
              <label className="flex items-center justify-between">
                <span>Visibility mode</span>
                <select value={policy.visibilityMode} onChange={(e) => setPolicy({ ...policy, visibilityMode: e.target.value as GroupPolicy["visibilityMode"] })} className="rounded-md border border-black/15 bg-white px-2 py-1">
                  <option value="transparent">transparent</option>
                  <option value="hybrid">hybrid</option>
                  <option value="private">private</option>
                </select>
              </label>
              <Button className="w-full" onClick={onSavePolicy}>Save policy</Button>
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-5">
        <Card>
          <div className="mb-4 flex items-center gap-2"><UserCog size={18} /><h3 className="text-lg font-semibold">Members and Roles</h3></div>
          <div className="grid gap-3 md:grid-cols-2">
            {members.map((member) => (
              <div key={member.id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
                <p><strong>{member.userId}</strong></p>
                <p className="text-xs text-(--text-muted)">added by {member.addedByUserId}</p>
                <div className="mt-3 flex items-center gap-2">
                  <select value={member.role} onChange={(e) => onRoleChange(member.userId, e.target.value as GroupMember["role"])} className="rounded-md border border-black/15 bg-white px-2 py-1">
                    <option value="admin">admin</option>
                    <option value="moderator">moderator</option>
                    <option value="editor">editor</option>
                    <option value="viewer">viewer</option>
                  </select>
                  <Button variant="ghost" onClick={() => onRemoveMember(member.userId)}><Trash2 size={16} className="mr-2" />Remove</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {(message || error) && (
        <div>
          {message && <p className="rounded-xl bg-(--brand)/10 px-3 py-2 text-sm text-(--brand)">{message}</p>}
          {error && <p className="rounded-xl bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">{error}</p>}
        </div>
      )}
    </main>
  );
};
