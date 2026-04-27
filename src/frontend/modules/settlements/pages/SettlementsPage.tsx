"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { CheckCircle2, HandCoins } from "lucide-react";

import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";
import { TextField } from "@/frontend/shared/components/TextField";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";
import { apiGet, apiPost } from "@/frontend/shared/lib/api-client";

type Group = { id: string; name: string; baseCurrency: string };
type Settlement = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  fromUserDisplayName?: string;
  fromUserEmail?: string;
  toUserDisplayName?: string;
  toUserEmail?: string;
  amount: number;
  status: "pending_receiver" | "confirmed" | "declined";
};

type Member = {
  id: string;
  userId: string;
  displayName: string;
  email: string;
};

type SettlementsPageProps = {
  userId: string;
};

export const SettlementsPage = ({ userId }: SettlementsPageProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedReceiverId, setSelectedReceiverId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refreshSettlements = useCallback(async (groupId: string) => {
    const result = await apiGet<Settlement[]>(`/api/groups/${groupId}/settlements`);
    setSettlements(result);
  }, []);

  const loadGroupData = useCallback(async (groupId: string) => {
    const [settlementsResult, membersResult] = await Promise.all([
      apiGet<Settlement[]>(`/api/groups/${groupId}/settlements`),
      apiGet<Member[]>(`/api/groups/${groupId}/members`),
    ]);

    setSettlements(settlementsResult);
    setMembers(membersResult);

    const firstOtherMember = membersResult.find((member) => member.userId !== userId);
    setSelectedReceiverId(firstOtherMember?.userId ?? "");
  }, [userId]);

  useEffect(() => {
    void (async () => {
      try {
        const result = await apiGet<Group[]>("/api/groups");
        setGroups(result);
        if (result.length > 0) {
          setSelectedGroupId(result[0].id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load groups");
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;
    void (async () => {
      try {
        await loadGroupData(selectedGroupId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load settlements");
      }
    })();
  }, [loadGroupData, selectedGroupId]);

  const onCreateSettlement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGroupId) return;

    const form = new FormData(event.currentTarget);
    setError("");

    try {
      if (!selectedReceiverId) {
        setError("Please select a receiver.");
        return;
      }

      await apiPost(`/api/groups/${selectedGroupId}/settlements`, {
        toUserId: selectedReceiverId,
        amount: Number(form.get("amount") ?? 0),
      });
      await refreshSettlements(selectedGroupId);
      setMessage("Settlement request created.");
      event.currentTarget.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create settlement request");
    }
  };

  const onSettlementAction = async (settlementId: string, action: "confirm" | "decline") => {
    if (!selectedGroupId) return;

    setError("");
    try {
      if (action === "confirm") {
        await apiPost(`/api/groups/${selectedGroupId}/settlements/${settlementId}/confirm-received`, {});
      } else {
        await apiPost(`/api/groups/${selectedGroupId}/settlements/${settlementId}/decline`, { reason: "Not received yet" });
      }
      await refreshSettlements(selectedGroupId);
      setMessage(action === "confirm" ? "Settlement confirmed." : "Settlement declined.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process settlement");
    }
  };

  const pendingForMe = settlements.filter((entry) => entry.status === "pending_receiver" && entry.toUserId === userId);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="space-y-4 rounded-2xl border border-black/10 bg-(--surface) p-5">
        <div>
          <h1 className="text-2xl font-bold">Settlements Module</h1>
          <p className="text-sm text-(--text-muted)">Track requests and confirm when money arrives.</p>
        </div>
        <ModuleNav />
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2"><HandCoins size={18} /><h3 className="text-lg font-semibold">Create Request</h3></div>
          <div className="mb-3">
            <label className="text-sm font-medium">Active group</label>
            <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm">
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.baseCurrency})</option>)}
            </select>
          </div>
          <form className="space-y-3" onSubmit={onCreateSettlement}>
            <label className="text-sm font-medium">
              Receiver
              <select
                value={selectedReceiverId}
                onChange={(event) => setSelectedReceiverId(event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm"
                required
              >
                {members
                  .filter((member) => member.userId !== userId)
                  .map((member) => (
                    <option key={member.id} value={member.userId}>
                      {member.displayName || member.email || "Unknown member"}
                      {member.email ? ` (${member.email})` : ""}
                    </option>
                  ))}
              </select>
            </label>
            <TextField name="amount" label="Amount" type="number" step="0.01" required />
            <Button type="submit" className="w-full">Create settlement request</Button>
          </form>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2"><CheckCircle2 size={18} /><h3 className="text-lg font-semibold">Inbox</h3></div>
          <p className="mb-3 text-sm text-(--text-muted)">Pending confirmations for you: {pendingForMe.length}</p>
          <div className="space-y-3">
            {pendingForMe.length === 0 && <p className="text-sm text-(--text-muted)">No pending confirmations.</p>}
            {pendingForMe.map((item) => (
              <div key={item._id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
                <p>
                  <strong>{item.fromUserDisplayName || item.fromUserEmail || "A group member"}</strong>
                  {item.fromUserEmail ? ` (${item.fromUserEmail})` : ""} says they sent <strong>{item.amount.toFixed(2)}</strong>
                </p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => onSettlementAction(item._id, "confirm")}>Confirm</Button>
                  <Button variant="ghost" onClick={() => onSettlementAction(item._id, "decline")}>Decline</Button>
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
