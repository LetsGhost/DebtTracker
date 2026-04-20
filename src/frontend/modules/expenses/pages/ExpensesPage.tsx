"use client";

import { FormEvent, useEffect, useState } from "react";
import { Coins } from "lucide-react";

import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";
import { TextField } from "@/frontend/shared/components/TextField";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";
import { apiGet, apiPost } from "@/frontend/shared/lib/api-client";

type Group = { id: string; name: string; baseCurrency: string };

const parseList = (raw: string) => raw.split(",").map((x) => x.trim()).filter(Boolean);
const parseKeyValueLines = (raw: string) =>
  raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [userId, value] = line.split(":").map((x) => x.trim());
      return { userId, value: Number(value) };
    })
    .filter((x) => x.userId && !Number.isNaN(x.value));

export const ExpensesPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void apiGet<Group[]>("/api/groups")
      .then((result) => {
        setGroups(result);
        if (result.length > 0) setSelectedGroupId(result[0].id);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load groups"));
  }, []);

  const onCreateExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGroupId) {
      setError("Select a group first.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const splitType = String(form.get("splitType") ?? "equal") as "equal" | "percentage" | "custom";
    const participants =
      splitType === "equal"
        ? parseList(String(form.get("equalParticipants") ?? "")).map((userId) => ({ userId }))
        : parseKeyValueLines(String(form.get("advancedSplit") ?? "")).map((item) =>
            splitType === "percentage"
              ? { userId: item.userId, sharePercent: item.value }
              : { userId: item.userId, shareAmount: item.value },
          );

    setError("");

    try {
      await apiPost(`/api/groups/${selectedGroupId}/expenses`, {
        title: String(form.get("title") ?? "").trim(),
        paidByUserId: String(form.get("paidByUserId") ?? "").trim(),
        totalAmount: Number(form.get("totalAmount") ?? 0),
        splitType,
        expenseDate: new Date().toISOString(),
        participants,
      });
      setMessage("Expense created.");
      event.currentTarget.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create expense");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="space-y-4 rounded-2xl border border-black/10 bg-(--surface) p-5">
        <div>
          <h1 className="text-2xl font-bold">Expenses Module</h1>
          <p className="text-sm text-(--text-muted)">Create split expenses with equal, percentage, or custom modes.</p>
        </div>
        <ModuleNav />
      </header>

      <Card>
        <div className="mb-4 flex items-center gap-2"><Coins size={18} /><h3 className="text-lg font-semibold">Create Expense</h3></div>

        <div className="mb-3">
          <label className="text-sm font-medium">Active group</label>
          <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm">
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.baseCurrency})</option>)}
          </select>
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
            <textarea name="equalParticipants" className="min-h-16 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm" placeholder="userA,userB,userC" />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Advanced split (user:value per line)</span>
            <textarea name="advancedSplit" className="min-h-24 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm" placeholder={"userA:40\nuserB:35\nuserC:25"} />
          </label>

          <Button type="submit" className="w-full">Create expense</Button>
        </form>
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
