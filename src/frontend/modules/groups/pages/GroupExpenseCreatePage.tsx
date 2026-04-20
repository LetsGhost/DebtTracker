"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";
import { TextField } from "@/frontend/shared/components/TextField";
import { apiGet, apiPost } from "@/frontend/shared/lib/api-client";

type SplitType = "equal" | "percentage" | "custom";
type Member = { id: string; userId: string; email: string; displayName: string; role: string };

type GroupExpenseCreatePageProps = { groupId: string; userId: string };

const parseKeyValueLines = (raw: string) =>
  raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [userEmail, value] = line.split(":").map((x) => x.trim());
      return { userEmail, value: Number(value) };
    })
    .filter((x) => x.userEmail && !Number.isNaN(x.value));

export const GroupExpenseCreatePage = ({ groupId, userId }: GroupExpenseCreatePageProps) => {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [paidByEmail, setPaidByEmail] = useState("");
  const [selectedParticipantEmails, setSelectedParticipantEmails] = useState<string[]>([]);
  const [advancedSplit, setAdvancedSplit] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void apiGet<Member[]>(`/api/groups/${groupId}/members`)
      .then((result) => {
        setMembers(result);
        const selfMember = result.find((m) => m.userId === userId);
        if (selfMember && selfMember.email) {
          setPaidByEmail(selfMember.email);
          setSelectedParticipantEmails(result.map((m) => m.email || m.userId).filter(Boolean));
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load members"));
  }, [groupId, userId]);

  const filteredMembers = useMemo(() => {
    const q = memberFilter.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (member) =>
        member.userId.toLowerCase().includes(q) ||
        (member.email && member.email.toLowerCase().includes(q))
    );
  }, [memberFilter, members]);

  const toggleParticipant = (email: string) => {
    setSelectedParticipantEmails((current) =>
      current.includes(email) ? current.filter((e) => e !== email) : [...current, email]
    );
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      let participants: Array<{ userId?: string; email?: string; sharePercent?: number; shareAmount?: number }>;

      if (splitType === "equal") {
        participants = selectedParticipantEmails.map((email) => {
          const member = members.find((m) => m.email === email || m.userId === email);
          return { userId: member?.userId, email };
        });
      } else {
        const parsed = parseKeyValueLines(advancedSplit);
        participants = parsed.map((row) =>
          splitType === "percentage"
            ? { email: row.userEmail, sharePercent: row.value }
            : { email: row.userEmail, shareAmount: row.value }
        );
      }

      if (participants.length < 2) {
        setError("At least two participants are required.");
        return;
      }

      if (!paidByEmail) {
        setError("Select who paid first.");
        return;
      }

      const paidByMember = members.find((m) => m.email === paidByEmail || m.userId === paidByEmail);

      await apiPost(`/api/groups/${groupId}/expenses`, {
        title: String(form.get("title") ?? "").trim(),
        paidByUserId: paidByMember?.userId || paidByEmail,
        totalAmount: Number(form.get("totalAmount") ?? 0),
        splitType,
        expenseDate: new Date().toISOString(),
        participants: participants.map((p) => ({ userId: p.userId || p.email })),
      });

      router.push(`/groups/${groupId}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create expense");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-6 md:py-8">
      <header className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <div className="flex items-center gap-3">
          <Link href={`/groups/${groupId}`} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create Expense</h1>
            <p className="text-sm text-gray-500">Add a new expense to split with group members.</p>
          </div>
        </div>
      </header>

      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          <TextField name="title" label="Expense title" placeholder="Dinner, groceries, rent..." required />
          <TextField name="totalAmount" label="Total amount" type="number" step="0.01" placeholder="0.00" required />

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Paid by</span>
            <select
              value={paidByEmail}
              onChange={(event) => setPaidByEmail(event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select member...</option>
              {members.map((member) => {
                const display = member.displayName || member.email || member.userId;
                return (
                  <option key={member.id} value={member.email}>
                    {display}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Split type</span>
            <select
              value={splitType}
              onChange={(event) => setSplitType(event.target.value as SplitType)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="equal">Equal split</option>
              <option value="percentage">Percentage</option>
              <option value="custom">Custom amounts</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Find participants</span>
            <input
              value={memberFilter}
              onChange={(event) => setMemberFilter(event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              placeholder="Search by name or email"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Participants</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {filteredMembers.map((member) => {
                const display = member.displayName || member.email || member.userId;
                const checked = selectedParticipantEmails.includes(member.email);
                return (
                  <label key={member.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleParticipant(member.email)}
                      className="rounded"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{display}</span>
                      {member.email && (
                        <span className="text-xs text-gray-500">{member.email}</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </label>

          {splitType !== "equal" && (
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>{splitType === "percentage" ? "Percentage split" : "Custom amounts"} (email:value per line)</span>
              <textarea
                value={advancedSplit}
                onChange={(event) => setAdvancedSplit(event.target.value)}
                className="min-h-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                placeholder="user@email.com:50"
              />
            </label>
          )}

          <Button type="submit" className="w-full">Create expense</Button>
        </form>
      </Card>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
    </main>
  );
};
