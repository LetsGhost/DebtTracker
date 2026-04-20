"use client";

import { useEffect, useState } from "react";

import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";
import { TextField } from "@/frontend/shared/components/TextField";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/frontend/shared/lib/api-client";

type Group = { id: string; name: string; myRole: "admin" | "moderator" | "editor" | "viewer"; isAdmin: boolean };
type GroupMember = { id: string; userId: string; displayName: string; email: string; role: "admin" | "moderator" | "editor" | "viewer"; addedByUserId: string };
type GroupInvite = { _id: string; invitedUserId: string; invitedUserDisplayName?: string; invitedUserEmail?: string; status: "pending" | "accepted" | "rejected" | "revoked" | "expired" };
type GroupPolicy = {
  canMembersInvite: boolean;
  canEditorsAddExpense: boolean;
  canModeratorsAddExpense: boolean;
  visibilityMode: "transparent" | "private" | "hybrid";
};

type GroupEditPageProps = { groupId: string };
type UserOption = { id: string; displayName: string; email: string };

export const GroupEditPage = ({ groupId }: GroupEditPageProps) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [policy, setPolicy] = useState<GroupPolicy | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [groupResult, membersResult, invitesResult, policyResult] = await Promise.all([
      apiGet<Group>(`/api/groups/${groupId}`),
      apiGet<GroupMember[]>(`/api/groups/${groupId}/members`),
      apiGet<GroupInvite[]>(`/api/groups/${groupId}/invites`),
      apiGet<GroupPolicy>(`/api/groups/${groupId}/policy`),
    ]);

    setGroup(groupResult);
    setMembers(membersResult);
    setInvites(invitesResult);
    setPolicy(policyResult);
  };

  useEffect(() => {
    void load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load edit data"));
  }, [groupId]);

  useEffect(() => {
    if (userQuery.trim().length < 2) {
      setUserResults([]);
      return;
    }

    let active = true;
    void apiGet<UserOption[]>(`/api/users?query=${encodeURIComponent(userQuery)}`)
      .then((users) => {
        if (!active) return;
        setUserResults(users);
      })
      .catch(() => {
        if (!active) return;
        setUserResults([]);
      });

    return () => {
      active = false;
    };
  }, [userQuery]);

  const onInvite = async (invitedUserId: string) => {
    try {
      await apiPost(`/api/groups/${groupId}/invites`, { invitedUserId });
      await load();
      setMessage("Invite created.");
      setUserQuery("");
      setUserResults([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to invite");
    }
  };

  const onRevoke = async (inviteId: string) => {
    try {
      await apiPost(`/api/invites/${inviteId}/revoke`, {});
      await load();
      setMessage("Invite revoked.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke");
    }
  };

  const onUpdateRole = async (userId: string, role: GroupMember["role"]) => {
    try {
      await apiPatch(`/api/groups/${groupId}/members/${userId}/role`, { role });
      await load();
      setMessage("Role updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    }
  };

  const onRemoveMember = async (userId: string) => {
    try {
      await apiDelete(`/api/groups/${groupId}/members/${userId}`);
      await load();
      setMessage("Member removed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove member");
    }
  };

  const onSavePolicy = async () => {
    if (!policy) return;

    try {
      await apiPatch(`/api/groups/${groupId}/policy`, policy);
      setMessage("Policy saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save policy");
    }
  };

  const onDeleteGroup = async () => {
    try {
      await apiDelete(`/api/groups/${groupId}`);
      window.location.href = "/groups";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete group");
    }
  };

  if (group && !group.isAdmin) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8">
        <Card>
          <h1 className="text-2xl font-bold">Admin Only</h1>
          <p className="mt-2 text-sm text-(--text-muted)">Only group admins can access this page.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 md:py-8">
      <header className="space-y-4 rounded-2xl border border-black/10 bg-(--surface) p-4 md:p-5">
        <div>
          <h1 className="text-2xl font-bold">Edit Group: {group?.name ?? "..."}</h1>
          <p className="text-sm text-(--text-muted)">Admin settings, invites, members, and deletion.</p>
        </div>
        <ModuleNav />
      </header>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Policy</h2>
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
              <Button onClick={onSavePolicy}>Save policy</Button>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">Create Invite</h2>
          <div className="space-y-3">
            <TextField
              name="userSearch"
              label="Search users"
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
              placeholder="Type name or email"
            />
            {userResults.length > 0 && (
              <div className="space-y-2 rounded-xl border border-black/10 bg-black/5 p-2">
                {userResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                    <div>
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-xs text-(--text-muted)">{user.email}</p>
                    </div>
                    <Button type="button" onClick={() => onInvite(user.id)}>Invite</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold">Pending</p>
            {invites.filter((x) => x.status === "pending").map((invite) => {
              const display = invite.invitedUserDisplayName || invite.invitedUserEmail || invite.invitedUserId;
              return (
                <div key={invite._id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
                  <p className="font-semibold">{display}</p>
                  <Button className="mt-2" variant="ghost" onClick={() => onRevoke(invite._id)}>Revoke</Button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">Danger Zone</h2>
          <p className="mb-3 text-sm text-(--text-muted)">Delete group and archive related membership history.</p>
          <Button variant="ghost" onClick={onDeleteGroup}>Delete Group</Button>
        </Card>
      </section>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Members</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            const display = member.displayName || member.email || member.userId;
            return (
              <div key={member.id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
                <p className="font-semibold">{display}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <select value={member.role} onChange={(e) => onUpdateRole(member.userId, e.target.value as GroupMember["role"])} className="rounded-md border border-black/15 bg-white px-2 py-1">
                    <option value="admin">admin</option>
                    <option value="moderator">moderator</option>
                    <option value="editor">editor</option>
                    <option value="viewer">viewer</option>
                  </select>
                  <Button variant="ghost" onClick={() => onRemoveMember(member.userId)}>Remove</Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {(message || error) && (
        <div>
          {message && <p className="rounded-xl bg-(--brand)/10 px-3 py-2 text-sm text-(--brand)">{message}</p>}
          {error && <p className="rounded-xl bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">{error}</p>}
        </div>
      )}
    </main>
  );
};
